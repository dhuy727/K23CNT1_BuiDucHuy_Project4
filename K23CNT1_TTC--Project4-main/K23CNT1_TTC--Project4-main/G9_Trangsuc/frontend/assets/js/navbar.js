function renderNavbar() {
    const user = JSON.parse(localStorage.getItem("user"));

    let authHtml = "";

    if (user) {
        authHtml = `
            <a href="profile.html" class="btn btn-outline-warning btn-sm me-2">
                Xin chào, ${user.name}
            </a>

            <button onclick="logout()" class="btn btn-danger btn-sm">
                Đăng xuất
            </button>
        `;
    } else {
        authHtml = `
            <a href="login.html" class="btn btn-light btn-sm me-2">
                Đăng nhập
            </a>

            <a href="register.html" class="btn btn-warning btn-sm">
                Đăng ký
            </a>
        `;
    }

    document.getElementById("navbar").innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container">
                <a href="index.html" class="navbar-brand text-warning fw-bold">
                    G9 Trang Sức
                </a>

                <div>
                    <a href="index.html" class="btn btn-outline-light btn-sm me-2">Trang chủ</a>
                    <a href="products.html" class="btn btn-outline-light btn-sm me-2">Sản phẩm</a>
                    <a href="cart.html" class="btn btn-warning btn-sm me-2">Giỏ hàng</a>
                    ${authHtml}
                </div>
            </div>
        </nav>
    `;
}

function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    window.location.href = "login.html";
}

renderNavbar();