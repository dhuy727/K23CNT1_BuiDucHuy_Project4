// ==============================
// FILE: dashboard.js
// CHỨC NĂNG:
// - Lấy dữ liệu thống kê từ API
// - Hiển thị lên trang admin dashboard
// ==============================
checkAdmin();

async function loadDashboard() {
    try {
        const result = await apiFetch(`${API_BASE_URL}/dashboard/`);
        if (!result || !result.success) {
            const message = result?.message || "Không lấy được dữ liệu dashboard";
            throw new Error(message);
        }

        const data = result.data || {};
        document.getElementById("totalProducts").innerText = data.total_products ?? 0;
        document.getElementById("totalOrders").innerText = data.total_orders ?? 0;
        document.getElementById("totalUsers").innerText = data.total_users ?? 0;
        document.getElementById("revenue").innerText =
            Number(data.revenue || 0).toLocaleString() + " VNĐ";

    } catch (error) {
        alert("Không tải được dữ liệu dashboard: " + error.message);
        console.error(error);
    }
}

loadDashboard();