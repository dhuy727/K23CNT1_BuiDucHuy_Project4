
(function () {
    function navItem(href, label, active) {
        return `<a class="list-group-item list-group-item-action ${active ? 'active' : ''}" href="${href}">${label}</a>`;
    }

    window.renderAdminLayout = function renderAdminLayout(active = "") {
        if (document.getElementById("admin-shell")) return;

        const shell = document.createElement("div");
        shell.id = "admin-shell";
        shell.innerHTML = `
            <div class="admin-topbar p-3 p-lg-4 mb-4">
                <div class="container-fluid">
                    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <div>
                            <div class="small text-uppercase text-muted fw-semibold">Bảng quản trị</div>
                            <h1 class="h4 mb-0">G9 Trang Sức</h1>
                        </div>
                        <div class="d-flex flex-wrap gap-2">
                            <a class="btn btn-outline-secondary btn-sm" href="dashboard.html">Dashboard</a>
                            <a class="btn btn-outline-secondary btn-sm" href="products.html">Sản phẩm</a>
                            <a class="btn btn-outline-secondary btn-sm" href="orders.html">Đơn hàng</a>
                            <a class="btn btn-outline-secondary btn-sm" href="../user/index.html">Xem trang chủ</a>
                            <button class="btn btn-warning btn-sm" type="button" id="adminLogoutBtn">Đăng xuất</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container-fluid mb-4">
                <div class="row g-4">
                    <div class="col-lg-3 col-xl-2">
                        <div class="list-group shadow-sm">
                            ${navItem("dashboard.html", "Tổng quan", active === "dashboard")}
                            ${navItem("products.html", "Sản phẩm", active === "products")}
                            ${navItem("categories.html", "Danh mục", active === "categories")}
                            ${navItem("orders.html", "Đơn hàng", active === "orders")}
                            ${navItem("users.html", "Người dùng", active === "users")}
                            ${navItem("news.html", "Tin tức", active === "news")}
                            ${navItem("gold-price.html", "Giá vàng", active === "gold")}
                            ${navItem("revenue.html", "Doanh thu", active === "revenue")}
                        </div>
                    </div>
                    <div class="col-lg-9 col-xl-10">
        `;

        const body = document.body;
        const first = body.firstChild;
        body.insertBefore(shell, first || null);

        const logoutBtn = document.getElementById("adminLogoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                clearAuth();
                window.location.href = "../user/login.html";
            });
        }

        const content = body.querySelector(".admin-content");
        if (content) {
            content.classList.add("bg-white", "rounded-4", "shadow-sm", "p-4");
        }

        const end = document.createElement("div");
        end.id = "admin-shell-end";
        end.innerHTML = `</div></div></div>`;
        body.appendChild(end);
    };

    document.addEventListener("DOMContentLoaded", () => {
        if (document.body.classList.contains("admin-auto-layout")) {
            renderAdminLayout(document.body.dataset.adminPage || "");
        }
    });
})();
