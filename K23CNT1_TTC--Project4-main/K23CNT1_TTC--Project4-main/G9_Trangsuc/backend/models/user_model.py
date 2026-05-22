# ==============================
# FILE: models/user_model.py
# CHỨC NĂNG:
# - Xử lý tất cả SQL logic liên quan tới người dùng
# ==============================

from database.db import get_connection, rows_to_dict


class UserModel:
    """Model xử lý tất cả operations liên quan tới người dùng"""

    @staticmethod
    def get_all_users():
        """Lấy danh sách tất cả người dùng"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                nd.G9_MaNguoiDung AS id,
                nd.G9_HoTen AS name,
                nd.G9_TenDangNhap AS username,
                nd.G9_Email AS email,
                nd.G9_SoDienThoai AS phone,
                nd.G9_TrangThai AS status,
                vt.G9_TenVaiTro AS role
            FROM G9_NguoiDung nd
            JOIN G9_VaiTro vt ON nd.G9_MaVaiTro = vt.G9_MaVaiTro
        """)

        users = rows_to_dict(cursor)
        cursor.close()
        conn.close()

        return users

    @staticmethod
    def update_user_status(user_id, status):
        """Cập nhật trạng thái người dùng"""
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
