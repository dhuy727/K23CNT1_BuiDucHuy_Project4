const API_BASE_URL = "http://127.0.0.1:5000/api";

function formatMoney(number) {

    return Number(number)
        .toLocaleString("vi-VN") + " VNĐ";
}

function saveUser(user) {

    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );
}

function getUser() {

    return JSON.parse(
        localStorage.getItem("user")
    );
}

function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    window.location.href = "login.html";
}

function getCart() {

    return JSON.parse(
        localStorage.getItem("cart")
    ) || [];
}

function saveCart(cart) {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );
}
// #phần kiểm tra Admin
function checkAdmin() {
    const user = getUser();

    if (!user || (user.roleId !== 1 && user.roleId !== 2)) {
        alert("Bạn không có quyền truy cập trang quản trị");
        window.location.href = "../index.html";
    }
}
// yêu thích
function getWishlist() {

    return JSON.parse(
        localStorage.getItem("wishlist")
    ) || [];
}

function saveWishlist(list) {

    localStorage.setItem(
        "wishlist",
        JSON.stringify(list)
    );
}