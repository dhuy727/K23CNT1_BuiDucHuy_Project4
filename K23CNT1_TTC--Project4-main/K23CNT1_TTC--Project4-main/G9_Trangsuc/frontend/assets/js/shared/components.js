
(function () {
    function ensureToastHost() {
        let host = document.querySelector('.toast-host');
        if (!host) {
            host = document.createElement('div');
            host.className = 'toast-host';
            document.body.appendChild(host);
        }
        return host;
    }
    window.showToast = function showToast(message, type = 'info') {
        const host = ensureToastHost();
        const toast = document.createElement('div');
        toast.className = `g9-toast ${type}`;
        toast.textContent = message;
        host.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-8px)';
            toast.style.transition = 'all .25s ease';
        }, 2600);
        setTimeout(() => toast.remove(), 3000);
    };
    function navLink(label, href, active) { return `<li class="nav-item"><a class="nav-link ${active ? 'active' : ''}" href="${href}">${label}</a></li>`; }
    function renderNavbar(activePage = '') {
        return `
        <nav class="navbar navbar-expand-lg navbar-light g9-navbar sticky-top">
            <div class="container py-2">
                <a class="navbar-brand fw-bold" href="index.html">
                    <img class="navbar-logo" src="${getBackendOrigin()}/uploads/Logo.jpg" alt="G9 Jewelry" />
                </a>
                <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#g9Navbar" aria-controls="g9Navbar" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="g9Navbar">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-1">
                        ${navLink('Trang chủ', 'index.html', activePage === 'home')}
                        <li class="nav-item dropdown g9-nav-dropdown">
                            <a class="nav-link dropdown-toggle ${activePage === 'products' || activePage === 'categories' ? 'active' : ''}" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Sản phẩm
                            </a>
                            <ul class="dropdown-menu shadow-sm" id="g9CategoryDropdown">
                                <li><a class="dropdown-item" href="products.html">Tất cả sản phẩm</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><span class="dropdown-item-text text-muted">Đang tải danh mục...</span></li>
                            </ul>
                        </li>
                        ${navLink('Tin tức', 'news.html', activePage === 'news')}
                        ${navLink('Giá vàng', 'gold-price.html', activePage === 'gold')}
                        <li class="nav-item d-none" id="g9AdminNavItem">
                            <a class="nav-link" href="../admin/dashboard.html">
                                <i class="fa-solid fa-gauge-high me-1"></i>Quản trị
                            </a>
                        </li>
                    </ul>
                    <div class="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2">
                        <a class="btn btn-outline-warning btn-sm" href="cart.html">
                            <i class="fa-solid fa-cart-shopping"></i>
                            <span class="badge rounded-pill bg-danger" id="cartBadge" style="font-size: 0.65rem;">0</span>
                        </a>
                        <div id="authArea"></div>
                    </div>
                </div>
            </div>
        </nav>`;
    }
    function renderFooter() {
        const year = new Date().getFullYear();
        return `
        <footer class="site-footer mt-5">
            <div class="container py-5">
                <div class="row g-4 align-items-start">
                    <div class="col-lg-4"><div class="footer-brand d-flex align-items-center gap-3 mb-3"><span class="brand-mark">G9</span><div><div class="h5 mb-1">G9 Trang Sức</div><div class="footer-note">Tinh tế, sang trọng, hiện đại</div></div></div><p class="footer-note mb-0">Website bán trang sức, cập nhật giá vàng và tin tức xu hướng với trải nghiệm mua sắm giống một cửa hàng thật.</p></div>
                    <div class="col-md-4 col-lg-2"><h6 class="text-white fw-bold mb-3">Khám phá</h6><div class="d-grid gap-2"><a href="index.html">Trang chủ</a><a href="products.html">Sản phẩm</a><a href="news.html">Tin tức</a><a href="gold-price.html">Giá vàng</a></div></div>
                    <div class="col-md-4 col-lg-3"><h6 class="text-white fw-bold mb-3">Dịch vụ</h6><div class="d-grid gap-2"><a href="cart.html">Giỏ hàng</a><a href="orders.html">Đơn hàng</a><a href="profile.html">Tài khoản</a></div></div>
                    <div class="col-md-4 col-lg-3"><h6 class="text-white fw-bold mb-3">Liên hệ</h6><p class="footer-note mb-2">Hotline: 0973378242</p><p class="footer-note mb-0">Email: support@g9jewelry.vn</p></div>
                </div>
                <hr class="border-light opacity-25 my-4">
                <div class="d-flex flex-column flex-md-row justify-content-between gap-2 small footer-note"><span>© ${year} G9 Trang Sức. All rights reserved.</span><span>Thiết kế vàng - trắng hiện đại</span></div>
            </div>
        </footer>`;
    }
    async function fetchCategories() { try { const data = await apiFetch(`${API_BASE_URL}/categories/`); if (data.success && Array.isArray(data.data)) return data.data; } catch (error) { console.error(error); } return []; }
    function buildCategoryTree(categories) {
        const map = new Map();
        categories.forEach((category) => map.set(category.id, { ...category, children: [] }));
        const roots = [];
        categories.forEach((category) => {
            const parentId = category.parent_id;
            if (parentId && map.has(parentId)) {
                map.get(parentId).children.push(map.get(category.id));
            } else {
                roots.push(map.get(category.id));
            }
        });
        return roots;
    }
    function renderCategoryItem(category) {
        const url = `products.html?category_id=${encodeURIComponent(category.id)}`;
        if (!Array.isArray(category.children) || !category.children.length) {
            return `<li><a class="dropdown-item" href="${url}">${escapeHtml(category.name)}</a></li>`;
        }
        return `
            <li class="dropdown-submenu">
                <a class="dropdown-item dropdown-toggle" href="${url}">${escapeHtml(category.name)}</a>
                <ul class="dropdown-menu">
                    ${category.children.map(renderCategoryItem).join('')}
                </ul>
            </li>
        `;
    }
    function updateAdminNavLink(user) {
        const adminNavItem = document.getElementById('g9AdminNavItem');
        if (!adminNavItem) return;
        adminNavItem.classList.toggle('d-none', !isAdminUser(user));
    }
    function renderAuthArea() {
        const user = getCurrentUser();
        const el = document.getElementById('authArea');
        updateAdminNavLink(user);
        if (!el) return;
        
        if (!user) {
            el.innerHTML = `<a href="login.html" class="btn btn-outline-warning btn-sm">
                <i class="fa-solid fa-sign-in-alt me-1"></i>
                Đăng nhập
            </a>`;
            return;
        }
        
        const name = escapeHtml(getDisplayName(user));
        const avatar = escapeHtml(getFirstLetter(user));
        
        el.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="font-size: 0.85rem;">
                    <span style="display: inline-block; width: 22px; height: 22px; background: #ffc107; color: #000; border-radius: 50%; text-align: center; line-height: 22px; margin-right: 0.5rem; font-weight: 600; font-size: 0.8rem;">${avatar}</span>
                    ${escapeHtml(name.split(' ')[0])}
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow-lg" style="min-width: 180px;">
                    <li><a class="dropdown-item" href="profile.html"><i class="fa-solid fa-user me-2"></i>Tài khoản</a></li>
                    <li><a class="dropdown-item" href="orders.html"><i class="fa-solid fa-box me-2"></i>Đơn hàng</a></li>
                    ${isAdminUser(user) ? '<li><a class="dropdown-item" href="../admin/dashboard.html"><i class="fa-solid fa-gauge-high me-2"></i>Trang quản trị</a></li>' : ''}
                    <li><hr class="dropdown-divider"></li>
                    <li><button class="dropdown-item text-danger" type="button" id="logoutBtn"><i class="fa-solid fa-sign-out-alt me-2"></i>Đăng xuất</button></li>
                </ul>
            </div>
        `;
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => logout());
        }
    }
    async function refreshCartSummary() {
        const badge = document.getElementById('cartBadge');
        const user = getCurrentUser();
        if (!badge) return;
        if (!user) { badge.textContent = '0'; return; }
        try {
            const data = await apiFetch(`${API_BASE_URL}/cart/${user.id}`);
            const items = Array.isArray(data.data) ? data.data : [];
            const count = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
            badge.textContent = String(count);
        } catch (error) {
            badge.textContent = '0';
        }
    }
    async function renderCategories() {
        const dropdown = document.getElementById('g9CategoryDropdown');
        if (!dropdown) return;
        const categories = await fetchCategories();
        const roots = buildCategoryTree(categories);
        const data = roots.length ? roots : categories;
        if (!data.length) {
            dropdown.innerHTML = '<li><span class="dropdown-item-text text-muted">Chưa có danh mục</span></li>';
            return;
        }
        dropdown.innerHTML = `
            <li><a class="dropdown-item" href="products.html">Tất cả sản phẩm</a></li>
            <li><hr class="dropdown-divider"></li>
            ${data.map(renderCategoryItem).join('')}
        `;
    }
    function initShell() {
        const navbarHost = document.getElementById('site-navbar');
        if (navbarHost) navbarHost.innerHTML = renderNavbar(getPageName());
        const footerHost = document.getElementById('site-footer');
        if (footerHost) footerHost.innerHTML = renderFooter();
        
        setTimeout(() => {
            renderAuthArea();
            renderCategories();
            refreshCartSummary();
        }, 50);

        const productDropdown = document.querySelector('.g9-nav-dropdown');
        if (productDropdown) {
            productDropdown.addEventListener('mouseenter', () => {
                renderCategories();
            });
        }
        
        window.addEventListener('g9:cart-changed', refreshCartSummary);
        window.addEventListener('storage', (event) => { if (event.key === 'cart' || event.key === 'user' || event.key === 'token') { renderAuthArea(); refreshCartSummary(); renderCategories(); } });
    }
    document.addEventListener('DOMContentLoaded', initShell);
})();
