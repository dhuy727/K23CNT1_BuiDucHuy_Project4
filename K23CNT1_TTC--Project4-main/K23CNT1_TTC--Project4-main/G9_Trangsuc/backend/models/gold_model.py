# ==============================
# FILE: models/gold_model.py
# CHỨC NĂNG:
# - Xử lý tất cả SQL logic liên quan tới giá vàng
# ==============================

from database.db import get_connection, rows_to_dict, row_to_dict


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

    @staticmethod
    def get_gold_price_by_id(gold_id):
        """Lấy chi tiết giá vàng theo ID"""
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
            WHERE G9_MaGiaVang = ?
        """, (gold_id,))

        item = row_to_dict(cursor)
        cursor.close()
        conn.close()

        return item

    @staticmethod
    def create_gold_price(data):
        """Thêm giá vàng mới"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                INSERT INTO G9_GiaVang (G9_LoaiVang, G9_GiaMua, G9_GiaBan)
                VALUES (?, ?, ?)
            """, (
                data.get("gold_type"),
                data.get("buy_price"),
                data.get("sell_price"),
            ))
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def update_gold_price(gold_id, data):
        """Cập nhật giá vàng"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                UPDATE G9_GiaVang
                SET G9_LoaiVang = ?, G9_GiaMua = ?, G9_GiaBan = ?, G9_NgayCapNhat = GETDATE()
                WHERE G9_MaGiaVang = ?
            """, (
                data.get("gold_type"),
                data.get("buy_price"),
                data.get("sell_price"),
                gold_id,
            ))
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()
