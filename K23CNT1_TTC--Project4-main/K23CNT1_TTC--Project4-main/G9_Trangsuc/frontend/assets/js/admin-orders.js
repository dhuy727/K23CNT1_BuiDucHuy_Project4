function getOrderBadge(status) {
    if (status === "Chờ xác nhận") return "bg-warning text-dark";
    if (status === "Đã xác nhận") return "bg-primary";
    if (status === "Đang giao") return "bg-info text-dark";
    if (status === "Hoàn thành") return "bg-success";
    if (status === "Đã hủy") return "bg-danger";

    return "bg-secondary";
}

async function loadAdminOrders() {
    const response = await fetch(`${API_BASE_URL}/bdh/orders/`);
    const orders = await response.json();

    let html = "";

    orders.forEach(order => {
        html += `
            <tr>
                <td>#${order.id}</td>

                <td>
                    <strong>${order.customer}</strong>
                </td>

                <td class="text-danger fw-bold">
                    ${formatMoney(order.total)}
                </td>

                <td>
                    <span class="badge ${getOrderBadge(order.status)}">
                        ${order.status}
                    </span>
                </td>

                <td>
                    ${formatDate(order.date)}
                </td>

                <td>
                    <select class="form-select form-select-sm"
                            onchange="updateStatus(${order.id}, this.value)">
                        <option value="">
                            Chọn trạng thái
                        </option>

                        <option value="Chờ xác nhận">
                            Chờ xác nhận
                        </option>

                        <option value="Đã xác nhận">
                            Đã xác nhận
                        </option>

                        <option value="Đang giao">
                            Đang giao
                        </option>

                        <option value="Hoàn thành">
                            Hoàn thành
                        </option>

                        <option value="Đã hủy">
                            Đã hủy
                        </option>
                    </select>
                </td>
            </tr>
        `;
    });

    document.getElementById("admin-order-body").innerHTML = html;
}

async function updateStatus(id, status) {
    if (!status) return;

    const confirmUpdate = confirm(
        "Bạn có chắc muốn cập nhật trạng thái đơn hàng này?"
    );

    if (!confirmUpdate) {
        loadAdminOrders();
        return;
    }

    const response = await fetch(
        `${API_BASE_URL}/bdh/orders/update-status/${id}`,
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

    loadAdminOrders();
}

function formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleString("vi-VN");
}

loadAdminOrders();