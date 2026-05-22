# ==============================
# FILE: models/review_model.py
# CHỨC NĂNG:
# - Xử lý tất cả SQL logic liên quan tới đánh giá
# ==============================

from database.db import get_connection, rows_to_dict


class ReviewModel:
    """Model xử lý tất cả operations liên quan tới đánh giá"""

    @staticmethod
    def get_reviews_by_product(product_id):
        """Lấy danh sách đánh giá theo sản phẩm"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                dg.G9_MaDanhGia AS id,
                nd.G9_HoTen AS full_name,
                dg.G9_SoSao AS rating,
                dg.G9_NoiDung AS content,
                dg.G9_TrangThai AS status,
                dg.G9_NgayDanhGia AS created_at
            FROM G9_DanhGia dg
            INNER JOIN G9_NguoiDung nd
                ON dg.G9_MaNguoiDung = nd.G9_MaNguoiDung
            WHERE dg.G9_MaSanPham = ?
            ORDER BY dg.G9_MaDanhGia DESC
        """, (product_id,))

        reviews = rows_to_dict(cursor)
        cursor.close()
        conn.close()

        return reviews

    @staticmethod
    def create_review(data):
        """Tạo đánh giá mới"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                INSERT INTO G9_DanhGia
                (
                    G9_MaSanPham,
                    G9_MaNguoiDung,
                    G9_SoSao,
                    G9_NoiDung
                )
                VALUES (?, ?, ?, ?)
            """, (
                data.get("product_id"),
                data.get("user_id"),
                data.get("rating"),
                data.get("content")
            ))

            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()
