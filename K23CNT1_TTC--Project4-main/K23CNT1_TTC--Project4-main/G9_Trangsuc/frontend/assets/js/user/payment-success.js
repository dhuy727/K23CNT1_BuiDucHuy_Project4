const params = new URLSearchParams(window.location.search);
const paypalOrderId = params.get('token');

async function cancelPaypalOrder(paypalOrderId) {
    const backendOrigin = getBackendOrigin();

    const response = await fetch(`${backendOrigin}/api/paypal/cancel`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            paypal_order_id: paypalOrderId
        })
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && data.success !== false) {
        dispatchCartChanged();
    }

    return data;
}

async function capturePaypalOrder(paypalOrderId) {
    const backendOrigin = getBackendOrigin();

    const response = await fetch(`${backendOrigin}/api/paypal/capture`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            paypal_order_id: paypalOrderId
        })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.status !== 'COMPLETED') {
        await cancelPaypalOrder(paypalOrderId);
        const message = data.message || data.name || 'Thanh toán PayPal chưa hoàn tất';
        throw new Error(message);
    }

    return data;
}

async function initPaypalCapture() {
    if (!paypalOrderId) return;

    const statusElement = document.getElementById('paypalCaptureStatus');
    if (statusElement) {
        statusElement.textContent = 'Đang xác nhận thanh toán PayPal...';
    }

    try {
        await capturePaypalOrder(paypalOrderId);
        if (statusElement) {
            statusElement.textContent = 'Thanh toán PayPal đã được xác nhận. Cảm ơn bạn!';
        }
        showToast('Thanh toán PayPal thành công', 'success');
    } catch (error) {
        console.error(error);
        if (statusElement) {
            statusElement.textContent = 'Thanh toán PayPal thất bại. Sản phẩm đã được trả lại giỏ hàng.';
        }
        showToast(error.message || 'Thanh toán PayPal thất bại', 'error');
    }
}

document.addEventListener('DOMContentLoaded', initPaypalCapture);
