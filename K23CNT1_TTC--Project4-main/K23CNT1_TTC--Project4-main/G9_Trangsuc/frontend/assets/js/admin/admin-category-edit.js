checkAdmin();

const categoryId = new URLSearchParams(window.location.search).get("id");

async function loadParentCategories() {
    const select = document.getElementById("parentId");
    if (!select) return;

    const result = await apiFetch(`${API_BASE_URL}/categories/`);
    if (!result || !result.success) {
        throw new Error(result?.message || "Không tải được danh mục");
    }

    select.innerHTML = `<option value="">-- Không có danh mục cha --</option>`;
    (result.data || []).forEach(category => {
        if (String(category.id) !== String(categoryId)) {
            select.innerHTML += `
                <option value="${category.id}">
                    ${escapeHtml(category.name || "")}
                </option>
            `;
        }
    });
}

async function loadCategory() {
    const result = await apiFetch(`${API_BASE_URL}/categories/${categoryId}`);
    if (!result || result.success === false || !result.data) {
        throw new Error(result?.message || "Không tải được danh mục");
    }

    const item = result.data;
    document.getElementById("name").value = item.name || "";
    document.getElementById("parentId").value = item.parent_id ?? "";
    document.getElementById("status").value = item.status || "Hoạt động";
    document.getElementById("description").value = item.description || "";
}

async function updateCategory() {
    try {
        const payload = {
            name: document.getElementById("name")?.value.trim(),
            parent_id: document.getElementById("parentId")?.value || null,
            status: document.getElementById("status")?.value || "Hoạt động",
            description: document.getElementById("description")?.value.trim(),
        };

        const result = await apiFetch(`${API_BASE_URL}/categories/${categoryId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });

        if (result.success === false) {
            throw new Error(result.message || "Không thể cập nhật danh mục");
        }

        alert(result.message || "Đã cập nhật danh mục");
        window.location.href = "categories.html";
    } catch (error) {
        alert(error.message || "Không thể cập nhật danh mục");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    if (!categoryId) {
        alert("Không tìm thấy ID danh mục");
        window.location.href = "categories.html";
        return;
    }

    try {
        await loadParentCategories();
        await loadCategory();
    } catch (error) {
        alert(error.message || "Không tải được danh mục");
        window.location.href = "categories.html";
    }
});
