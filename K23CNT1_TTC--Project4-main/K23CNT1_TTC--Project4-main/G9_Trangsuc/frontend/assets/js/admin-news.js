
checkAdmin();

let editingNewsId = null;

function resetNewsForm() {
    editingNewsId = null;
    ["newsId", "title", "shortDescription", "content", "image"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    const category = document.getElementById("categoryId");
    const status = document.getElementById("status");
    if (category) category.value = "";
    if (status) status.value = "Hiển thị";
}

async function loadNewsCategories() {
    const select = document.getElementById("categoryId");
    if (!select) return;
    try {
        const result = await apiFetch(`${API_BASE_URL}/categories/`);
        const items = Array.isArray(result.data) ? result.data : [];
        select.innerHTML = `<option value="">-- Chọn danh mục --</option>` + items.map(item => `<option value="${item.id}">${escapeHtml(item.name || "")}</option>`).join("");
    } catch (error) {
        select.innerHTML = `<option value="">Không tải được danh mục</option>`;
    }
}

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
            <td><img src="${escapeHtml(getImageUrl(item.image, 'news'))}" alt="${escapeHtml(item.title || '')}" width="72" height="48" style="object-fit:cover;border-radius:12px;"></td>
            <td>${escapeHtml(item.title || "")}</td>
            <td>${escapeHtml(item.category_name || "")}</td>
            <td>${escapeHtml(item.author_name || "")}</td>
            <td>${escapeHtml(item.status || "")}</td>
            <td>${formatDateTime(item.created_at)}</td>
            <td class="text-nowrap">
                <button class="btn btn-sm btn-warning me-1" type="button" onclick='editNews(${JSON.stringify(item).replaceAll("'", "\\'")})'>Sửa</button>
                <button class="btn btn-sm btn-outline-danger" type="button" onclick="deleteNews(${item.id})">Xóa</button>
            </td>
        </tr>
    `).join("");
}

async function loadNews() {
    const tbody = document.getElementById("news-body");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4">Đang tải...</td></tr>`;
    try {
        const result = await apiFetch(`${API_BASE_URL}/news/`);
        renderNewsRows(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-danger text-center py-4">Không tải được tin tức</td></tr>`;
    }
}

function editNews(item) {
    editingNewsId = item.id;
    document.getElementById("newsId").value = item.id || "";
    document.getElementById("title").value = item.title || "";
    document.getElementById("shortDescription").value = item.short_description || "";
    document.getElementById("content").value = item.content || "";
    document.getElementById("image").value = item.image || "";
    document.getElementById("categoryId").value = item.category_id || "";
    document.getElementById("status").value = item.status || "Hiển thị";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function saveNews() {
    const payload = {
        title: document.getElementById("title")?.value.trim(),
        short_description: document.getElementById("shortDescription")?.value.trim(),
        content: document.getElementById("content")?.value.trim(),
        image: document.getElementById("image")?.value.trim(),
        category_id: Number(document.getElementById("categoryId")?.value || 0) || null,
        status: document.getElementById("status")?.value || "Hiển thị",
    };

    if (!payload.title) {
        alert("Vui lòng nhập tiêu đề");
        return;
    }

    try {
        const url = editingNewsId ? `${API_BASE_URL}/news/${editingNewsId}` : `${API_BASE_URL}/news/`;
        const method = editingNewsId ? "PUT" : "POST";
        const result = await apiFetch(url, { method, body: JSON.stringify(payload) });
        alert(result.message || "Đã lưu tin tức");
        resetNewsForm();
        await loadNews();
    } catch (error) {
        alert("Không thể lưu tin tức");
    }
}

async function deleteNews(id) {
    if (!confirm("Xóa tin tức này?")) return;
    try {
        const result = await apiFetch(`${API_BASE_URL}/news/${id}`, { method: "DELETE" });
        alert(result.message || "Đã xóa tin tức");
        await loadNews();
    } catch (error) {
        alert("Không thể xóa tin tức");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadNewsCategories();
    await loadNews();
});
