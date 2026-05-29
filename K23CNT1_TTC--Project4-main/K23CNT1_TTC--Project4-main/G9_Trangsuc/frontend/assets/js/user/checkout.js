checkLogin();
const user = getCurrentUser();
const checkoutForm = document.getElementById('checkoutForm');

// Lấy tổng tiền giỏ hàng từ backend
async function getCartTotalFromBackend() {
    try {
        const result = await apiFetch(`${API_BASE_URL}/cart/${user.id}`);
        if (result.success && Array.isArray(result.data)) {
            return result.data.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
        }
        return 0;
    } catch (error) {
        console.error('Lỗi lấy giỏ hàng:', error);
        return 0;
    }
}

if (checkoutForm) {
    checkoutForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const receiverName = document.getElementById('receiverName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        const paymentMethod = document.getElementById('paymentMethod').value;

        if (!receiverName || !phone || !address) {
            showToast('Vui lòng nhập đầy đủ thông tin thanh toán', 'error');
            return;
        }

        // Kiểm tra giỏ hàng từ backend trước khi đặt hàng
        const cartTotal = await getCartTotalFromBackend();
        if (!cartTotal || cartTotal <= 0) {
            showToast('Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi đặt hàng', 'error');
            return;
        }

        if (paymentMethod === 'PAYPAL') {
            await handlePaypalPayment(user.id, receiverName, phone, address);
            return;
        }

        try {
            const result = await apiFetch(`${API_BASE_URL}/orders/checkout`, {
                method: 'POST',
                body: JSON.stringify({
                    user_id: user.id,
                    receiver_name: receiverName,
                    phone,
                    address,
                    payment_method: paymentMethod
                })
            });

            if (result.success) {
                dispatchCartChanged();
                showToast('Đặt hàng thành công', 'success');
                setTimeout(() => {
                    window.location.href = `payment-success.html?order_id=${result.order_id}`;
                }, 900);
            } else {
                showToast(result.message || 'Không thể đặt hàng', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Lỗi khi đặt hàng', 'error');
        }
    });
}

function getCartTotal() {
    const cart = getCart() || [];
    return cart.reduce((sum, item) => {
        const itemTotal = Number(item.total ?? (item.price * item.quantity ?? 0));
        return sum + (Number.isFinite(itemTotal) ? itemTotal : 0);
    }, 0);
}

async function handlePaypalPayment(userId, receiverName, phone, address) {
    const total = await getCartTotalFromBackend();
    if (!total || total <= 0) {
        showToast('Giỏ hàng đang trống hoặc tổng tiền không hợp lệ', 'error');
        return;
    }

    try {
        const result = await apiFetch(`${API_BASE_URL}/orders/checkout`, {
            method: 'POST',
            body: JSON.stringify({
                user_id: userId,
                receiver_name: receiverName,
                phone,
                address,
                payment_method: 'PAYPAL'
            })
        });

        if (!result.success) {
            showToast(result.message || 'Không thể tạo đơn hàng PayPal', 'error');
            return;
        }

        await paypalCheckout(result.order_id, result.total || total);
    } catch (error) {
        console.error(error);
        showToast('Lỗi PayPal. Vui lòng thử lại', 'error');
    }
}

async function cancelPendingPaypalOrder(orderId) {
    const backendOrigin = getBackendOrigin();

    try {
        const response = await fetch(`${backendOrigin}/api/paypal/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ order_id: orderId })
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.success !== false) {
            dispatchCartChanged();
        }
    } catch (error) {
        console.error('Không thể hủy đơn PayPal tạm:', error);
    }
}

async function paypalCheckout(orderId, total) {
    const backendOrigin = getBackendOrigin();
    const response = await fetch(`${backendOrigin}/api/paypal/create-order`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            order_id: orderId,
            total: total
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Không thể tạo đơn hàng PayPal';
        await cancelPendingPaypalOrder(orderId);
        showToast(errorMessage, 'error');
        return;
    }

    const data = await response.json();
    const approveLink = Array.isArray(data.links) ? data.links.find(link => link.rel === 'approve') : null;

    if (!approveLink) {
        console.error('PayPal create-order response:', data);
        await cancelPendingPaypalOrder(orderId);
        showToast('Không tìm thấy liên kết PayPal để duyệt thanh toán', 'error');
        return;
    }

    window.location.href = approveLink.href;
}
