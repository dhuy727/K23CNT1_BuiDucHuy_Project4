function getUserBadge(status) {

    if (status === "Hoạt động") {
        return "bg-success";
    }

    if (status === "Khóa") {
        return "bg-danger";
    }

    return "bg-secondary";
}

function getRoleBadge(role) {

    if (role === "Admin") {
        return "bg-dark";
    }

    if (role === "Nhân viên") {
        return "bg-primary";
    }

    return "bg-warning text-dark";
}

async function loadUsers() {

    const response =
        await fetch(`${API_BASE_URL}/bdh/users/`);

    const users = await response.json();

    let html = "";

    users.forEach(user => {

        html += `
            <tr>

                <td>
                    #${user.id}
                </td>

                <td>
                    <strong>${user.name}</strong>
                </td>

                <td>
                    ${user.username}
                </td>

                <td>
                    ${user.email}
                </td>

                <td>
                    ${user.phone}
                </td>

                <td>
                    <span class="badge ${getRoleBadge(user.role)}">
                        ${user.role}
                    </span>
                </td>

                <td>
                    <span class="badge ${getUserBadge(user.status)}">
                        ${user.status}
                    </span>
                </td>

                <td>

                    <select class="form-select form-select-sm"
                            onchange="updateUserStatus(${user.id}, this.value)">

                        <option value="">
                            Chọn trạng thái
                        </option>

                        <option value="Hoạt động"
                            ${user.status === "Hoạt động" ? "selected" : ""}>

                            Hoạt động

                        </option>

                        <option value="Khóa"
                            ${user.status === "Khóa" ? "selected" : ""}>

                            Khóa

                        </option>

                    </select>

                </td>

            </tr>
        `;
    });

    document.getElementById("user-body").innerHTML = html;
}

async function updateUserStatus(id, status) {

    if (!status) return;

    const confirmUpdate = confirm(
        "Bạn có chắc muốn cập nhật trạng thái người dùng?"
    );

    if (!confirmUpdate) {

        loadUsers();
        return;
    }

    const response = await fetch(
        `${API_BASE_URL}/bdh/users/update-status/${id}`,
        {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                status: status
            })
        }
    );

    const data = await response.json();

    alert(data.message);

    loadUsers();
}

loadUsers();