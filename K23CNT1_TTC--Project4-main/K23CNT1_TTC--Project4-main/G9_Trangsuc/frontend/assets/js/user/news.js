
async function loadNews() {
    const box = document.getElementById('news-list');
    if (!box) return;
    box.innerHTML = `<div class='col-12'><div class='skeleton' style='height: 110px;'></div></div>`;
    try {
        const data = await apiFetch(`${API_BASE_URL}/news/`);
        const items = Array.isArray(data.data) ? data.data : Array.isArray(data.items) ? data.items : [];
        if (!items.length) { box.innerHTML = `<div class='col-12 text-center text-muted'>Chưa có tin tức.</div>`; return; }
        box.innerHTML = items.map(item => `
            <div class="col-md-6 col-xl-4 mb-4 fade-up">
                <div class="card news-card h-100">
                    <img src="${escapeHtml(getImageUrl(item.image, 'news'))}" class="card-img-top" alt="${escapeHtml(item.title)}">
                    <div class="card-body d-flex flex-column">
                        <div class="news-date mb-2">${formatDateTime(item.created_at)}</div>
                        <h3 class="news-title h5">${escapeHtml(item.title)}</h3>
                        <p class="text-muted mb-3">${escapeHtml(item.short_description || '').slice(0, 140)}${item.short_description && item.short_description.length > 140 ? '...' : ''}</p>
                        <a href="news-detail.html?id=${item.id}" class="btn btn-outline-gold mt-auto align-self-start">Xem chi tiết</a>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        box.innerHTML = `<div class='col-12 text-danger text-center'>Không tải được tin tức.</div>`;
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', loadNews);
