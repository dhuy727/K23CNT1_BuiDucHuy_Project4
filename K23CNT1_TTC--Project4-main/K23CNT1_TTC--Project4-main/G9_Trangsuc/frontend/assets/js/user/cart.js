
checkLogin();
const user = getCurrentUser();

async function loadCart() {
    const cartBody = document.getElementById('cartBody');
    const totalBox = document.getElementById('totalBox');
    const emptyBox = document.getElementById('cartEmptyState');
    if (!cartBody || !totalBox) return;
    cartBody.innerHTML = `<tr><td colspan='6'><div class='skeleton' style='height: 64px;'></div></td></tr>`;
    totalBox.innerHTML = '';
    try {
        const result = await apiFetch(`${API_BASE_URL}/cart/${user.id}`);
        const items = Array.isArray(result.data) ? result.data : [];
        if (!items.length) {
            cartBody.innerHTML = `<tr><td colspan='6' class='text-center py-5'><div class='surface-card p-5'><h4 class='mb-2'>Giỏ hàng của bạn đang trống</h4><p class='text-muted mb-0'>Hãy thêm những món trang sức bạn yêu thích vào giỏ.</p></div></td></tr>`;
            totalBox.textContent = formatMoney(0);
            if (emptyBox) emptyBox.classList.remove('d-none');
            return;
        }
        if (emptyBox) emptyBox.classList.add('d-none');
        let grandTotal = 0;
        cartBody.innerHTML = items.map(item => {
            grandTotal += Number(item.total || 0);
            return `<tr><td><img src="${escapeHtml(getImageUrl(item.image))}" width="72" height="72" style="object-fit:cover; border-radius:16px;" alt="${escapeHtml(item.product_name)}"></td><td><div class="fw-bold">${escapeHtml(item.product_name)}</div><div class="small text-muted">Mã: ${item.product_id || ''}</div></td><td>${formatMoney(item.price)}</td><td style="max-width: 130px;"><input type="number" min="1" value="${item.quantity}" class="form-control" onchange="updateCart(${item.cart_detail_id}, this.value)"></td><td class="fw-bold text-gold">${formatMoney(item.total)}</td><td><button class="btn btn-outline-danger btn-sm" onclick="deleteCartItem(${item.cart_detail_id})">Xóa</button></td></tr>`;
        }).join('');
        totalBox.innerHTML = `<div class='cart-summary-box d-inline-block mt-4'>Tổng tiền: <span class='text-gold fw-bold fs-4'>${formatMoney(grandTotal)}</span></div>`;
    } catch (error) {
        console.error(error);
        cartBody.innerHTML = `<tr><td colspan='6' class='text-center text-danger py-4'>Không tải được giỏ hàng</td></tr>`;
    }
}

async function updateCart(cartDetailId, quantity) {
    const qty = Number(quantity);
    if (!qty || qty < 1) { showToast('Số lượng phải lớn hơn hoặc bằng 1', 'error'); await loadCart(); return; }
    try {
        const result = await apiFetch(`${API_BASE_URL}/cart/update/${cartDetailId}`, { method: 'PUT', body: JSON.stringify({ quantity: qty }) });
        if (result.success) { showToast(result.message || 'Đã cập nhật giỏ hàng', 'success'); dispatchCartChanged(); await loadCart(); } else { showToast(result.message || 'Không thể cập nhật giỏ hàng', 'error'); await loadCart(); }
    } catch (error) { console.error(error); showToast('Lỗi khi cập nhật giỏ hàng', 'error'); }
}

async function deleteCartItem(cartDetailId) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) return;
    try {
        const result = await apiFetch(`${API_BASE_URL}/cart/delete/${cartDetailId}`, { method: 'DELETE' });
        if (result.success) { showToast(result.message || 'Đã xóa khỏi giỏ hàng', 'success'); dispatchCartChanged(); await loadCart(); } else { showToast(result.message || 'Không thể xóa sản phẩm', 'error'); }
    } catch (error) { console.error(error); showToast('Lỗi khi xóa sản phẩm khỏi giỏ hàng', 'error'); }
}

document.addEventListener('DOMContentLoaded', loadCart);
