
function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

function mountHorizontalCarousel(track, visibleItems = 3, intervalMs = 10000) {
    const cards = Array.from(track.children);
    if (cards.length <= visibleItems) return;

    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).rowGap || '0') || 0;
    let currentIndex = 0;
    const maxIndex = cards.length - visibleItems;

    const wrapper = track.parentElement;
    if (!wrapper) return;
    wrapper.classList.add('featured-carousel-wrapper');

    const controls = document.createElement('div');
    controls.className = 'carousel-controls';
    controls.innerHTML = `
        <button type="button" class="carousel-prev" aria-label="Slide trước">◀</button>
        <button type="button" class="carousel-next" aria-label="Slide sau">▶</button>
    `;
    wrapper.appendChild(controls);

    const prevBtn = controls.querySelector('.carousel-prev');
    const nextBtn = controls.querySelector('.carousel-next');
    if (!prevBtn || !nextBtn) return;

    const updatePosition = () => {
        const cardWidth = cards[0].getBoundingClientRect().width;
        track.style.transform = `translateX(-${currentIndex * (cardWidth + gap)}px)`;
    };

    prevBtn.addEventListener('click', () => {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
        updatePosition();
    });
    nextBtn.addEventListener('click', () => {
        currentIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
        updatePosition();
    });

    window.addEventListener('resize', updatePosition);
    updatePosition();

    setInterval(() => {
        currentIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
        updatePosition();
    }, intervalMs);
}

async function loadFeaturedProducts() {
    const box = document.getElementById('home-featured-products');
    if (!box) return;
    box.innerHTML = `<div class='text-center py-4'><div class='skeleton mx-auto' style='width: 180px; height: 18px;'></div></div>`;
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
            .filter((item) => item && typeof item === 'object')
            .map((item) => ({
                ...item,
                image: item.image ? String(item.image).replace(/\\/g, '/') : item.image,
            }))
            .slice(0, 5);

        if (!featured.length) {
            box.innerHTML = `<div class='col-12 text-center text-muted'>Chưa có sản phẩm.</div>`;
            return;
        }

        const cardsHtml = featured.map(product => `
            <div class="featured-carousel-card fade-up">
                <div class="card product-card h-100">
                    <div class="position-relative overflow-hidden">
                        <img src="${escapeHtml(getImageUrl(product.image))}" class="card-img-top" alt="${escapeHtml(product.name)}">
                        <span class="badge badge-soft position-absolute top-0 start-0 m-3">${escapeHtml(product.category_name || 'Trang sức')}</span>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <div class="product-name">${escapeHtml(product.name)}</div>
                        <div class="product-meta mb-2">${escapeHtml(product.category_name || '')}</div>
                        <div class="product-price mb-3">${formatMoney(product.price)}</div>
                        <div class="d-flex gap-2 mt-auto flex-wrap">
                            <a href="product-detail.html?id=${product.id}" class="btn btn-outline-gold flex-grow-1">Xem chi tiết</a>
                            <button class="btn btn-gold" type="button" onclick="addToCart(${product.id})">+ Giỏ</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        box.innerHTML = `
            <div class="featured-carousel">
                <div class="featured-carousel-track">
                    ${cardsHtml}
                </div>
            </div>
        `;

        const track = box.querySelector('.featured-carousel-track');
        if (track) {
            mountHorizontalCarousel(track, 3, 10000);
        }
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
        
        const maxUpdatedAt = new Date(Math.max(...items.map(item => new Date(item.updated_at))));
        const latestItems = items.filter(item => {
            const itemDate = new Date(item.updated_at);
            return itemDate.getTime() === maxUpdatedAt.getTime();
        });
        
        box.innerHTML = latestItems.map(item => `
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

        const newsItems = items.slice(0, 10);
        if (!newsItems.length) {
            box.innerHTML = `<div class='col-12 text-center text-muted'>Chưa có tin tức.</div>`;
            return;
        }

        const newsHtml = newsItems.map(item => {
            const description = item.short_description ? String(item.short_description).trim() : '';
            const shortDesc = description.length > 120 ? `${description.slice(0, 120)}...` : description;
            return `
                <div class="featured-carousel-card fade-up">
                    <div class="card news-card h-100">
                        <img src="${escapeHtml(getImageUrl(item.image, 'news'))}" class="card-img-top" alt="${escapeHtml(item.title)}">
                        <div class="card-body d-flex flex-column">
                            <div class="news-date mb-2">${formatDateTime(item.created_at)}</div>
                            <h3 class="news-title h5">${escapeHtml(item.title)}</h3>
                            <p class="text-muted mb-3">${escapeHtml(shortDesc)}</p>
                            <a href="news-detail.html?id=${item.id}" class="btn btn-outline-gold mt-auto align-self-start">Đọc tiếp</a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        box.innerHTML = `
            <div class="featured-carousel">
                <div class="featured-carousel-track">
                    ${newsHtml}
                </div>
            </div>
        `;

        const track = box.querySelector('.featured-carousel-track');
        if (track) {
            mountHorizontalCarousel(track, 3, 10000);
        }
    } catch (error) {
        box.innerHTML = `<div class='col-12 text-danger text-center'>Không tải được tin tức.</div>`;
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([loadFeaturedProducts(), loadHomeGoldPrices(), loadHomeNews()]);
});
