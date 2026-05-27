// ==============================
// FILE: admin/categories.js
// CHỨC NĂNG:
// - Hiển thị danh sách danh mục
// - Sửa danh mục
// - Xóa danh mục
// ==============================

checkAdmin();


async function loadCategories() {
    const tbody = document.getElementById("categoryTable");

    const result = await apiFetch(`${API_BASE_URL}/categories/`);
    if (!result || !result.success) {
        throw new Error(result?.message || "Không tải được danh mục");
    }

    tbody.innerHTML = "";

    (result.data || []).forEach(category => {
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
    });
}


// ==============================
// CHUYỂN HƯỚNG ĐẾN TRANG CHỈNH SỬA
// ==============================
function editCategory(category) {
    window.location.href = `category-edit.html?id=${category.id}`;
}


// ==============================
// XÓA DANH MỤC
// ==============================
async function deleteCategory(id) {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;

    const result = await apiFetch(`${API_BASE_URL}/categories/${id}`, {
        method: "DELETE"
    });

    alert(result.message || "Xóa danh mục thất bại");

    loadCategories();
}


// ==============================
// KHỞI CHẠY
// ==============================
loadCategories();