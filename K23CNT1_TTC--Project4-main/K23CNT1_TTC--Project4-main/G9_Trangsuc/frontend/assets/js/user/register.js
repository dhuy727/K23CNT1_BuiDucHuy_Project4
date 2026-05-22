async function register() {
    const fullname = document.getElementById("fullname").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;

    if (!fullname || !username || !email || !phone || !password) {
        Swal.fire({
            icon: "warning",
            title: "Vui lòng nhập đầy đủ thông tin"
        });

        return;
    }

    const response = await fetch(`${API_BASE_URL}/nnh/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fullname,
            username,
            email,
            phone,
            password
        })
    });

    const data = await response.json();

    if (data.success) {
        Swal.fire({
            icon: "success",
            title: data.message
        });

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
    } else {
        Swal.fire({
            icon: "error",
            title: data.message
        });
    }
}