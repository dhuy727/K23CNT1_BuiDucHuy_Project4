function checkAdminLogin() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || (Number(user.roleId) !== 1 && Number(user.roleId) !== 2)) {
        alert("Bạn không có quyền truy cập Admin");
        window.location.href = "../login.html";
    }
}

function adminLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    window.location.href = "../login.html";
}

function renderAdminLayout(activePage = "") {
    checkAdminLogin();

    document.body.insertAdjacentHTML("afterbegin", `
        <div class="admin-wrapper">
            <aside class="admin-sidebar">
                <h3 class="admin-logo">G9 Admin</h3>

                <a class="${activePage === "dashboard" ? "active" : ""}" href="dashboard.html">Dashboard</a>
                <a class="${activePage === "products" ? "active" : ""}" href="products.html">Sản phẩm</a>
                <a class="${activePage === "categories" ? "active" : ""}" href="categories.html">Danh mục</a>
                <a class="${activePage === "orders" ? "active" : ""}" href="orders.html">Đơn hàng</a>
                <a class="${activePage === "users" ? "active" : ""}" href="users.html">Người dùng</a>
                <a class="${activePage === "gold" ? "active" : ""}" href="gold.html">Giá vàng</a>
                <a class="${activePage === "news" ? "active" : ""}" href="news.html">Tin tức</a>

                <button onclick="adminLogout()" class="admin-logout">
                    Đăng xuất
                </button>
            </aside>
        </div>
    `);
}