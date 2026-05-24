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
        const result = await apiFetch(`${API_BASE_URL}/orders/`);
        if (!result || !result.success) {
            throw new Error(result?.message || "Không tải được đơn hàng");
        }

        tbody.innerHTML = "";

        (result.data || []).forEach(order => {
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
    const result = await apiFetch(`${API_BASE_URL}/orders/status/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({ status: status })
    });

    alert(result.message || "Cập nhật trạng thái thất bại");
}

loadOrders();