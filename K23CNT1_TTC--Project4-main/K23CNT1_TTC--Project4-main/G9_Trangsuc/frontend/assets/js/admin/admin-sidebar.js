// ==============================
// Admin sidebar: thu gọn ngang, đồng bộ localStorage
// ==============================

const ADMIN_SIDEBAR_STORAGE_KEY = "g9_admin_sidebar_collapsed";

const ADMIN_NAV_ACTIVE_MAP = {
    "product-edit.html": "products.html",
    "product-create.html": "products.html",
    "category-edit.html": "categories.html",
    "category-create.html": "categories.html",
    "news-edit.html": "news.html",
    "news-create.html": "news.html",
    "promotion-edit.html": "promotions.html",
    "promotion-create.html": "promotions.html",
    "gold-edit.html": "gold-price.html",
    "gold-create.html": "gold-price.html",
    "order-detail.html": "orders.html",
};

(function applySidebarStateEarly() {
    try {
        if (localStorage.getItem(ADMIN_SIDEBAR_STORAGE_KEY) === "1") {
            document.documentElement.classList.add("g9-admin-sidebar-collapsed");
        }
    } catch (e) { /* ignore */ }
})();

function getActiveAdminPage() {
    const file = window.location.pathname.split("/").pop() || "dashboard.html";
    return ADMIN_NAV_ACTIVE_MAP[file] || file;
}

function markActiveAdminNavLink() {
    const activePage = getActiveAdminPage();
    document.querySelectorAll("#adminSidebarNav .admin-nav-link").forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === activePage);
    });
}

function initAdminSidebar() {
    const sidebar = document.getElementById("adminSidebar");
    const toggleBtn = document.getElementById("adminSidebarToggle");
    if (!sidebar || !toggleBtn) return;

    const setCollapsed = (collapsed) => {
        sidebar.classList.toggle("is-collapsed", collapsed);
        document.documentElement.classList.toggle("g9-admin-sidebar-collapsed", collapsed);
        toggleBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
        toggleBtn.title = collapsed ? "Mở rộng menu" : "Thu gọn menu";
        const icon = toggleBtn.querySelector(".admin-sidebar-toggle-icon");
        if (icon) {
            icon.classList.toggle("fa-angles-left", !collapsed);
            icon.classList.toggle("fa-angles-right", collapsed);
        }
        try {
            localStorage.setItem(ADMIN_SIDEBAR_STORAGE_KEY, collapsed ? "1" : "0");
        } catch (e) { /* ignore */ }
    };

    const storedCollapsed =
        document.documentElement.classList.contains("g9-admin-sidebar-collapsed") ||
        localStorage.getItem(ADMIN_SIDEBAR_STORAGE_KEY) === "1";
    setCollapsed(storedCollapsed);

    toggleBtn.addEventListener("click", () => {
        setCollapsed(!sidebar.classList.contains("is-collapsed"));
    });

    markActiveAdminNavLink();
}

document.addEventListener("DOMContentLoaded", initAdminSidebar);
