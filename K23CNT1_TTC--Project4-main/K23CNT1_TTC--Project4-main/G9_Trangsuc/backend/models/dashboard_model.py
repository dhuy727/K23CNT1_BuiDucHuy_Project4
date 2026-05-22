# ==============================
# FILE: models/dashboard_model.py
# CHỨC NĂNG:
# - Xử lý tất cả SQL logic liên quan tới dashboard analytics
# ==============================

from database.db import get_connection


class DashboardModel:
    """Model xử lý tất cả operations liên quan tới dashboard"""

    @staticmethod
    def get_dashboard_stats():
        """Lấy thống kê dashboard"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            # Đếm sản phẩm
            cursor.execute("SELECT COUNT(*) FROM G9_SanPham")
            total_products = cursor.fetchone()[0]

            # Đếm đơn hàng
            cursor.execute("SELECT COUNT(*) FROM G9_DonHang")
            total_orders = cursor.fetchone()[0]

            # Đếm người dùng
            cursor.execute("SELECT COUNT(*) FROM G9_NguoiDung")
            total_users = cursor.fetchone()[0]

            # Tính doanh thu từ đơn hàng
            cursor.execute("""
                SELECT ISNULL(SUM(G9_TongTien), 0)
                FROM G9_DonHang
            """)
            revenue = cursor.fetchone()[0]

            return {
                "total_products": total_products,
                "total_orders": total_orders,
                "total_users": total_users,
                "revenue": float(revenue)
            }
        finally:
            cursor.close()
            conn.close()
