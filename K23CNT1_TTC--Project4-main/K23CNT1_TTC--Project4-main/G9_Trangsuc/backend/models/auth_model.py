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

    @staticmethod
    def get_user_by_id(user_id):
        """Lấy thông tin user theo ID"""
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
            WHERE nd.G9_MaNguoiDung = ?
        """, (user_id,))

        user = row_to_dict(cursor)
        cursor.close()
        conn.close()

        return user

    @staticmethod
    def get_user_by_email(email):
        """Lấy thông tin user theo email"""
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
            WHERE nd.G9_Email = ?
        """, (email,))

        user = row_to_dict(cursor)
        cursor.close()
        conn.close()

        return user

    @staticmethod
    def create_user(full_name, username, hashed_password, email=None, phone=None, role_id=3):
        """Tạo người dùng mới"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO G9_NguoiDung (
                G9_HoTen,
                G9_TenDangNhap,
                G9_MatKhau,
                G9_Email,
                G9_SoDienThoai,
                G9_MaVaiTro
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (full_name, username, hashed_password, email, phone, role_id))
        conn.commit()
        cursor.close()
        conn.close()

        return AuthModel.get_user_by_username(username)
