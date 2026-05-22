// ==============================
// FILE: config.js
// Cấu hình API dùng chung
// ==============================

const API_BASE_URL = "http://127.0.0.1:5000/api";

function getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
}

function getToken() {
    return localStorage.getItem("token");
}

function checkLogin() {
    const user = getCurrentUser();

    if (!user) {
        alert("Bạn cần đăng nhập trước");
        window.location.href = "../user/login.html";
    }
}

function checkAdmin() {
    const user = getCurrentUser();

    if (!user || user.role.toLowerCase() !== "admin") {
        alert("Bạn không có quyền truy cập trang admin");
        window.location.href = "../user/login.html";
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    alert("Đăng xuất thành công");
    window.location.href = "../user/login.html";
}