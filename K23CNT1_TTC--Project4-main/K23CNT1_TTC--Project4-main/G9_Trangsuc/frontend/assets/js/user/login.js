// ==============================
// FILE: login.js
// CHỨC NĂNG:
// - Đăng nhập user/admin
// - Lưu token vào localStorage
// - Phân quyền chuyển trang
// ==============================

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Lấy dữ liệu từ form
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const result = await response.json();

        if (result.success) {
            // Lưu token và user
            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));

            alert("Đăng nhập thành công");

            // Phân quyền chuyển trang
            if (result.user.role.toLowerCase() === "admin") {
                window.location.href = "../admin/dashboard.html";
            } else {
                window.location.href = "index.html";
            }
        } else {
            alert(result.message);
        }

    } catch (error) {
        alert("Không thể kết nối đến server");
        console.error(error);
    }
});