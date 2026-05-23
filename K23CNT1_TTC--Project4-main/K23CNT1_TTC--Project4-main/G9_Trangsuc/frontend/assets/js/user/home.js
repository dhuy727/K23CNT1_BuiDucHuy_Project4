
async function loadFeaturedProducts() {
    const box = document.getElementById('home-featured-products');
    if (!box) return;
    box.innerHTML = `<div class='col-12 text-center py-4'><div class='skeleton mx-auto' style='width: 180px; height: 18px;'></div></div>`;
    try {
        const data = await apiFetch(`${API_BASE_URL}/products/`);
        const products = Array.isArray(data.data)
            ? data.data
            : Array.isArray(data.products)
                ? data.products
                : Array.isArray(data.items)
                    ? data.items
                    : [];

        const featured = products
            .filter((item) => item && typeof item === "object")
            .map((item) => ({
                ...item,
                image: item.image ? String(item.image).replace(/\\/g, "/") : item.image,
            }))
            .slice(0, 6);

        if (!featured.length) { box.innerHTML = `<div class='col-12 text-center text-muted'>Chưa có sản phẩm.</div>`; return; }
        box.innerHTML = featured.map(product => `
            <div class="col-sm-6 col-lg-4 fade-up">
                <div class="card product-card h-100">
                    <div class="position-relative overflow-hidden">
                        <img src="${escapeHtml(getImageUrl(product.image))}" class="card-img-top" alt="${escapeHtml(product.name)}">
                        <span class="badge badge-soft position-absolute top-0 start-0 m-3">${escapeHtml(product.category_name || 'Trang sức')}</span>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <div class="product-name">${escapeHtml(product.name)}</div>
                        <div class="product-meta mb-2">${escapeHtml(product.category_name || '')}</div>
                        <div class="product-price mb-3">${formatMoney(product.price)}</div>
                        <div class="d-flex gap-2 mt-auto">
                            <a href="product-detail.html?id=${product.id}" class="btn btn-outline-gold flex-grow-1">Xem chi tiết</a>
                            <button class="btn btn-gold" type="button" onclick="addToCart(${product.id})">+ Giỏ</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        box.innerHTML = `<div class='col-12 text-danger text-center'>Không tải được sản phẩm nổi bật.</div>`;
        console.error(error);
    }
}

async function loadHomeGoldPrices() {
    const box = document.getElementById('home-gold-prices');
    if (!box) return;
    box.innerHTML = `<div class='col-12'><div class='skeleton' style='height: 90px;'></div></div>`;
    try {
        const data = await apiFetch(`${API_BASE_URL}/gold/`);
        const items = Array.isArray(data.data)
            ? data.data
            : Array.isArray(data.items)
                ? data.items
                : [];
        if (!items.length) { box.innerHTML = `<div class='col-12 text-center text-muted'>Chưa có dữ liệu giá vàng.</div>`; return; }
        box.innerHTML = items.map(item => `
            <div class="col-md-4 fade-up">
                <div class="price-card">
                    <div class="price-label mb-2">${escapeHtml(item.gold_type)}</div>
                    <div class="small text-muted mb-3">Cập nhật: ${formatDateTime(item.updated_at)}</div>
                    <div class="price-row"><span>Mua vào</span><span class="price-value">${formatMoney(item.buy_price)}</span></div>
                    <div class="price-row"><span>Bán ra</span><span class="price-value">${formatMoney(item.sell_price)}</span></div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        box.innerHTML = `<div class='col-12 text-danger text-center'>Không tải được giá vàng.</div>`;
        console.error(error);
    }
}

async function loadHomeNews() {
    const box = document.getElementById('home-news');
    if (!box) return;
    box.innerHTML = `<div class='col-12'><div class='skeleton' style='height: 90px;'></div></div>`;
    try {
        const data = await apiFetch(`${API_BASE_URL}/news/`);
        const items = Array.isArray(data.data)
            ? data.data
            : Array.isArray(data.items)
                ? data.items
                : [];
        if (!items.length) { box.innerHTML = `<div class='col-12 text-center text-muted'>Chưa có tin tức.</div>`; return; }
        box.innerHTML = items.map(item => `
            <div class="col-md-4 fade-up">
                <div class="card news-card h-100">
                    <img src="${escapeHtml(getImageUrl(item.image, 'news'))}" class="card-img-top" alt="${escapeHtml(item.title)}">
                    <div class="card-body d-flex flex-column">
                        <div class="news-date mb-2">${formatDateTime(item.created_at)}</div>
                        <h3 class="news-title h5">${escapeHtml(item.title)}</h3>
                        <p class="text-muted mb-3">${escapeHtml(item.short_description || '').slice(0, 120)}${item.short_description && item.short_description.length > 120 ? '...' : ''}</p>
                        <a href="news-detail.html?id=${item.id}" class="btn btn-outline-gold mt-auto align-self-start">Đọc tiếp</a>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        box.innerHTML = `<div class='col-12 text-danger text-center'>Không tải được tin tức.</div>`;
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([loadFeaturedProducts(), loadHomeGoldPrices(), loadHomeNews()]);
});
