// ==============================
// FILE: admin/admin-news-edit.js
// CHỨC NĂNG: Sửa tin tức (load theo ?id= từ URL)
// ==============================

checkAdmin();

const params = new URLSearchParams(window.location.search);
const newsId = params.get("id");

async function uploadSelectedImage() {
    const fileInput = document.getElementById("upload-image");
    const imageInput = document.getElementById("image");
    if (!fileInput || !fileInput.files || !fileInput.files[0]) return "";

    const formData = new FormData();
    formData.append("image", fileInput.files[0]);

    const response = await fetch(`${API_BASE_URL}/upload/`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
        throw new Error(result.message || "Upload ảnh thất bại");
    }

    if (imageInput) imageInput.value = result.filename || fileInput.files[0].name;
    return imageInput ? imageInput.value : (result.filename || "");
}

async function loadNewsCategories(selectedId) {
    const select = document.getElementById("categoryId");
    if (!select) return;
    try {
        const result = await apiFetch(`${API_BASE_URL}/categories/`);
        const items = Array.isArray(result.data) ? result.data : [];
        select.innerHTML = `<option value="">-- Chọn danh mục --</option>` +
            items.map(item =>
                `<option value="${item.id}" ${Number(item.id) === Number(selectedId) ? "selected" : ""}>
                    ${escapeHtml(item.name || "")}
                </option>`
            ).join("");
    } catch (error) {
        select.innerHTML = `<option value="">Không tải được danh mục</option>`;
    }
}

async function loadNewsDetail() {
    if (!newsId) {
        alert("Không tìm thấy ID tin tức");
        window.location.href = "news.html";
        return;
    }

    try {
        const result = await apiFetch(`${API_BASE_URL}/news/${newsId}`);
        if (!result || result.success === false || !result.data) {
            throw new Error(result?.message || "Không tải được tin tức");
        }

        const item = result.data;

        await loadNewsCategories(item.category_id);

        document.getElementById("title").value       = item.title || "";
        document.getElementById("shortDescription").value = item.short_description || "";
        document.getElementById("content").value     = item.content || "";
        document.getElementById("image").value       = item.image || "";
        document.getElementById("status").value      = item.status || "Hiển thị";

        document.getElementById("loadingState").classList.add("d-none");
        document.getElementById("editFormCard").classList.remove("admin-form-hidden");

    } catch (error) {
        alert(error.message || "Lỗi khi tải tin tức");
        window.location.href = "news.html";
    }
}

async function updateNews() {
    if (!document.getElementById("title")?.value.trim()) {
        alert("Vui lòng nhập tiêu đề");
        return;
    }

    try {
        const image = document.getElementById("image")?.value.trim() || await uploadSelectedImage();
        const payload = {
            title:             document.getElementById("title")?.value.trim(),
            short_description: document.getElementById("shortDescription")?.value.trim(),
            content:           document.getElementById("content")?.value.trim(),
            image,
            category_id:       Number(document.getElementById("categoryId")?.value || 0) || null,
            status:            document.getElementById("status")?.value || "Hiển thị",
        };

        const result = await apiFetch(`${API_BASE_URL}/news/${newsId}`, {
            method: "PUT",
            body: JSON.stringify(payload)
        });
        alert(result.message || "Đã cập nhật tin tức thành công");
        if (result.success !== false) {
            window.location.href = "news.html";
        }
    } catch (error) {
        alert(error.message || "Không thể cập nhật tin tức");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadNewsDetail();

    const fileInput = document.getElementById("upload-image");
    if (fileInput) {
        fileInput.addEventListener("change", async () => {
            try {
                await uploadSelectedImage();
            } catch (error) {
                alert(error.message || "Không thể upload ảnh");
            }
        });
    }
});
