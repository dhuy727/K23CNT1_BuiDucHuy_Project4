
const productParams = new URLSearchParams(window.location.search);
const productId = productParams.get('id');

async function loadProductDetail() {
    const box = document.getElementById('productDetail');
    if (!box || !productId) return;
    box.innerHTML = `<div class='skeleton' style='height: 320px;'></div>`;
    try {
        const data = await apiFetch(`${API_BASE_URL}/products/${productId}`);
        const product = data.data;
        if (!product) { box.innerHTML = `<div class='alert alert-warning'>Không tìm thấy sản phẩm.</div>`; return; }
        box.innerHTML = `
            <div class="row g-4 align-items-start fade-up">
                <div class="col-lg-6"><div class="card border-0 shadow-sm"><img src="${escapeHtml(getImageUrl(String(product.image || "").replace(/\\/g, "/")))}" class="img-fluid" alt="${escapeHtml(product.name)}"></div></div>
                <div class="col-lg-6"><div class="surface-card p-4 p-lg-5"><span class="badge badge-soft mb-3">${escapeHtml(product.category_name || 'Trang sức')}</span><h1 class="h2 fw-black mb-3">${escapeHtml(product.name)}</h1><div class="product-price mb-3">${formatMoney(product.price)}</div><p class="mb-2"><strong>Danh mục:</strong> ${escapeHtml(product.category_name || '')}</p><p class="mb-2"><strong>Chất liệu:</strong> ${escapeHtml(product.material || '')}</p><p class="mb-2"><strong>Còn lại:</strong> ${escapeHtml(product.quantity)}</p><p class="text-muted lh-lg mb-4">${escapeHtml(product.description || '')}</p><div class="d-flex flex-wrap gap-3 align-items-center"><div class="input-group" style="max-width: 150px;"><span class="input-group-text">SL</span><input type="number" id="quantity" class="form-control" min="1" value="1"></div><button type="button" class="btn btn-gold px-4" onclick="addToCartFromDetail()">Thêm vào giỏ hàng</button><a href="products.html" class="btn btn-outline-gold px-4">Quay lại</a></div></div></div>
            </div>
        `;
    } catch (error) { box.innerHTML = `<div class='alert alert-danger'>Không tải được chi tiết sản phẩm.</div>`; console.error(error); }
}

async function addToCartFromDetail() {
    const user = getCurrentUser();
    if (!user) { showToast('Bạn cần đăng nhập để mua hàng.', 'info'); setTimeout(() => window.location.href = 'login.html', 800); return; }
    const quantity = Number(document.getElementById('quantity')?.value || 1);
    if (quantity < 1) { showToast('Số lượng phải lớn hơn 0', 'error'); return; }
    try {
        const result = await apiFetch(`${API_BASE_URL}/cart/add`, { method: 'POST', body: JSON.stringify({ user_id: user.id, product_id: Number(productId), quantity }) });
        if (result.success) { showToast(result.message || 'Đã thêm vào giỏ hàng', 'success'); dispatchCartChanged(); } else { showToast(result.message || 'Không thể thêm vào giỏ hàng', 'error'); }
    } catch (error) { console.error(error); showToast('Lỗi khi thêm vào giỏ hàng', 'error'); }
}

document.addEventListener('DOMContentLoaded', loadProductDetail);
