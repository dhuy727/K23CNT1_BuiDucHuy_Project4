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

    @staticmethod
    def find_or_create_google_user(email, full_name):
        """Tìm user theo email hoặc tạo mới khi đăng nhập Google."""
        from models.auth_model import AuthModel

        user = AuthModel.get_user_by_email(email)
        if user:
            return user

        base_username = (email.split("@")[0] or "user").replace(".", "_")[:40]
        username = base_username
        suffix = 1
        while AuthModel.get_user_by_username(username):
            username = f"{base_username}{suffix}"
            suffix += 1

        random_password = AuthService.hash_password(secrets.token_urlsafe(24))
        return AuthModel.create_user(
            full_name or username,
            username,
            random_password,
            email=email,
        )
