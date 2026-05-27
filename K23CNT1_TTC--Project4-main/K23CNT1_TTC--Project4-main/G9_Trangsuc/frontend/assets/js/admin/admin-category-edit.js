checkAdmin();

const categoryId = new URLSearchParams(window.location.search).get("id");
let loadedCategory = null;

async function loadParentCategories() {
    const select = document.getElementById("parentId");
    const result = await apiFetch(`${API_BASE_URL}/categories/`);
    
    if (!result || !result.success) {
        throw new Error(result?.message || "Không tải được danh mục");
    }

    (result.data || []).forEach(category => {
        if (category.id !== categoryId) { // Không cho chọn chính nó làm danh mục cha
            select.innerHTML += `
                <option value="${category.id}">
                    ${category.name}
                </option>
            `;
        }
    });
}

async function loadCategory() {
    if (!categoryId) return;
    try {
        const result = await apiFetch(`${API_BASE_URL}/categories/${categoryId}`);
        loadedCategory = result.data || null;
        if (!loadedCategory) return;

        document.getElementById("name").value = loadedCategory.name || "";
        document.getElementById("parentId").value = loadedCategory.parent_id || "";
        document.getElementById("status").value = loadedCategory.status || "Hoạt động";
        document.getElementById("description").value = loadedCategory.description || "";
    } catch (error) {
        alert("Không tải được danh mục");
    }
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

        alert(result.message || "Đã cập nhật danh mục");
        window.location.href = "categories.html";
    } catch (error) {
        alert(error.message || "Không thể cập nhật danh mục");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadParentCategories();
    loadCategory();
});
