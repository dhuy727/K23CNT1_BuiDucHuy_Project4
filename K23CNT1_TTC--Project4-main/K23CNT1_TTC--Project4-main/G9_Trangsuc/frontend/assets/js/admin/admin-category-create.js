checkAdmin();

async function loadParentCategories() {
    const select = document.getElementById("parentId");
    const result = await apiFetch(`${API_BASE_URL}/categories/`);
    
    if (!result || !result.success) {
        throw new Error(result?.message || "Không tải được danh mục");
    }

    (result.data || []).forEach(category => {
        select.innerHTML += `
            <option value="${category.id}">
                ${category.name}
            </option>
        `;
    });
}

async function createCategory() {
    try {
        const payload = {
            name: document.getElementById("name")?.value.trim(),
            parent_id: document.getElementById("parentId")?.value || null,
            status: document.getElementById("status")?.value || "Hoạt động",
            description: document.getElementById("description")?.value.trim(),
        };

        const result = await apiFetch(`${API_BASE_URL}/categories/`, {
            method: "POST",
            body: JSON.stringify(payload),
        });

        alert(result.message || "Đã thêm danh mục");
        window.location.href = "categories.html";
    } catch (error) {
        alert(error.message || "Không thể tạo danh mục");
    }
}

document.addEventListener("DOMContentLoaded", loadParentCategories);
