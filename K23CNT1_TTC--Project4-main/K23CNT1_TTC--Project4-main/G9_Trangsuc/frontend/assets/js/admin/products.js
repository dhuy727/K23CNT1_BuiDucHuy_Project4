// ==============================
// FILE: admin/products.js
// CHỨC NĂNG:
// - Kiểm tra quyền admin
// - Hiển thị sản phẩm
// - Tìm kiếm & lọc sản phẩm
// - Thêm sản phẩm
// - Sửa sản phẩm
// - Xóa sản phẩm
// ==============================

checkAdmin();

// ==============================
// STATE: Lưu trữ dữ liệu & bộ lọc
// ==============================
let allProducts = [];
let adminFilterState = {
    keyword: "",
    category: "all",
    status: "all",
    sort: "default"
};
let adminDebounceTimer = null;


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

        allProducts = result.data || [];
        renderFilteredProducts();

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
// LỌC & HIỂN THỊ SẢN PHẨM
// ==============================
function renderFilteredProducts() {
    const tbody = document.getElementById("productTable");
    const keyword = adminFilterState.keyword.trim().toLowerCase();
    const category = adminFilterState.category;
    const status = adminFilterState.status;
    const sort = adminFilterState.sort;

    // Lọc sản phẩm
    let filtered = allProducts.filter(product => {
        // Lọc theo từ khóa
        if (keyword) {
            const searchable = [
                product.name,
                product.category_name,
                product.material,
                product.description,
                String(product.id)
            ].filter(Boolean).join(" ").toLowerCase();

            if (!searchable.includes(keyword)) return false;
        }

        // Lọc theo danh mục
        if (category !== "all") {
            if (String(product.category_id) !== category &&
                String(product.category_name || "").toLowerCase() !== category.toLowerCase()) {
                return false;
            }
        }

        // Lọc theo trạng thái
        if (status !== "all") {
            if (product.status !== status) return false;
        }

        return true;
    });

    // Sắp xếp
    switch (sort) {
        case "price-asc":
            filtered.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
            break;
        case "price-desc":
            filtered.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
            break;
        case "name-asc":
            filtered.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "vi"));
            break;
        case "qty-asc":
            filtered.sort((a, b) => Number(a.quantity || 0) - Number(b.quantity || 0));
            break;
        case "qty-desc":
            filtered.sort((a, b) => Number(b.quantity || 0) - Number(a.quantity || 0));
            break;
        case "default":
        default:
            filtered.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
            break;
    }

    // Cập nhật số kết quả
    updateResultCount(filtered.length, allProducts.length);

    // Render bảng
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5">
                    <i class="fas fa-search fs-2 text-muted mb-3 d-block"></i>
                    <span class="text-muted">Không tìm thấy sản phẩm phù hợp</span>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = "";

    filtered.forEach((product, index) => {
        tbody.innerHTML += `
            <tr class="admin-row-highlight" style="animation-delay: ${Math.min(index * 0.03, 0.3)}s">
                <td>${product.id}</td>

                <td>
                    <img src="${escapeHtml(getImageUrl(product.image))}"
                         width="60"
                         class="admin-table-thumb">
                </td>

                <td>${highlightKeyword(escapeHtml(product.name), keyword)}</td>
                <td>${Number(product.price).toLocaleString()} VNĐ</td>
                <td>${product.quantity}</td>
                <td>${highlightKeyword(escapeHtml(product.category_name || ""), keyword)}</td>
                <td>
                    <select class="form-select form-select-sm"
                            onchange="updateProductStatus(${product.id}, this.value)">
                        <option value="Còn hàng" ${product.status === "Còn hàng" ? "selected" : ""}>Còn hàng</option>
                        <option value="Hết hàng" ${product.status === "Hết hàng" ? "selected" : ""}>Hết hàng</option>
                        <option value="Ngừng bán" ${product.status === "Ngừng bán" ? "selected" : ""}>Ngừng bán</option>
                    </select>
                </td>

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
}


// ==============================
// HIGHLIGHT TỪ KHÓA TRONG KẾT QUẢ
// ==============================
function highlightKeyword(text, keyword) {
    if (!keyword || !text) return text;
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-warning bg-opacity-50 rounded px-1">$1</mark>');
}


// ==============================
// CẬP NHẬT SỐ LƯỢNG KẾT QUẢ
// ==============================
function updateResultCount(shown, total) {
    const el = document.getElementById("adminFilterResultCount");
    if (!el) return;

    if (shown === total) {
        el.innerHTML = `
            <i class="fas fa-box-open me-1"></i>
            Hiển thị <span class="admin-result-num">${total}</span> sản phẩm
        `;
    } else {
        el.innerHTML = `
            <i class="fas fa-filter me-1"></i>
            Tìm thấy <span class="admin-result-num">${shown}</span> / ${total} sản phẩm
        `;
    }
}


// ==============================
// LOAD DANH MỤC VÀO SELECT (BỘ LỌC + FORM)
// ==============================
async function loadCategoriesToSelect() {
    const formSelect = document.getElementById("categoryId");
    const filterSelect = document.getElementById("adminCategoryFilter");

    const result = await apiFetch(`${API_BASE_URL}/categories/`);
    if (!result || !result.success) {
        console.error(result?.message || "Không tải được danh mục");
        return;
    }

    // Populate form select (product-create page)
    if (formSelect) {
        formSelect.innerHTML = `<option value="">-- Chọn danh mục --</option>`;
        (result.data || []).forEach(category => {
            formSelect.innerHTML += `
                <option value="${category.id}">
                    ${category.name}
                </option>
            `;
        });
    }

    // Populate filter select (products list page)
    if (filterSelect) {
        filterSelect.innerHTML = `<option value="all">Tất cả danh mục</option>`;
        (result.data || []).forEach(category => {
            filterSelect.innerHTML += `
                <option value="${category.id}">${category.name}</option>
            `;
        });
    }
}


// ==============================
// BIND SỰ KIỆN BỘ LỌC
// ==============================
function bindAdminFilters() {
    const searchInput = document.getElementById("adminSearchInput");
    const categoryFilter = document.getElementById("adminCategoryFilter");
    const statusFilter = document.getElementById("adminStatusFilter");
    const sortFilter = document.getElementById("adminSortFilter");
    const resetBtn = document.getElementById("adminResetFilter");

    // Tìm kiếm theo từ khóa (debounce 200ms)
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            clearTimeout(adminDebounceTimer);
            adminDebounceTimer = setTimeout(() => {
                adminFilterState.keyword = searchInput.value.trim();
                renderFilteredProducts();
            }, 200);
        });
    }

    // Lọc theo danh mục
    if (categoryFilter) {
        categoryFilter.addEventListener("change", () => {
            adminFilterState.category = categoryFilter.value;
            renderFilteredProducts();
        });
    }

    // Lọc theo trạng thái
    if (statusFilter) {
        statusFilter.addEventListener("change", () => {
            adminFilterState.status = statusFilter.value;
            renderFilteredProducts();
        });
    }

    // Sắp xếp
    if (sortFilter) {
        sortFilter.addEventListener("change", () => {
            adminFilterState.sort = sortFilter.value;
            renderFilteredProducts();
        });
    }

    // Đặt lại bộ lọc
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            adminFilterState = { keyword: "", category: "all", status: "all", sort: "default" };

            if (searchInput) searchInput.value = "";
            if (categoryFilter) categoryFilter.value = "all";
            if (statusFilter) statusFilter.value = "all";
            if (sortFilter) sortFilter.value = "default";

            renderFilteredProducts();
        });
    }
}


// ==============================
// CẬP NHẬT TRẠNG THÁI SẢN PHẨM
// ==============================
async function updateProductStatus(productId, status) {
    const result = await apiFetch(`${API_BASE_URL}/products/status/${productId}`, {
        method: "PUT",
        body: JSON.stringify({ status: status })
    });

    alert(result.message || "Cập nhật trạng thái thất bại");
    loadAdminProducts();
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
bindAdminFilters();
loadAdminProducts();
loadCategoriesToSelect();