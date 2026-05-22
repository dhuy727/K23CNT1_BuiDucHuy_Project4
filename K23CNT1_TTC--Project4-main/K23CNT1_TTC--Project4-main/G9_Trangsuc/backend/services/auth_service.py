# ==============================
# FILE: services/auth_service.py
# CHỨC NĂNG:
# - Xác thực người dùng
# - Hash/verify password
# - Quản lý JWT token
# ==============================

import hashlib
import hmac
import secrets
from utils.jwt_helper import generate_token, verify_token


class AuthService:
    # ==============================
    # HASH PASSWORD
    # ==============================
    @staticmethod
    def hash_password(password):
        """Hash password sử dụng SHA256"""
        return hashlib.sha256(password.encode()).hexdigest()

    # ==============================
    # VERIFY PASSWORD
    # ==============================
    @staticmethod
    def verify_password(password, hashed_password):
        """So sánh password với hashed password"""
        return hashlib.sha256(password.encode()).hexdigest() == hashed_password

    # ==============================
    # GENERATE TOKEN
    # ==============================
    @staticmethod
    def generate_auth_token(user):
        """Tạo JWT token cho user sau khi đăng nhập"""
        return generate_token(user)

    # ==============================
    # VERIFY TOKEN
    # ==============================
    @staticmethod
    def verify_auth_token(token):
        """Kiểm tra xem token có hợp lệ không"""
        return verify_token(token)

    # ==============================
    # GENERATE RANDOM PASSWORD RESET TOKEN
    # ==============================
    @staticmethod
    def generate_reset_token():
        """Tạo token để reset password"""
        return secrets.token_urlsafe(32)

    # ==============================
    # GENERATE OTP (One-Time Password)
    # ==============================
    @staticmethod
    def generate_otp():
        """Tạo OTP 6 chữ số cho xác minh 2FA"""
        return ''.join([str(secrets.randbelow(10)) for _ in range(6)])
