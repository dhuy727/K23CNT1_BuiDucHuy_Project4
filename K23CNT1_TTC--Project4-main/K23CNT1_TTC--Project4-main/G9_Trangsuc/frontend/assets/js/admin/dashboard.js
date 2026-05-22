// ==============================
// FILE: dashboard.js
// CHỨC NĂNG:
// - Lấy dữ liệu thống kê từ API
// - Hiển thị lên trang admin dashboard
// ==============================
checkAdmin();

async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/`);
        const result = await response.json();

        const data = result.data;

        document.getElementById("totalProducts").innerText = data.total_products;
        document.getElementById("totalOrders").innerText = data.total_orders;
        document.getElementById("totalUsers").innerText = data.total_users;
        document.getElementById("revenue").innerText =
            Number(data.revenue).toLocaleString() + " VNĐ";

    } catch (error) {
        alert("Không tải được dữ liệu dashboard");
        console.error(error);
    }
}

loadDashboard();