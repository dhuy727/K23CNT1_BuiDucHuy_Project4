# ==============================
# FILE: models/auth_model.py
# CHỨC NĂNG:
# - Xử lý tất cả SQL logic liên quan tới authentication
# ==============================

from database.db import get_connection, row_to_dict


class AuthModel:
    """Model xử lý tất cả operations liên quan tới authentication"""

    @staticmethod
    def get_user_by_username(username):
        """Lấy thông tin user theo username"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                nd.G9_MaNguoiDung AS id,
                nd.G9_HoTen AS full_name,
                nd.G9_TenDangNhap AS username,
                nd.G9_Email AS email,
                nd.G9_MatKhau AS password,
                vt.G9_TenVaiTro AS role
            FROM G9_NguoiDung nd
            INNER JOIN G9_VaiTro vt 
                ON nd.G9_MaVaiTro = vt.G9_MaVaiTro
            WHERE nd.G9_TenDangNhap = ?
        """, (username,))

        user = row_to_dict(cursor)
        cursor.close()
        conn.close()

        return user
