# ==============================
# FILE: models/promotion_model.py
# CHỨC NĂNG:
# - Quản lý khuyến mãi (G9_KhuyenMai)
# - Quản lý liên kết khuyến mãi - danh mục
# ==============================

from database.db import get_connection, rows_to_dict, row_to_dict


class PromotionModel:
    # ==============================
    # LẤY TẤT CẢ KHUYẾN MÃI
    # ==============================
    @staticmethod
    def get_all_promotions():
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                G9_MaKhuyenMai AS id,
                G9_MaCode AS code,
                G9_GiaTriGiam AS discount_value,
                G9_NgayBatDau AS start_date,
                G9_NgayKetThuc AS end_date,
                G9_TrangThai AS status
            FROM G9_KhuyenMai
            ORDER BY G9_NgayBatDau DESC
        """)

        promotions = rows_to_dict(cursor)
        cursor.close()
        conn.close()

        return promotions

    # ==============================
    # LẤY KHUYẾN MÃI THEO ID
    # ==============================
    @staticmethod
    def get_promotion_by_id(promotion_id):
        conn = get_connection()
        cursor = conn.cursor()

        # Lấy thông tin khuyến mãi
        cursor.execute("""
            SELECT 
                G9_MaKhuyenMai AS id,
                G9_MaCode AS code,
                G9_GiaTriGiam AS discount_value,
                G9_NgayBatDau AS start_date,
                G9_NgayKetThuc AS end_date,
                G9_TrangThai AS status
            FROM G9_KhuyenMai
            WHERE G9_MaKhuyenMai = ?
        """, (promotion_id,))

        promotion = row_to_dict(cursor)

        if not promotion:
            cursor.close()
            conn.close()
            return None

        # Lấy danh sách danh mục áp dụng
        cursor.execute("""
            SELECT 
                dm.G9_MaDanhMuc AS id,
                dm.G9_TenDanhMuc AS name
            FROM G9_DanhMuc_KhuyenMai dkm
            INNER JOIN G9_DanhMuc dm
                ON dkm.G9_MaDanhMuc = dm.G9_MaDanhMuc
            WHERE dkm.G9_MaKhuyenMai = ?
        """, (promotion_id,))

        categories = rows_to_dict(cursor)

        cursor.close()
        conn.close()

        return {
            "promotion": promotion,
            "categories": categories
        }

    # ==============================
    # LẤY KHUYẾN MÃI THEO CODE
    # ==============================
    @staticmethod
    def get_promotion_by_code(code):
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                G9_MaKhuyenMai AS id,
                G9_MaCode AS code,
                G9_GiaTriGiam AS discount_value,
                G9_NgayBatDau AS start_date,
                G9_NgayKetThuc AS end_date,
                G9_TrangThai AS status
            FROM G9_KhuyenMai
            WHERE G9_MaCode = ? AND G9_TrangThai = N'Hoạt động'
            AND GETDATE() BETWEEN G9_NgayBatDau AND G9_NgayKetThuc
        """, (code,))

        promotion = row_to_dict(cursor)
        cursor.close()
        conn.close()

        return promotion

    # ==============================
    # TẠO KHUYẾN MÃI MỚI
    # ==============================
    @staticmethod
    def create_promotion(code, discount_value, start_date, end_date, categories=None):
        conn = get_connection()
        cursor = conn.cursor()

        try:
            # Tạo khuyến mãi
            cursor.execute("""
                INSERT INTO G9_KhuyenMai
                (
                    G9_MaCode,
                    G9_GiaTriGiam,
                    G9_NgayBatDau,
                    G9_NgayKetThuc,
                    G9_TrangThai
                )
                OUTPUT INSERTED.G9_MaKhuyenMai
                VALUES (?, ?, ?, ?, N'Hoạt động')
            """, (code, discount_value, start_date, end_date))

            promotion_id = cursor.fetchone()[0]

            # Thêm danh mục áp dụng nếu có
            if categories:
                for category_id in categories:
                    cursor.execute("""
                        INSERT INTO G9_DanhMuc_KhuyenMai
                        (G9_MaDanhMuc, G9_MaKhuyenMai)
                        VALUES (?, ?)
                    """, (category_id, promotion_id))

            conn.commit()
            cursor.close()
            conn.close()

            return promotion_id

        except Exception as e:
            conn.rollback()
            cursor.close()
            conn.close()
            raise e

    # ==============================
    # CẬP NHẬT KHUYẾN MÃI
    # ==============================
    @staticmethod
    def update_promotion(promotion_id, discount_value=None, start_date=None, end_date=None, status=None, categories=None):
        conn = get_connection()
        cursor = conn.cursor()

        try:
            # Cập nhật thông tin khuyến mãi
            update_fields = []
            params = []

            if discount_value is not None:
                update_fields.append("G9_GiaTriGiam = ?")
                params.append(discount_value)

            if start_date is not None:
                update_fields.append("G9_NgayBatDau = ?")
                params.append(start_date)

            if end_date is not None:
                update_fields.append("G9_NgayKetThuc = ?")
                params.append(end_date)

            if status is not None:
                update_fields.append("G9_TrangThai = ?")
                params.append(status)

            if update_fields:
                query = f"UPDATE G9_KhuyenMai SET {', '.join(update_fields)} WHERE G9_MaKhuyenMai = ?"
                params.append(promotion_id)
                cursor.execute(query, params)

            # Cập nhật danh mục nếu có
            if categories is not None:
                # Xóa danh mục cũ
                cursor.execute("DELETE FROM G9_DanhMuc_KhuyenMai WHERE G9_MaKhuyenMai = ?", (promotion_id,))

                # Thêm danh mục mới
                for category_id in categories:
                    cursor.execute("""
                        INSERT INTO G9_DanhMuc_KhuyenMai
                        (G9_MaDanhMuc, G9_MaKhuyenMai)
                        VALUES (?, ?)
                    """, (category_id, promotion_id))

            conn.commit()
            cursor.close()
            conn.close()

        except Exception as e:
            conn.rollback()
            cursor.close()
            conn.close()
            raise e

    # ==============================
    # XÓA KHUYẾN MÃI
    # ==============================
    @staticmethod
    def delete_promotion(promotion_id):
        conn = get_connection()
        cursor = conn.cursor()

        try:
            # Xóa sẽ tự động xóa danh mục liên kết vì có ON DELETE CASCADE
            cursor.execute("""
                DELETE FROM G9_KhuyenMai
                WHERE G9_MaKhuyenMai = ?
            """, (promotion_id,))

            conn.commit()
            cursor.close()
            conn.close()

        except Exception as e:
            conn.rollback()
            cursor.close()
            conn.close()
            raise e

    # ==============================
    # LẤY KHUYẾN MÃI THEO DANH MỤC
    # ==============================
    @staticmethod
    def get_promotions_by_category(category_id):
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                km.G9_MaKhuyenMai AS id,
                km.G9_MaCode AS code,
                km.G9_GiaTriGiam AS discount_value,
                km.G9_NgayBatDau AS start_date,
                km.G9_NgayKetThuc AS end_date,
                km.G9_TrangThai AS status
            FROM G9_KhuyenMai km
            INNER JOIN G9_DanhMuc_KhuyenMai dkm
                ON km.G9_MaKhuyenMai = dkm.G9_MaKhuyenMai
            WHERE dkm.G9_MaDanhMuc = ?
            AND km.G9_TrangThai = N'Hoạt động'
            AND GETDATE() BETWEEN km.G9_NgayBatDau AND km.G9_NgayKetThuc
            ORDER BY km.G9_NgayBatDau DESC
        """, (category_id,))

        promotions = rows_to_dict(cursor)
        cursor.close()
        conn.close()

        return promotions

    # ==============================
    # KIỂM TRA KHUYẾN MÃI CÓN HIỆU LỰC
    # ==============================
    @staticmethod
    def is_promotion_valid(code):
        promotion = PromotionModel.get_promotion_by_code(code)
        return promotion is not None
