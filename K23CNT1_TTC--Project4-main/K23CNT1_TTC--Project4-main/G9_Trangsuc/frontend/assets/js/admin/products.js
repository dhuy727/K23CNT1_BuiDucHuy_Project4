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
const ADMIN_PAGE_SIZE = 10;

let allProducts = [];
let adminFilterState = {
    keyword: "",
    category: "all",
    status: "all",
    sort: "default",
    page: 1,
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
// LỌC SẢN PHẨM
// ==============================
function getFilteredAdminProducts() {
    const keyword = adminFilterState.keyword.trim().toLowerCase();
    const category = adminFilterState.category;
    const status = adminFilterState.status;
    const sort = adminFilterState.sort;

    let filtered = allProducts.filter((product) => {
        if (keyword) {
            const searchable = [
                product.name,
                product.category_name,
                product.material,
                product.description,
                String(product.id),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            if (!searchable.includes(keyword)) return false;
        }

        if (category !== "all") {
            if (
                String(product.category_id) !== category &&
                String(product.category_name || "").toLowerCase() !== category.toLowerCase()
            ) {
                return false;
            }
        }

        if (status !== "all" && product.status !== status) {
            return false;
        }

        return true;
    });

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

    return filtered;
}

function getAdminTotalPages(itemCount) {
    return Math.max(1, Math.ceil(itemCount / ADMIN_PAGE_SIZE));
}

function clampAdminCurrentPage(filteredCount) {
    const totalPages = getAdminTotalPages(filteredCount);
    if (adminFilterState.page > totalPages) {
        adminFilterState.page = totalPages;
    }
    if (adminFilterState.page < 1) {
        adminFilterState.page = 1;
    }
}

function resetAdminToFirstPage() {
    adminFilterState.page = 1;
}

function getAdminPaginationWindow(current, total, maxVisible = 5) {
    if (total <= maxVisible) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > total) {
        end = total;
        start = end - maxVisible + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function renderAdminPagination(totalItems) {
    const nav = document.getElementById("adminProductPagination");
    if (!nav) return;

    const totalPages = getAdminTotalPages(totalItems);

    if (totalItems <= ADMIN_PAGE_SIZE) {
        nav.hidden = true;
        nav.innerHTML = "";
        return;
    }

    const currentPage = adminFilterState.page;
    const startIndex = (currentPage - 1) * ADMIN_PAGE_SIZE + 1;
    const endIndex = Math.min(currentPage * ADMIN_PAGE_SIZE, totalItems);
    const pages = getAdminPaginationWindow(currentPage, totalPages);

    const pageItems = pages
        .map(
            (pageNum) => `
        <li class="page-item${pageNum === currentPage ? " active" : ""}">
            <button type="button"
                    class="page-link"
                    ${pageNum === currentPage ? 'aria-current="page"' : ""}
                    data-page="${pageNum}">
                ${pageNum}
            </button>
        </li>
    `
        )
        .join("");

    nav.hidden = false;
    nav.innerHTML = `
        <div class="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
            <p class="admin-product-pagination-summary mb-0">
                Hiển thị ${startIndex}–${endIndex} / ${totalItems} sản phẩm
            </p>
            <ul class="pagination mb-0">
                <li class="page-item${currentPage <= 1 ? " disabled" : ""}">
                    <button type="button" class="page-link" data-page="${currentPage - 1}" aria-label="Trang trước"
                        ${currentPage <= 1 ? "disabled" : ""}>
                        <i class="fas fa-chevron-left"></i>
                    </button>
                </li>
                ${pageItems}
                <li class="page-item${currentPage >= totalPages ? " disabled" : ""}">
                    <button type="button" class="page-link" data-page="${currentPage + 1}" aria-label="Trang sau"
                        ${currentPage >= totalPages ? "disabled" : ""}>
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </li>
            </ul>
        </div>
    `;

    nav.querySelectorAll("[data-page]").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (btn.disabled) return;
            const target = parseInt(btn.dataset.page, 10);
            if (!Number.isFinite(target)) return;
            goToAdminPage(target);
        });
    });
}

function goToAdminPage(page, { scroll = true } = {}) {
    const filtered = getFilteredAdminProducts();
    const totalPages = getAdminTotalPages(filtered.length);
    const nextPage = Math.min(Math.max(1, page), totalPages);

    if (nextPage === adminFilterState.page) return;

    adminFilterState.page = nextPage;
    renderFilteredProducts({ scroll });
}

// ==============================
// LỌC & HIỂN THỊ SẢN PHẨM
// ==============================
function renderFilteredProducts(options = {}) {
    const { scroll = false } = options;
    const tbody = document.getElementById("productTable");
    const keyword = adminFilterState.keyword.trim().toLowerCase();

    const filtered = getFilteredAdminProducts();
    clampAdminCurrentPage(filtered.length);

    updateResultCount(filtered.length, allProducts.length);

    if (filtered.length === 0) {
        const paginationNav = document.getElementById("adminProductPagination");
        if (paginationNav) {
            paginationNav.hidden = true;
            paginationNav.innerHTML = "";
        }

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

    const start = (adminFilterState.page - 1) * ADMIN_PAGE_SIZE;
    const pageProducts = filtered.slice(start, start + ADMIN_PAGE_SIZE);

    tbody.innerHTML = "";

    pageProducts.forEach((product, index) => {
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

    renderAdminPagination(filtered.length);

    if (scroll) {
        const target = document.getElementById("adminProductPagination") ||
            document.querySelector(".table-responsive") ||
            tbody;
        target.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
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
                resetAdminToFirstPage();
                renderFilteredProducts({ scroll: true });
            }, 200);
        });
    }

    // Lọc theo danh mục
    if (categoryFilter) {
        categoryFilter.addEventListener("change", () => {
            adminFilterState.category = categoryFilter.value;
            resetAdminToFirstPage();
            renderFilteredProducts({ scroll: true });
        });
    }

    // Lọc theo trạng thái
    if (statusFilter) {
        statusFilter.addEventListener("change", () => {
            adminFilterState.status = statusFilter.value;
            resetAdminToFirstPage();
            renderFilteredProducts({ scroll: true });
        });
    }

    // Sắp xếp
    if (sortFilter) {
        sortFilter.addEventListener("change", () => {
            adminFilterState.sort = sortFilter.value;
            resetAdminToFirstPage();
            renderFilteredProducts({ scroll: true });
        });
    }

    // Đặt lại bộ lọc
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            adminFilterState = {
                keyword: "",
                category: "all",
                status: "all",
                sort: "default",
                page: 1,
            };

            if (searchInput) searchInput.value = "";
            if (categoryFilter) categoryFilter.value = "all";
            if (statusFilter) statusFilter.value = "all";
            if (sortFilter) sortFilter.value = "default";

            renderFilteredProducts({ scroll: true });
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