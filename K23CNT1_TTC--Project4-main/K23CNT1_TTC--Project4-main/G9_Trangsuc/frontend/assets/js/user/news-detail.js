
const newsParams = new URLSearchParams(window.location.search);
const newsId = newsParams.get('id');

async function loadNewsDetail() {
    const titleEl = document.getElementById('news-title');
    const imageEl = document.getElementById('news-image');
    const dateEl = document.getElementById('news-date');
    const contentEl = document.getElementById('news-content');
    const box = document.getElementById('news-detail-box');
    if (!newsId) { if (box) box.innerHTML = `<div class='alert alert-warning'>Thiếu mã tin tức.</div>`; return; }
    try {
        const data = await apiFetch(`${API_BASE_URL}/news/`);
        const items = Array.isArray(data.data) ? data.data : Array.isArray(data.items) ? data.items : [];
        const item = items.find(entry => String(entry.id) === String(newsId));
        if (!item) { if (box) box.innerHTML = `<div class='alert alert-warning'>Không tìm thấy tin tức.</div>`; return; }
        if (titleEl) titleEl.textContent = item.title || '';
        if (dateEl) dateEl.textContent = formatDateTime(item.created_at);
        if (imageEl) { imageEl.src = getImageUrl(String(item.image || "").replace(/\\/g, "/"), 'news'); imageEl.alt = item.title || 'Tin tức'; }
        if (contentEl) contentEl.innerHTML = `<p>${escapeHtml(item.content || item.short_description || '').replaceAll('\n', '<br>')}</p>`;
        if (box) box.classList.add('fade-up');
    } catch (error) {
        if (box) box.innerHTML = `<div class='alert alert-danger'>Không tải được chi tiết tin tức.</div>`;
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', loadNewsDetail);
