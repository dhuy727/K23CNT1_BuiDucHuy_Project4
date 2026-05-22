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

let editingProductId = null;


// ==============================
// LOAD DANH SÁCH SẢN PHẨM
// ==============================
async function loadAdminProducts() {
    const tbody = document.getElementById("productTable");

    try {
        const response = await fetch(`${API_BASE_URL}/products/`);
        const result = await response.json();

        tbody.innerHTML = "";

        result.data.forEach(product => {
            tbody.innerHTML += `
                <tr>
                    <td>${product.id}</td>

                    <td>
                        <img src="../assets/images/products/${product.image || 'default.jpg'}"
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

    const response = await fetch(`${API_BASE_URL}/categories/`);
    const result = await response.json();

    select.innerHTML = `<option value="">-- Chọn danh mục --</option>`;

    result.data.forEach(category => {
        select.innerHTML += `
            <option value="${category.id}">
                ${category.name}
            </option>
        `;
    });
}


// ==============================
// XỬ LÝ THÊM / CẬP NHẬT SẢN PHẨM
// ==============================
const productForm = document.getElementById("productForm");

productForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
        name: document.getElementById("name").value.trim(),
        category_id: document.getElementById("categoryId").value,
        material: document.getElementById("material").value.trim(),
        price: document.getElementById("price").value,
        quantity: document.getElementById("quantity").value,
        image: document.getElementById("image").value.trim(),
        description: document.getElementById("description").value.trim(),
        status: document.getElementById("status").value
    };

    const url = editingProductId
        ? `${API_BASE_URL}/products/${editingProductId}`
        : `${API_BASE_URL}/products/`;

    const method = editingProductId ? "PUT" : "POST";

    const response = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    alert(result.message);

    resetForm();
    loadAdminProducts();
});


// ==============================
// ĐỔ DỮ LIỆU LÊN FORM KHI BẤM SỬA
// ==============================
function editProduct(product) {
    editingProductId = product.id;

    document.getElementById("name").value = product.name;
    document.getElementById("categoryId").value = product.category_id;
    document.getElementById("material").value = product.material || "";
    document.getElementById("price").value = product.price;
    document.getElementById("quantity").value = product.quantity;
    document.getElementById("image").value = product.image || "";
    document.getElementById("description").value = product.description || "";
    document.getElementById("status").value = product.status || "Còn hàng";

    document.getElementById("formTitle").innerText = "Cập nhật sản phẩm";
    document.getElementById("submitBtn").innerText = "Cập nhật";
}


// ==============================
// XÓA SẢN PHẨM
// ==============================
async function deleteProduct(id) {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE"
    });

    const result = await response.json();
    alert(result.message);

    loadAdminProducts();
}


// ==============================
// RESET FORM
// ==============================
function resetForm() {
    editingProductId = null;
    productForm.reset();

    document.getElementById("formTitle").innerText = "Thêm sản phẩm";
    document.getElementById("submitBtn").innerText = "Thêm sản phẩm";
}


// ==============================
// KHỞI CHẠY
// ==============================
loadAdminProducts();
loadCategoriesToSelect();