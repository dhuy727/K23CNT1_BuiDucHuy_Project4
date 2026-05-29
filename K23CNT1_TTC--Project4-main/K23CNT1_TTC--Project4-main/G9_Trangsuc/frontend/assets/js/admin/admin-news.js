// ==============================
// FILE: admin/admin-news.js
// CHỨC NĂNG: Hiển thị danh sách tin tức, xóa tin tức
// ==============================

checkAdmin();

function renderNewsRows(items) {
    const tbody = document.getElementById("news-body");
    if (!tbody) return;

    if (!items.length) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Chưa có tin tức</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>
                <img src="${escapeHtml(getImageUrl(item.image, 'news'))}"
                     alt="${escapeHtml(item.title || '')}"
                     width="72" height="48"
                     class="admin-news-thumb">
            </td>
            <td>${escapeHtml(item.title || "")}</td>
            <td>${escapeHtml(item.category_name || "")}</td>
            <td>${escapeHtml(item.author_name || "")}</td>
            <td>${escapeHtml(item.status || "")}</td>
            <td>${formatDateTime(item.created_at)}</td>
            <td class="text-nowrap text-center">
                <a href="news-edit.html?id=${item.id}" class="btn btn-sm btn-warning me-1">
                    <i class="fas fa-edit me-1"></i>Sửa
                </a>
                <button class="btn btn-sm btn-outline-danger" type="button" onclick="deleteNews(${item.id})">
                    <i class="fas fa-trash me-1"></i>Xóa
                </button>
            </td>
        </tr>
    `).join("");
}

async function loadNews() {
    const tbody = document.getElementById("news-body");
    if (!tbody) return;
    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="text-center py-5">
                <div class="spinner-border spinner-border-sm text-warning me-2" role="status">
                    <span class="visually-hidden">Đang tải...</span>
                </div>
                Đang tải tin tức...
            </td>
        </tr>`;
    try {
        const result = await apiFetch(`${API_BASE_URL}/news/`);
        renderNewsRows(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-danger text-center py-4">Không tải được tin tức</td></tr>`;
    }
}

async function deleteNews(id) {
    if (!confirm("Bạn có chắc muốn xóa tin tức này?")) return;
    try {
        const result = await apiFetch(`${API_BASE_URL}/news/${id}`, { method: "DELETE" });
        alert(result.message || "Đã xóa tin tức");
        await loadNews();
    } catch (error) {
        alert("Không thể xóa tin tức");
    }
}

document.addEventListener("DOMContentLoaded", loadNews);
