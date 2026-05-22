# ==============================
# FILE: services/user_service.py
# CHỨC NĂNG:
# - Quản lý hồ sơ người dùng
# - Validate dữ liệu user
# - Cập nhật thông tin
# ==============================

import re
from models.user_model import UserModel


class UserService:
    # ==============================
    # VALIDATE EMAIL
    # ==============================
    @staticmethod
    def validate_email(email):
        """Kiểm tra email có hợp lệ"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

    # ==============================
    # VALIDATE PHONE
    # ==============================
    @staticmethod
    def validate_phone(phone):
        """Kiểm tra số điện thoại có hợp lệ"""
        # SĐT Việt Nam: 10 chữ số, bắt đầu bằng 0
        pattern = r'^0\d{9}$'
        return re.match(pattern, phone) is not None

    # ==============================
    # VALIDATE PASSWORD
    # ==============================
    @staticmethod
    def validate_password(password):
        """
        Kiểm tra mật khẩu đủ mạnh
        - Tối thiểu 8 ký tự
        - Phải có số, chữ hoa, chữ thường, ký tự đặc biệt
        """
        if len(password) < 8:
            raise ValueError("Mật khẩu tối thiểu 8 ký tự")

        if not re.search(r'[0-9]', password):
            raise ValueError("Mật khẩu phải chứa ít nhất 1 chữ số")

        if not re.search(r'[A-Z]', password):
            raise ValueError("Mật khẩu phải chứa ít nhất 1 chữ hoa")

        if not re.search(r'[a-z]', password):
            raise ValueError("Mật khẩu phải chứa ít nhất 1 chữ thường")

        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise ValueError("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt")

        return True

    # ==============================
    # VALIDATE THÔNG TIN PROFILE
    # ==============================
    @staticmethod
    def validate_profile(full_name, email, phone):
        """Kiểm tra thông tin hồ sơ"""
        errors = []

        if not full_name or len(full_name.strip()) < 2:
            errors.append("Tên phải tối thiểu 2 ký tự")

        if not UserService.validate_email(email):
            errors.append("Email không hợp lệ")

        if not UserService.validate_phone(phone):
            errors.append("Số điện thoại không hợp lệ")

        if errors:
            raise ValueError(", ".join(errors))

        return True

    # ==============================
    # GET USER PROFILE
    # ==============================
    @staticmethod
    def get_user_profile(user_id):
        """Lấy thông tin hồ sơ người dùng"""
        users = UserModel.get_all_users()

        user = next((u for u in users if u.get("id") == user_id), None)

        if not user:
            raise ValueError("Người dùng không tồn tại")

        # Loại bỏ thông tin nhạy cảm
        user.pop("password", None)

        return user

    # ==============================
    # KIỂM TRA USER STATUS
    # ==============================
    @staticmethod
    def is_user_active(user_status):
        """Kiểm tra người dùng có đang hoạt động"""
        return user_status == "Hoạt động"

    # ==============================
    # KIỂM TRA USER BỊ KHÓA
    # ==============================
    @staticmethod
    def is_user_banned(user_status):
        """Kiểm tra người dùng bị khóa"""
        return user_status == "Bị khóa"

    # ==============================
    # FORMAT PHONE NUMBER
    # ==============================
    @staticmethod
    def format_phone(phone):
        """Format số điện thoại"""
        # Ví dụ: 0123456789 -> 0123 456 789
        if len(phone) == 10:
            return f"{phone[:4]} {phone[4:7]} {phone[7:]}"
        return phone
