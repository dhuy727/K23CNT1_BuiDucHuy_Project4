(function() {
const API_ROOT = typeof API_BASE_URL !== "undefined"
    ? API_BASE_URL
    : "http://127.0.0.1:5000/api";

// el được khởi tạo trong init() sau khi DOM sẵn sàng
let el = {};

let products = [];
let filteredProducts = [];
let categoryPromotionMap = new Map();
let activeCategory = "all";
let selectedCategoryId = null;
let categories = [];
let categoryDescendantsMap = new Map();
let categoryNameToIdMap = new Map();
let debounceTimer = null;

const state = {
    keyword: "",
    priceFilter: "all",
    ratingFilter: "all",
    sort: "default",
};

function apiFetchSafe(url, options = {}) {
    if (typeof window.apiFetch === "function") {
        return window.apiFetch(url, options);
    }

    const headers = new Headers(options.headers || {});
    const token = localStorage.getItem("token");
    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    return fetch(url, { ...options, headers }).then(async (res) => {
        let data = {};
        try {
            data = await res.json();
        } catch (_) {}

        if (!res.ok && !data.message) {
            data.message = `Yêu cầu thất bại (${res.status})`;
        }
        return data;
    });
}

const escapeHtml = (value) => {
    if (typeof window.g9EscapeHtml === "function") return window.g9EscapeHtml(value);
    if (typeof window.escapeHtml === "function") {
        try { return window.escapeHtml(value); } catch (e) { /* fallback below */ }
    }

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
};

const formatMoney = (value) => {
    if (typeof window.g9FormatMoney === "function") return window.g9FormatMoney(value);
    if (typeof window.formatMoney === "function") {
        try { return window.formatMoney(value); } catch (e) { /* fallback below */ }
    }
    return new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + " VNĐ";
};

function getCurrentUser() {
    if (typeof window.getCurrentUser === "function") return window.getCurrentUser();
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch (_) {
        return null;
    }
}

function getDisplayName(user) {
    if (typeof window.getDisplayName === "function") return window.getDisplayName(user);
    if (!user) return "";
    return user.full_name || user.name || user.username || "Người dùng";
}

function getLoginPath() {
    if (typeof window.getLoginPath === "function") return window.getLoginPath();
    return "login.html";
}

function dispatchCartChanged() {
    if (typeof window.dispatchCartChanged === "function") {
        window.dispatchCartChanged();
        return;
    }
    window.dispatchEvent(new CustomEvent("g9:cart-changed"));
}

function getCartFallback() {
    try {
        return JSON.parse(localStorage.getItem("cart")) || [];
    } catch (_) {
        return [];
    }
}

function saveCartFallback(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = "position-fixed top-0 end-0 m-4 px-4 py-3";
    toast.style.zIndex = "99999";
    toast.style.borderRadius = "14px";
    toast.style.boxShadow = "0 10px 24px rgba(0,0,0,0.12)";
    toast.style.color = "#fff";
    toast.style.fontWeight = "600";
    toast.style.maxWidth = "320px";
    toast.style.background =
        type === "error"
            ? "linear-gradient(135deg, #e74c3c, #c0392b)"
            : type === "info"
            ? "linear-gradient(135deg, #6c757d, #495057)"
            : "linear-gradient(135deg, #d4af37, #b8891f)";

    toast.innerHTML = `
        <i class="fa-solid fa-circle-check me-2"></i>
        ${escapeHtml(message)}
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2400);
}

function parseNumber(value) {
    const n = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
}

function normalizeProduct(product) {
    const basePrice = Number(product.price || 0);
    const discountValue = Number(categoryPromotionMap.get(String(product.category_id)) || 0);
    const finalPrice = Math.max(0, basePrice - discountValue);

    return {
        ...product,
        basePrice,
        discountValue,
        finalPrice,
        hasDiscount: discountValue > 0 && finalPrice < basePrice,
    };
}

function buildCategoryMaps(categoryList) {
    categories = Array.isArray(categoryList) ? categoryList : [];
    categoryNameToIdMap = new Map();
    const childrenMap = new Map();

    categories.forEach((category) => {
        if (category && category.id != null) {
            const id = String(category.id);
            const name = (category.name || "").trim().toLowerCase();
            if (name) {
                categoryNameToIdMap.set(name, id);
            }
            const parentId = category.parent_id != null ? String(category.parent_id) : null;
            if (!childrenMap.has(parentId)) {
                childrenMap.set(parentId, []);
            }
            childrenMap.get(parentId).push(id);
        }
    });

    categoryDescendantsMap = new Map();
    function collectDescendants(id, visited = new Set()) {
        if (!id || visited.has(id)) return [];
        visited.add(id);
        const descendants = [id];
        const children = childrenMap.get(id) || [];
        for (const childId of children) {
            descendants.push(...collectDescendants(childId, visited));
        }
        return descendants;
    }

    categories.forEach((category) => {
        if (category && category.id != null) {
            const id = String(category.id);
            const descendants = new Set(collectDescendants(id));
            categoryDescendantsMap.set(id, descendants);
        }
    });
}

function resolveSelectedCategoryId() {
    if (selectedCategoryId) return String(selectedCategoryId);
    if (!activeCategory || activeCategory === "all") return null;
    const normalized = String(activeCategory).trim();
    if (/^[0-9]+$/.test(normalized)) {
        return normalized;
    }
    return categoryNameToIdMap.get(normalized.toLowerCase()) || null;
}

function getCategoryIdsByKeyword(keyword) {
    const lowerKeyword = String(keyword || "").trim().toLowerCase();
    if (!lowerKeyword) return null;

    const matchedCategoryIds = categories
        .filter((category) => String(category.name || "").toLowerCase().includes(lowerKeyword))
        .map((category) => String(category.id));

    if (!matchedCategoryIds.length) return null;

    const ids = new Set();
    matchedCategoryIds.forEach((categoryId) => {
        const descendants = categoryDescendantsMap.get(categoryId);
        if (descendants && descendants.size) {
            descendants.forEach((descId) => ids.add(descId));
        } else {
            ids.add(categoryId);
        }
    });

    return ids;
}

function updateActiveCategoryUI() {
    const categoryButtons = el.getCategoryButtons();
    categoryButtons.forEach((btn) => {
        const cat = btn.dataset.category || "all";
        btn.classList.toggle("active", cat === activeCategory);
    });
}

function updateQueryString() {
    const params = new URLSearchParams();

    if (activeCategory && activeCategory !== "all") {
        const resolvedId = resolveSelectedCategoryId();
        if (resolvedId) {
            params.set("category_id", resolvedId);
            if (!/^[0-9]+$/.test(String(activeCategory).trim())) {
                params.set("category", activeCategory);
            }
        } else {
            params.set("category", activeCategory);
        }
    }
    if (state.keyword) params.set("q", state.keyword);
    if (state.priceFilter && state.priceFilter !== "all") params.set("price", state.priceFilter);
    if (state.ratingFilter && state.ratingFilter !== "all") params.set("rating", state.ratingFilter);
    if (state.sort && state.sort !== "default") params.set("sort", state.sort);

    const qs = params.toString();
    const url = `${window.location.pathname}${qs ? "?" + qs : ""}`;
    window.history.replaceState({}, "", url);
}

function readQueryString() {
    const params = new URLSearchParams(window.location.search);
    const categoryIdParam = params.get("category_id");
    const categoryParam = params.get("category");
    activeCategory = categoryParam || categoryIdParam || "all";
    selectedCategoryId = categoryIdParam ? String(categoryIdParam) : null;

    if (!selectedCategoryId && activeCategory && activeCategory !== "all") {
        selectedCategoryId = categoryNameToIdMap.get(String(activeCategory).trim().toLowerCase()) || null;
    }

    if (selectedCategoryId && !categoryParam) {
        const matchedCategory = categories.find((category) => String(category.id) === selectedCategoryId);
        if (matchedCategory && matchedCategory.name) {
            activeCategory = matchedCategory.name;
        }
    }

    state.keyword = params.get("q") || "";
    state.priceFilter = params.get("price") || "all";
    state.ratingFilter = params.get("rating") || "all";
    state.sort = params.get("sort") || "default";

    if (el.searchInput) el.searchInput.value = state.keyword;
    if (el.priceFilter) el.priceFilter.value = state.priceFilter;
    if (el.ratingFilter) el.ratingFilter.value = state.ratingFilter;
    if (el.sortFilter) el.sortFilter.value = state.sort;
}

function getPriceFilterBounds(value) {
    switch (value) {
        case "1":
            return { min: null, max: 1000000 }; // dưới 1 triệu
        case "2":
            return { min: 1000000, max: 5000000 }; // 1 - 5 triệu
        case "3":
            return { min: 5000000, max: null }; // trên 5 triệu
        default:
            return { min: null, max: null };
    }
}

function getRatingFilterThreshold(value) {
    switch (value) {
        case "5":
            return 5;
        case "4":
            return 4;
        case "3":
            return 3;
        case "2":
            return 2;
        case "1":
            return 1;
        default:
            return 0;
    }
}

function renderRatingStars(value) {
    const score = Number(value || 0);
    const full = Math.round(score);
    const stars = Array.from({ length: 5 }, (_, index) => {
        return index < full
            ? '<i class="fa-solid fa-star text-warning"></i>'
            : '<i class="fa-regular fa-star text-muted"></i>';
    });
    return `<div class="product-rating small mb-2">${stars.join(' ')} ${score > 0 ? `(${score.toFixed(1)})` : '<span class="text-muted">Chưa có đánh giá</span>'}</div>`;
}

function applyFilters() {
    const keyword = state.keyword.trim().toLowerCase();
    const { min, max } = getPriceFilterBounds(state.priceFilter);
    const resolvedCategoryId = resolveSelectedCategoryId();
    const keywordCategoryIds = getCategoryIdsByKeyword(keyword);

    filteredProducts = products.filter((product) => {
        const p = normalizeProduct(product);
        const productCategoryId = String(p.category_id || "");

        const matchesCategory =
            activeCategory === "all" ||
            (resolvedCategoryId !== null && categoryDescendantsMap.has(resolvedCategoryId) && categoryDescendantsMap.get(resolvedCategoryId).has(productCategoryId)) ||
            String(p.category_id || "") === resolvedCategoryId ||
            String(p.category_name || "").toLowerCase() === String(activeCategory).toLowerCase();

        const searchable = [
            p.name,
            p.category_name,
            p.material,
            p.description,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        const matchesKeyword = !keyword || searchable.includes(keyword) || (keywordCategoryIds && keywordCategoryIds.has(productCategoryId));
        const matchesMin = min === null || p.finalPrice >= min;
        const matchesMax = max === null || p.finalPrice <= max;
        const ratingThreshold = getRatingFilterThreshold(state.ratingFilter);
        const matchesRating = ratingThreshold === 0 || Number(p.avg_rating || 0) >= ratingThreshold;

        return matchesCategory && matchesKeyword && matchesMin && matchesMax && matchesRating;
    });

    switch (state.sort) {
        case "asc":
        case "price-asc":
            filteredProducts.sort((a, b) => normalizeProduct(a).finalPrice - normalizeProduct(b).finalPrice);
            break;
        case "desc":
        case "price-desc":
            filteredProducts.sort((a, b) => normalizeProduct(b).finalPrice - normalizeProduct(a).finalPrice);
            break;
        case "name-asc":
            filteredProducts.sort((a, b) =>
                String(a.name || "").localeCompare(String(b.name || ""), "vi")
            );
            break;
        case "default":
        default:
            filteredProducts.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
            break;
    }
}

function renderProducts() {
    if (!el.productList) return;

    applyFilters();

    if (!filteredProducts.length) {
        el.productList.innerHTML = `
            <div class="col-12">
                <div class="surface-card text-center p-5 fade-up">
                    <i class="fa-solid fa-gem fs-1 text-warning mb-3"></i>
                    <h4 class="mb-2">Không có sản phẩm phù hợp</h4>
                    <p class="text-muted mb-0">Hãy thử đổi danh mục, từ khóa hoặc khoảng giá khác.</p>
                </div>
            </div>
        `;
        return;
    }

    el.productList.innerHTML = filteredProducts.map((product, index) => {
        const p = normalizeProduct(product);

        return `
            <div class="col-sm-6 col-xl-4 fade-up" style="animation-delay: ${Math.min(index * 0.05, 0.35)}s">
                <div class="card product-card h-100">
                    <div class="position-relative overflow-hidden">
                        <img
                            src="${escapeHtml(getImageUrl(p.image))}"
                            class="card-img-top"
                            alt="${escapeHtml(p.name)}"
                            loading="lazy"
                        >
                        <span class="badge badge-soft position-absolute top-0 start-0 m-3">
                            ${escapeHtml(p.category_name || "Trang sức")}
                        </span>
                        ${p.hasDiscount ? `
                            <span class="badge bg-danger position-absolute top-0 end-0 m-3">
                                Giảm ${formatMoney(p.discountValue)}
                            </span>
                        ` : ""}
                    </div>

                    <div class="card-body d-flex flex-column">
                        <div class="product-name">${escapeHtml(p.name)}</div>
                        <div class="product-rating small mb-2">${renderRatingStars(p.avg_rating)}</div>
                        <div class="product-meta mb-2">${escapeHtml(p.material || "")}</div>

                        <div class="product-price mb-3">
                            ${p.hasDiscount ? `
                                <div class="text-muted text-decoration-line-through small">
                                    ${formatMoney(p.basePrice)}
                                </div>
                            ` : ""}
                            <div class="fw-bold fs-5 text-warning">
                                ${formatMoney(p.finalPrice)}
                            </div>
                            ${p.hasDiscount ? `
                                <div class="small text-success fw-semibold">
                                    Tiết kiệm ${formatMoney(p.discountValue)}
                                </div>
                            ` : ""}
                        </div>

                        <div class="d-flex gap-2 mt-auto">
                            <a href="product-detail.html?id=${encodeURIComponent(p.id)}"
                               class="btn btn-outline-gold flex-grow-1">
                                Xem chi tiết
                            </a>

                            <button type="button"
                                    class="btn btn-gold"
                                    onclick="addToCart(${Number(p.id)})">
                                + Giỏ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

async function loadPromotionMapFromProducts(productList) {
    categoryPromotionMap = new Map();

    const categoryIds = [...new Set(
        productList
            .map((p) => p.category_id)
            .filter((v) => v !== null && v !== undefined && String(v).trim() !== "")
    )];

    const tasks = categoryIds.map(async (categoryId) => {
        try {
            const res = await apiFetchSafe(`${API_ROOT}/promotions/category/${categoryId}`);
            const items = Array.isArray(res.data) ? res.data : [];
            if (!items.length) return;

            const best = items.reduce((max, item) => {
                const v = Number(item.discount_value || 0);
                return v > max ? v : max;
            }, 0);

            if (best > 0) {
                categoryPromotionMap.set(String(categoryId), best);
            }
        } catch (error) {
            console.warn(`Không tải được khuyến mãi cho danh mục ${categoryId}`, error);
        }
    });

    await Promise.all(tasks);
}



function bindCategoryButtons() {
    const categoryButtons = el.getCategoryButtons();
    categoryButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            activeCategory = btn.dataset.category || "all";
            selectedCategoryId = activeCategory !== "all"
                ? categoryNameToIdMap.get(String(activeCategory).trim().toLowerCase()) || null
                : null;
            updateActiveCategoryUI();
            updateQueryString();
            renderProducts();
        });
    });
}

function bindFilters() {
    if (el.searchInput) {
        el.searchInput.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                state.keyword = el.searchInput.value.trim();
                updateQueryString();
                renderProducts();
            }, 180);
        });
    }

    if (el.priceFilter) {
        el.priceFilter.addEventListener("change", () => {
            state.priceFilter = el.priceFilter.value;
            updateQueryString();
            renderProducts();
        });
    }

    if (el.ratingFilter) {
        el.ratingFilter.addEventListener("change", () => {
            state.ratingFilter = el.ratingFilter.value;
            updateQueryString();
            renderProducts();
        });
    }

    if (el.sortFilter) {
        el.sortFilter.addEventListener("change", () => {
            state.sort = el.sortFilter.value;
            updateQueryString();
            renderProducts();
        });
    }
}

async function loadCategories() {
    try {
        const res = await apiFetchSafe(`${API_ROOT}/categories/`);
        const list = Array.isArray(res.data) ? res.data : [];
        buildCategoryMaps(list);
    } catch (error) {
        console.warn("Không tải được danh mục:", error);
        categories = [];
        categoryDescendantsMap.clear();
        categoryNameToIdMap.clear();
    }
}

async function loadProducts() {
    if (!el.productList) return;

    el.productList.innerHTML = `
        <div class="col-12">
            <div class="skeleton skeleton-card"></div>
        </div>
    `;

    try {
        const res = await apiFetchSafe(`${API_ROOT}/products/`);
        const list = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.products)
                ? res.products
                : Array.isArray(res.items)
                    ? res.items
                    : [];

        products = list
            .filter((item) => item && typeof item === "object")
            .map((item) => ({
                ...item,
                image: item.image ? String(item.image).replace(/\\/g, "/") : item.image,
            }));

        await loadPromotionMapFromProducts(products);

        renderProducts();
    } catch (error) {
        console.error("Không tải được sản phẩm:", error);
        el.productList.innerHTML = `
            <div class="col-12">
                <div class="surface-card text-center p-5 text-danger">
                    Không tải được sản phẩm.
                </div>
            </div>
        `;
    }
}

async function addToCart(productId) {
    const user = getCurrentUser();

    if (!user?.id) {
        showToast("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.", "info");
        setTimeout(() => {
            window.location.href = getLoginPath();
        }, 800);
        return;
    }

    try {
        const result = await apiFetchSafe(`${API_ROOT}/cart/add`, {
            method: "POST",
            body: JSON.stringify({
                user_id: user.id,
                product_id: Number(productId),
                quantity: 1,
            }),
        });

        if (result.success) {
            showToast(result.message || "Đã thêm vào giỏ hàng", "success");
            dispatchCartChanged();
        } else {
            showToast(result.message || "Không thể thêm vào giỏ hàng", "error");
        }
    } catch (error) {
        console.error(error);
        showToast("Lỗi khi thêm vào giỏ hàng", "error");
    }
}

function logoutUser() {
    if (typeof window.logout === "function") {
        window.logout();
        return;
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    window.location.href = getLoginPath();
}

async function init() {
    // Khởi tạo el sau khi DOM sẵn sàng
    el = {
        productList: document.getElementById("productList"),
        searchInput: document.getElementById("searchInput"),
        priceFilter: document.getElementById("priceFilter"),
        ratingFilter: document.getElementById("ratingFilter"),
        sortFilter: document.getElementById("sortFilter"),
        getCategoryButtons: () => document.querySelectorAll(".category-btn"),
    };

    await loadCategories();
    readQueryString();
    updateActiveCategoryUI();
    bindCategoryButtons();
    bindFilters();

    loadProducts();
}

document.addEventListener("DOMContentLoaded", init);
window.addToCart = addToCart;
})();