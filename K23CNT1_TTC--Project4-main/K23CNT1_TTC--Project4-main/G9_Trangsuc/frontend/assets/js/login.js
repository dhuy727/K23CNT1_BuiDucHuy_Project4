async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch(`${API_BASE_URL}/nnh/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password
        })
    });

    const data = await response.json();

    if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));

        Swal.fire({
            icon: "success",
            title: "Đăng nhập thành công"
        });

        setTimeout(() => {
            if (Number(data.user.roleId) === 1 || Number(data.user.roleId) === 2) {
                window.location.href = "admin/dashboard.html";
            } else {
                window.location.href = "index.html";
            }
        }, 1000);

    } else {
        Swal.fire({
            icon: "error",
            title: data.message
        });
    }
}