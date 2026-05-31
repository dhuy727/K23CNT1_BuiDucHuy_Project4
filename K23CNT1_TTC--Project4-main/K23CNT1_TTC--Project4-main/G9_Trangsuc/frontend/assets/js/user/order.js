
async function loadMyOrders() {
    const user = getCurrentUser();
    const body = document.getElementById('order-body');
    if (!body || !user) return;
    body.innerHTML = `<tr><td colspan='8'><div class='skeleton' style='height: 60px;'></div></td></tr>`;
    try {
        const result = await apiFetch(`${API_BASE_URL}/orders/user/${user.id}`);
        const orders = Array.isArray(result.data) ? result.data : [];
        if (!orders.length) {
            body.innerHTML = `<tr><td colspan='8' class='text-center text-muted py-4'>Chưa có đơn hàng nào.</td></tr>`;
            return;
        }
        body.innerHTML = orders.map(order => `
            <tr>
                <td>${escapeHtml(order.id)}</td>
                <td>${escapeHtml(order.receiver || order.receiver_name || '')}</td>
                <td>${escapeHtml(order.phone || '')}</td>
                <td>${escapeHtml(order.address || '')}</td>
                <td class='text-gold fw-bold'>${formatMoney(order.total || order.total_amount || 0)}</td>
                <td><span class='badge badge-soft'>${escapeHtml(order.status || '')}</span></td>
                <td>${formatDateTime(order.createdAt || order.created_at || '')}</td>
                <td>
                    <a href="order-detail.html?id=${order.id}" class="btn btn-sm btn-outline-primary">Xem chi tiết</a>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error(error);
        body.innerHTML = `<tr><td colspan='8' class='text-center text-danger py-4'>Không tải được đơn hàng.</td></tr>`;
    }
}

async function loadOrderDetail() {
    const detailBody = document.getElementById('orderDetailBody');
    if (!detailBody) return; // not on order-detail.html page

    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    if (!orderId) {
        detailBody.innerHTML = `<tr><td colspan='4' class='text-center text-danger py-4'>Mã đơn hàng không hợp lệ.</td></tr>`;
        return;
    }

    try {
        const response = await apiFetch(`${API_BASE_URL}/orders/detail/${orderId}`);
        if (!response || !response.success || !response.data) {
            detailBody.innerHTML = `<tr><td colspan='4' class='text-center text-danger py-4'>Không tìm thấy thông tin đơn hàng.</td></tr>`;
            return;
        }

        const { order, items } = response.data;

        // Populate order info elements if they exist
        const elId = document.getElementById('order-id');
        const elDate = document.getElementById('order-date');
        const elStatus = document.getElementById('order-status');
        const elReceiver = document.getElementById('order-receiver');
        const elPhone = document.getElementById('order-phone');
        const elAddress = document.getElementById('order-address');
        const elTotal = document.getElementById('order-total');

        if (elId) elId.innerText = `#${order.id}`;
        if (elDate) elDate.innerText = formatDateTime(order.created_at || order.createdAt || '');
        if (elStatus) {
            elStatus.innerText = order.status || '';
            elStatus.className = 'badge';
            const statusLower = String(order.status).toLowerCase();
            if (statusLower.includes('chờ') || statusLower.includes('đang')) {
                elStatus.classList.add('bg-warning', 'text-dark');
            } else if (statusLower.includes('hoàn') || statusLower.includes('thành') || statusLower.includes('thanh toán')) {
                elStatus.classList.add('bg-success');
            } else if (statusLower.includes('hủy')) {
                elStatus.classList.add('bg-danger');
            } else {
                elStatus.classList.add('bg-secondary');
            }
        }
        if (elReceiver) elReceiver.innerText = order.receiver_name || order.receiver || '';
        if (elPhone) elPhone.innerText = order.phone || '';
        if (elAddress) elAddress.innerText = order.address || '';
        if (elTotal) elTotal.innerText = formatMoney(order.total || 0);

        // Populate items
        if (!items || !items.length) {
            detailBody.innerHTML = `<tr><td colspan='4' class='text-center text-muted py-4'>Đơn hàng không có sản phẩm nào.</td></tr>`;
        } else {
            detailBody.innerHTML = items.map(item => {
                const imgUrl = getImageUrl(item.image);
                return `
                    <tr>
                        <td>
                            <div class="d-flex align-items-center gap-3">
                                <img src="${imgUrl}" alt="${escapeHtml(item.product_name)}" class="rounded" style="width: 50px; height: 50px; object-fit: cover;">
                                <span class="fw-semibold text-wrap" style="max-width: 250px;">${escapeHtml(item.product_name)}</span>
                            </div>
                        </td>
                        <td>${formatMoney(item.price)}</td>
                        <td>${item.quantity}</td>
                        <td class="fw-bold text-gold">${formatMoney(item.total)}</td>
                    </tr>
                `;
            }).join('');
        }

    } catch (error) {
        console.error(error);
        detailBody.innerHTML = `<tr><td colspan='4' class='text-center text-danger py-4'>Lỗi kết nối khi tải chi tiết đơn hàng.</td></tr>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadMyOrders();
    loadOrderDetail();
});
