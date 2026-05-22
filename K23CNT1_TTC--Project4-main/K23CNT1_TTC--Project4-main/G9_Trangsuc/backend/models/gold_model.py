# ==============================
# FILE: models/gold_model.py
# CHỨC NĂNG:
# - Xử lý tất cả SQL logic liên quan tới giá vàng
# ==============================

from database.db import get_connection, rows_to_dict


class GoldModel:
    """Model xử lý tất cả operations liên quan tới giá vàng"""

    @staticmethod
    def get_all_gold_prices():
        """Lấy danh sách giá vàng"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                G9_MaGiaVang AS id,
                G9_LoaiVang AS gold_type,
                G9_GiaMua AS buy_price,
                G9_GiaBan AS sell_price,
                G9_NgayCapNhat AS updated_at
            FROM G9_GiaVang
            ORDER BY G9_NgayCapNhat DESC
        """)

        data = rows_to_dict(cursor)
        cursor.close()
        conn.close()

        return data
