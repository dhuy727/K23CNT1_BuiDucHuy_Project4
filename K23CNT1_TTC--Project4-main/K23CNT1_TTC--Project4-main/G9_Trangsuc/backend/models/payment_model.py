# ==============================
# FILE: models/payment_model.py
# CHỨC NĂNG:
# - Xử lý tất cả SQL logic liên quan tới thanh toán
# ==============================

from database.db import get_connection


class PaymentModel:
    """Model xử lý tất cả operations liên quan tới thanh toán"""

    @staticmethod
    def get_payment_by_order(order_id):
        """Lấy thông tin thanh toán theo order"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                G9_MaThanhToan AS id,
                G9_MaDonHang AS order_id,
                G9_PhuongThuc AS method,
                G9_SoTien AS amount,
                G9_NgayThanhToan AS paid_at
            FROM G9_ThanhToan
            WHERE G9_MaDonHang = ?
        """, (order_id,))

        payment = cursor.fetchone()
        cursor.close()
        conn.close()

        return payment
