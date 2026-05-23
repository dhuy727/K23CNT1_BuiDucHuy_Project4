
checkLogin();
const user = getCurrentUser();
const checkoutForm = document.getElementById('checkoutForm');
if (checkoutForm) {
    checkoutForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const receiverName = document.getElementById('receiverName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        const paymentMethod = document.getElementById('paymentMethod').value;
        if (!receiverName || !phone || !address) { showToast('Vui lòng nhập đầy đủ thông tin thanh toán', 'error'); return; }
        try {
            const result = await apiFetch(`${API_BASE_URL}/orders/checkout`, { method: 'POST', body: JSON.stringify({ user_id: user.id, receiver_name: receiverName, phone, address, payment_method: paymentMethod }) });
            if (result.success) { dispatchCartChanged(); showToast('Đặt hàng thành công', 'success'); setTimeout(() => { window.location.href = `payment-success.html?order_id=${result.order_id}`; }, 900); } else { showToast(result.message || 'Không thể đặt hàng', 'error'); }
        } catch (error) { console.error(error); showToast('Lỗi khi đặt hàng', 'error'); }
    });
}
