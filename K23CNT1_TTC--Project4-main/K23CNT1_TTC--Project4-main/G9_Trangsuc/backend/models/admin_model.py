# ==============================
# FILE: models/admin_model.py
# CHỨC NĂNG:
# - Xử lý tất cả SQL logic liên quan tới admin management
# ==============================

from database.db import get_connection, rows_to_dict


class AdminModel:
    """Model xử lý tất cả operations liên quan tới admin"""

    @staticmethod
    def get_all_users():
        """Lấy danh sách tất cả người dùng (admin)"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                nd.G9_MaNguoiDung AS id,
                nd.G9_HoTen AS full_name,
                nd.G9_TenDangNhap AS username,
                nd.G9_Email AS email,
                nd.G9_SoDienThoai AS phone,
                vt.G9_TenVaiTro AS role,
                nd.G9_TrangThai AS status,
                nd.G9_NgayTao AS created_at
            FROM G9_NguoiDung nd
            INNER JOIN G9_VaiTro vt
                ON nd.G9_MaVaiTro = vt.G9_MaVaiTro
            ORDER BY nd.G9_MaNguoiDung DESC
        """)

        users = rows_to_dict(cursor)
        cursor.close()
        conn.close()

        return users

    @staticmethod
    def update_user_status(user_id, status):
        """Cập nhật trạng thái người dùng (admin)"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                UPDATE G9_NguoiDung
                SET G9_TrangThai = ?
                WHERE G9_MaNguoiDung = ?
            """, (status, user_id))

            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()
