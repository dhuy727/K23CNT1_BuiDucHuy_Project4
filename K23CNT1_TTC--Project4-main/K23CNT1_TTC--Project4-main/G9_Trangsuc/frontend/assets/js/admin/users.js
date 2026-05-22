// ==============================
// FILE: admin/users.js
// CHỨC NĂNG:
// - Hiển thị người dùng
// - Cập nhật trạng thái tài khoản
// ==============================

checkAdmin();

async function loadUsers() {
    const tbody = document.getElementById("userTable");

    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`);
        const result = await response.json();

        tbody.innerHTML = "";

        result.data.forEach(user => {
            tbody.innerHTML += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.full_name}</td>
                    <td>${user.username}</td>
                    <td>${user.email || ""}</td>
                    <td>${user.phone || ""}</td>
                    <td>${user.role}</td>
                    <td>
                        <select class="form-select"
                                onchange="updateUserStatus(${user.id}, this.value)">
                            <option ${user.status === "Hoạt động" ? "selected" : ""}>Hoạt động</option>
                            <option ${user.status === "Khóa" ? "selected" : ""}>Khóa</option>
                        </select>
                    </td>
                    <td>${user.created_at || ""}</td>
                </tr>
            `;
        });

    } catch (error) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-danger">Không tải được người dùng</td>
            </tr>
        `;
        console.error(error);
    }
}

async function updateUserStatus(userId, status) {
    const response = await fetch(`${API_BASE_URL}/admin/users/status/${userId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: status })
    });

    const result = await response.json();
    alert(result.message);
}

loadUsers();