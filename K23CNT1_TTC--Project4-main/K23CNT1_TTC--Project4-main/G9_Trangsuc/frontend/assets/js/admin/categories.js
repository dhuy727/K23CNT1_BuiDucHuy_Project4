// ==============================
// FILE: admin/categories.js
// CHỨC NĂNG:
// - Quản lý danh mục
// ==============================

checkAdmin();

let editingCategoryId = null;


async function loadCategories() {
    const tbody = document.getElementById("categoryTable");
    const parentSelect = document.getElementById("parentId");

    const response = await fetch(`${API_BASE_URL}/categories/`);
    const result = await response.json();

    tbody.innerHTML = "";
    parentSelect.innerHTML = `<option value="">Không có danh mục cha</option>`;

    result.data.forEach(category => {
        tbody.innerHTML += `
            <tr>
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>${category.description || ""}</td>
                <td>${category.parent_id || ""}</td>
                <td>${category.status || ""}</td>
                <td>
                    <button class="btn btn-sm btn-warning"
                            onclick='editCategory(${JSON.stringify(category)})'>
                        Sửa
                    </button>

                    <button class="btn btn-sm btn-danger"
                            onclick="deleteCategory(${category.id})">
                        Xóa
                    </button>
                </td>
            </tr>
        `;

        parentSelect.innerHTML += `
            <option value="${category.id}">
                ${category.name}
            </option>
        `;
    });
}


const categoryForm = document.getElementById("categoryForm");

categoryForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
        name: document.getElementById("name").value.trim(),
        description: document.getElementById("description").value.trim(),
        parent_id: document.getElementById("parentId").value,
        status: document.getElementById("status").value
    };

    const url = editingCategoryId
        ? `${API_BASE_URL}/categories/${editingCategoryId}`
        : `${API_BASE_URL}/categories/`;

    const method = editingCategoryId ? "PUT" : "POST";

    const response = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    alert(result.message);

    resetCategoryForm();
    loadCategories();
});


function editCategory(category) {
    editingCategoryId = category.id;

    document.getElementById("name").value = category.name;
    document.getElementById("description").value = category.description || "";
    document.getElementById("parentId").value = category.parent_id || "";
    document.getElementById("status").value = category.status || "Hoạt động";

    document.getElementById("formTitle").innerText = "Cập nhật danh mục";
    document.getElementById("submitBtn").innerText = "Cập nhật";
}


async function deleteCategory(id) {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;

    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "DELETE"
    });

    const result = await response.json();
    alert(result.message);

    loadCategories();
}


function resetCategoryForm() {
    editingCategoryId = null;
    categoryForm.reset();

    document.getElementById("formTitle").innerText = "Thêm danh mục";
    document.getElementById("submitBtn").innerText = "Thêm danh mục";
}


loadCategories();