// ==============================
// FILE: admin/orders.js
// CHỨC NĂNG:
// - Hiển thị đơn hàng
// - Cập nhật trạng thái đơn hàng
// ==============================

checkAdmin();

async function loadOrders() {
    const tbody = document.getElementById("orderTable");

    try {
        const response = await fetch(`${API_BASE_URL}/orders/`);
        const result = await response.json();

        tbody.innerHTML = "";

        result.data.forEach(order => {
            tbody.innerHTML += `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.customer_name || ""}</td>
                    <td>${order.receiver_name || ""}</td>
                    <td>${order.phone || ""}</td>
                    <td>${Number(order.total).toLocaleString()} VNĐ</td>
                    <td>
                        <select class="form-select"
                                onchange="updateOrderStatus(${order.id}, this.value)">
                            <option ${order.status === "Chờ xác nhận" ? "selected" : ""}>Chờ xác nhận</option>
                            <option ${order.status === "Đang giao" ? "selected" : ""}>Đang giao</option>
                            <option ${order.status === "Hoàn thành" ? "selected" : ""}>Hoàn thành</option>
                            <option ${order.status === "Đã hủy" ? "selected" : ""}>Đã hủy</option>
                        </select>
                    </td>
                    <td>${order.created_at || ""}</td>
                </tr>
            `;
        });

    } catch (error) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-danger">Không tải được đơn hàng</td>
            </tr>
        `;
        console.error(error);
    }
}

async function updateOrderStatus(orderId, status) {
    const response = await fetch(`${API_BASE_URL}/orders/status/${orderId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: status })
    });

    const result = await response.json();
    alert(result.message);
}

loadOrders();