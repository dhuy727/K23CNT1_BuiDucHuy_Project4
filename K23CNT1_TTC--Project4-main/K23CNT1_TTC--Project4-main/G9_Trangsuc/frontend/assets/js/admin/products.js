// ==============================
// FILE: admin/products.js
// CHỨC NĂNG:
// - Kiểm tra quyền admin
// - Hiển thị sản phẩm
// - Thêm sản phẩm
// - Sửa sản phẩm
// - Xóa sản phẩm
// ==============================

checkAdmin();


// ==============================
// LOAD DANH SÁCH SẢN PHẨM
// ==============================
async function loadAdminProducts() {
    const tbody = document.getElementById("productTable");

    try {
        const result = await apiFetch(`${API_BASE_URL}/products/`);
        if (!result || !result.success) {
            throw new Error(result?.message || "Không tải được sản phẩm");
        }

        tbody.innerHTML = "";

        (result.data || []).forEach(product => {
            tbody.innerHTML += `
                <tr>
                    <td>${product.id}</td>

                    <td>
                        <img src="${escapeHtml(getImageUrl(product.image))}"
                             width="60"
                             style="height:60px; object-fit:cover;">
                    </td>

                    <td>${product.name}</td>
                    <td>${Number(product.price).toLocaleString()} VNĐ</td>
                    <td>${product.quantity}</td>
                    <td>${product.category_name || ""}</td>
                    <td>${product.status || ""}</td>

                    <td>
                        <button class="btn btn-sm btn-warning"
                                onclick='editProduct(${JSON.stringify(product)})'>
                            Sửa
                        </button>

                        <button class="btn btn-sm btn-danger"
                                onclick="deleteProduct(${product.id})">
                            Xóa
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-danger text-center">
                    Không tải được sản phẩm
                </td>
            </tr>
        `;
        console.error(error);
    }
}


// ==============================
// LOAD DANH MỤC VÀO SELECT
// ==============================
async function loadCategoriesToSelect() {
    const select = document.getElementById("categoryId");
    if (!select) return; // Nếu không có select thì không load

    const result = await apiFetch(`${API_BASE_URL}/categories/`);
    if (!result || !result.success) {
        throw new Error(result?.message || "Không tải được danh mục");
    }

    select.innerHTML = `<option value="">-- Chọn danh mục --</option>`;

    (result.data || []).forEach(category => {
        select.innerHTML += `
            <option value="${category.id}">
                ${category.name}
            </option>
        `;
    });
}


// CHUYỂN HƯỚNG ĐẾN TRANG CHỈNH SỬA
// ==============================
function editProduct(product) {
    window.location.href = `product-edit.html?id=${product.id}`;
}


// ==============================
// XÓA SẢN PHẨM
// ==============================
async function deleteProduct(id) {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    const result = await apiFetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE"
    });

    alert(result.message || "Xóa sản phẩm thất bại");

    loadAdminProducts();
}


// ==============================
// KHỞI CHẠY
// ==============================
loadAdminProducts
loadCategoriesToSelect();