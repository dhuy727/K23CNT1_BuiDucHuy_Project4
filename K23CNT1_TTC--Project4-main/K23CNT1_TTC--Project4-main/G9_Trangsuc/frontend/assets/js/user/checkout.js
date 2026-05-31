checkLogin();
const user = getCurrentUser();
const checkoutForm = document.getElementById('checkoutForm');
const checkoutSummary = document.getElementById('checkoutSummary');

// ====== COUPON STATE ======
let appliedCoupon = null; // { code, discount_value, promotion_id }
let cartOriginalTotal = 0;

// Lấy danh sách giỏ hàng từ backend
async function getCartItemsFromBackend() {
    try {
        const result = await apiFetch(`${API_BASE_URL}/cart/${user.id}`);
        if (result.success && Array.isArray(result.data)) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error('Lỗi lấy giỏ hàng:', error);
        return [];
    }
}

// Lấy tổng tiền giỏ hàng từ backend
async function getCartTotalFromBackend() {
    const items = await getCartItemsFromBackend();
    return items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
}

async function loadCheckoutSummary() {
    if (!checkoutSummary) return;

    checkoutSummary.innerHTML = `<div class="text-muted">Đang tải sản phẩm...</div>`;

    try {
        const items = await getCartItemsFromBackend();

        if (!items.length) {
            checkoutSummary.innerHTML = `
                <div class="alert alert-light border mb-0">
                    Giỏ hàng của bạn đang trống.
                </div>
            `;
            return;
        }

        const total = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
        const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
        cartOriginalTotal = total;

        checkoutSummary.innerHTML = `
            <div class="small text-muted mb-2">Bạn đang mua ${totalQuantity} sản phẩm</div>
            <div class="d-grid gap-3">
                ${items.map(item => `
                    <div class="d-flex gap-3 align-items-start border rounded-4 p-3 bg-white">
                        <img
                            src="${escapeHtml(getImageUrl(item.image))}"
                            alt="${escapeHtml(item.product_name)}"
                            width="64"
                            height="64"
                            style="object-fit: cover; border-radius: 14px;"
                        >
                        <div class="flex-grow-1">
                            <div class="fw-bold mb-1">${escapeHtml(item.product_name)}</div>
                            <div class="small text-muted">Số lượng: ${escapeHtml(item.quantity)}</div>
                            <div class="small text-muted">Đơn giá: ${formatMoney(item.price)}</div>
                            <div class="fw-bold text-gold mt-1">Thành tiền: ${formatMoney(item.total)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <hr class="my-3">
            <div class="d-flex justify-content-between align-items-center">
                <span class="fw-bold">Tổng tiền</span>
                <span class="fw-bold fs-4 text-gold" id="checkoutTotalDisplay">${formatMoney(total)}</span>
            </div>
        `;

        // Re-apply coupon display if one is active
        updateCouponSummaryDisplay();
    } catch (error) {
        console.error(error);
        checkoutSummary.innerHTML = `
            <div class="alert alert-danger mb-0">
                Không tải được danh sách sản phẩm đã mua.
            </div>
        `;
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

// ====== COUPON FUNCTIONS ======
async function applyCouponCode() {
    const codeInput = document.getElementById('couponCode');
    const resultDiv = document.getElementById('couponResult');
    const applyBtn = document.getElementById('applyCouponBtn');
    const code = (codeInput?.value || '').trim().toUpperCase();

    if (!code) {
        showCouponResult('error', 'Vui lòng nhập mã giảm giá');
        codeInput?.classList.add('coupon-shake');
        setTimeout(() => codeInput?.classList.remove('coupon-shake'), 400);
        return;
    }

    if (cartOriginalTotal <= 0) {
        showCouponResult('error', 'Giỏ hàng trống, không thể áp mã giảm giá');
        return;
    }

    // Loading state
    applyBtn.disabled = true;
    applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Đang kiểm tra...';

    try {
        const result = await apiFetch(`${API_BASE_URL}/promotions/code/${encodeURIComponent(code)}`);

        if (!result.success || !result.data) {
            showCouponResult('error', result.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
            appliedCoupon = null;
            updateCouponSummaryDisplay();
            return;
        }

        const promo = result.data;

        // Check status
        if (promo.status !== 'Hoạt động') {
            showCouponResult('error', 'Mã giảm giá đã ngừng hoạt động');
            appliedCoupon = null;
            updateCouponSummaryDisplay();
            return;
        }

        // Check date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(promo.start_date);
        const endDate = new Date(promo.end_date);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        if (today < startDate || today > endDate) {
            showCouponResult('error', 'Mã giảm giá chưa có hiệu lực hoặc đã hết hạn');
            appliedCoupon = null;
            updateCouponSummaryDisplay();
            return;
        }

        const discountValue = Number(promo.discount_value || 0);
        if (discountValue <= 0) {
            showCouponResult('error', 'Mã giảm giá không có giá trị');
            appliedCoupon = null;
            updateCouponSummaryDisplay();
            return;
        }

        // Apply coupon
        appliedCoupon = {
            code: promo.code || code,
            discount_value: discountValue,
            promotion_id: promo.id
        };

        const actualDiscount = Math.min(discountValue, cartOriginalTotal);
        showCouponResult('success', `Áp dụng thành công mã <strong>${escapeHtml(appliedCoupon.code)}</strong> — Giảm ${formatMoney(actualDiscount)}`, true);
        updateCouponSummaryDisplay();
        showToast(`Áp dụng mã giảm giá thành công! Giảm ${formatMoney(actualDiscount)}`, 'success');

    } catch (error) {
        console.error('Lỗi áp mã giảm giá:', error);
        showCouponResult('error', 'Lỗi khi kiểm tra mã giảm giá. Vui lòng thử lại');
    } finally {
        applyBtn.disabled = false;
        applyBtn.innerHTML = '<i class="fas fa-check me-1"></i>Áp dụng';
    }
}

function removeCoupon() {
    appliedCoupon = null;
    const codeInput = document.getElementById('couponCode');
    if (codeInput) codeInput.value = '';
    hideCouponResult();
    updateCouponSummaryDisplay();
    showToast('Đã hủy mã giảm giá', 'info');
}

function showCouponResult(type, message, showRemove = false) {
    const resultDiv = document.getElementById('couponResult');
    if (!resultDiv) return;

    resultDiv.style.display = 'block';
    resultDiv.className = `coupon-result coupon-${type}`;

    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    const removeBtn = showRemove
        ? `<button class="coupon-remove-btn" onclick="removeCoupon()" title="Hủy mã"><i class="fas fa-times"></i></button>`
        : '';

    resultDiv.innerHTML = `
        <div class="d-flex align-items-center justify-content-between">
            <div><i class="fas ${icon} me-2"></i>${message}</div>
            ${removeBtn}
        </div>
    `;
}

function hideCouponResult() {
    const resultDiv = document.getElementById('couponResult');
    if (resultDiv) {
        resultDiv.style.display = 'none';
        resultDiv.innerHTML = '';
    }
}

function getDiscountAmount() {
    if (!appliedCoupon) return 0;
    return Math.min(appliedCoupon.discount_value, cartOriginalTotal);
}

function getFinalTotal() {
    return Math.max(0, cartOriginalTotal - getDiscountAmount());
}

function updateCouponSummaryDisplay() {
    const summaryDiv = document.getElementById('couponSummary');
    const originalDisplay = document.getElementById('originalTotalDisplay');
    const discountDisplay = document.getElementById('discountAmountDisplay');
    const finalDisplay = document.getElementById('finalTotalDisplay');
    const checkoutTotalDisplay = document.getElementById('checkoutTotalDisplay');

    if (appliedCoupon && cartOriginalTotal > 0) {
        const discount = getDiscountAmount();
        const finalTotal = getFinalTotal();

        if (summaryDiv) summaryDiv.style.display = 'block';
        if (originalDisplay) originalDisplay.textContent = formatMoney(cartOriginalTotal);
        if (discountDisplay) discountDisplay.textContent = `-${formatMoney(discount)}`;
        if (finalDisplay) finalDisplay.textContent = formatMoney(finalTotal);

        // Update the main total display
        if (checkoutTotalDisplay) {
            checkoutTotalDisplay.innerHTML = `<s class="text-muted" style="font-size:.85em;">${formatMoney(cartOriginalTotal)}</s> ${formatMoney(finalTotal)}`;
        }
    } else {
        if (summaryDiv) summaryDiv.style.display = 'none';
        if (checkoutTotalDisplay) {
            checkoutTotalDisplay.textContent = formatMoney(cartOriginalTotal);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadCheckoutSummary();

    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
    }

    // Coupon events
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', applyCouponCode);
    }

    const couponInput = document.getElementById('couponCode');
    if (couponInput) {
        couponInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyCouponCode();
            }
        });
    }
});
