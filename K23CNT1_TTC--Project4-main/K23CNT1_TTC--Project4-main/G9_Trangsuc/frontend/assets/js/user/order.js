
async function loadMyOrders() {
    const user = getCurrentUser();
    const body = document.getElementById('order-body');
    if (!body || !user) return;
    body.innerHTML = `<tr><td colspan='7'><div class='skeleton' style='height: 60px;'></div></td></tr>`;
    try {
        const result = await apiFetch(`${API_BASE_URL}/orders/user/${user.id}`);
        const orders = Array.isArray(result.data) ? result.data : [];
        if (!orders.length) { body.innerHTML = `<tr><td colspan='7' class='text-center text-muted py-4'>Chưa có đơn hàng nào.</td></tr>`; return; }
        body.innerHTML = orders.map(order => `<tr><td>${escapeHtml(order.id)}</td><td>${escapeHtml(order.receiver || order.receiver_name || '')}</td><td>${escapeHtml(order.phone || '')}</td><td>${escapeHtml(order.address || '')}</td><td class='text-gold fw-bold'>${formatMoney(order.total || order.total_amount || 0)}</td><td><span class='badge badge-soft'>${escapeHtml(order.status || '')}</span></td><td>${escapeHtml(order.createdAt || order.created_at || '')}</td></tr>`).join('');
    } catch (error) { console.error(error); body.innerHTML = `<tr><td colspan='7' class='text-center text-danger py-4'>Không tải được đơn hàng.</td></tr>`; }
}
document.addEventListener('DOMContentLoaded', loadMyOrders);
