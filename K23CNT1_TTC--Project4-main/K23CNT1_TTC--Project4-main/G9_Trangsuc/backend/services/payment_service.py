# ==============================
# FILE: services/payment_service.py
# CHỨC NĂNG:
# - Xử lý thanh toán
# - Validate thông tin thanh toán
# - Kiểm tra trạng thái thanh toán
# ==============================

import hashlib
import hmac
from datetime import datetime


class PaymentService:
    # ==============================
    # KIỂM TRA TRẠNG THÁI THANH TOÁN
    # ==============================
    @staticmethod
    def is_payment_completed(payment_status):
        """Kiểm tra thanh toán đã hoàn thành"""
        return payment_status == "Đã thanh toán"

    # ==============================
    # KIỂM TRA THANH TOÁN FAILED
    # ==============================
    @staticmethod
    def is_payment_failed(payment_status):
        """Kiểm tra thanh toán bị thất bại"""
        return payment_status == "Thất bại"

    # ==============================
    # VALIDATE THÔNG TIN THANH TOÁN
    # ==============================
    @staticmethod
    def validate_payment_info(payment_method, order_total):
        """Kiểm tra thông tin thanh toán hợp lệ"""
        if not payment_method:
            raise ValueError("Phương thức thanh toán không được trống")

        valid_methods = ["COD", "CREDIT_CARD", "BANK_TRANSFER", "E_WALLET"]
        if payment_method not in valid_methods:
            raise ValueError(f"Phương thức thanh toán không hợp lệ: {payment_method}")

        if order_total <= 0:
            raise ValueError("Số tiền thanh toán phải lớn hơn 0")

        return True

    # ==============================
    # GENERATE TRANSACTION CODE
    # ==============================
    @staticmethod
    def generate_transaction_code(order_id, payment_method):
        """Tạo mã giao dịch"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        code = f"{payment_method}-{order_id}-{timestamp}"
        return code

    # ==============================
    # GENERATE PAYMENT SIGNATURE (for API verification)
    # ==============================
    @staticmethod
    def generate_signature(data, secret_key):
        """Tạo signature để xác thực thanh toán"""
        message = str(data).encode('utf-8')
        signature = hmac.new(
            secret_key.encode('utf-8'),
            message,
            hashlib.sha256
        ).hexdigest()
        return signature

    # ==============================
    # VERIFY PAYMENT SIGNATURE
    # ==============================
    @staticmethod
    def verify_signature(data, signature, secret_key):
        """Xác thực signature thanh toán"""
        expected_signature = PaymentService.generate_signature(data, secret_key)
        return hmac.compare_digest(signature, expected_signature)

    # ==============================
    # FORMAT SỐ TIỀN
    # ==============================
    @staticmethod
    def format_amount(amount):
        """Format số tiền để hiển thị"""
        return f"{amount:,.0f} VND"

    # ==============================
    # TÍNH PHÍ THANH TOÁN
    # ==============================
    @staticmethod
    def calculate_payment_fee(order_total, payment_method):
        """
        Tính phí thanh toán theo phương thức
        """
        fees = {
            "COD": 0,  # Thanh toán khi nhận hàng - không có phí
            "CREDIT_CARD": order_total * 0.02,  # 2%
            "BANK_TRANSFER": 0,  # Miễn phí
            "E_WALLET": order_total * 0.01  # 1%
        }
        fee = fees.get(payment_method, 0)
        return round(fee, 0)

    # ==============================
    # KIỂM TRA HẠN CHẾ THANH TOÁN
    # ==============================
    @staticmethod
    def check_payment_limit(user_id, payment_amount, daily_limit=10000000):
        """
        Kiểm tra có vượt quá hạn mức thanh toán hàng ngày không
        daily_limit: mặc định 10 triệu VND
        """
        if payment_amount > daily_limit:
            raise ValueError(f"Vượt quá hạn mức thanh toán hàng ngày ({daily_limit} VND)")

        return True

    # ==============================
    # GET PAYMENT METHODS
    # ==============================
    @staticmethod
    def get_available_payment_methods():
        """Lấy danh sách phương thức thanh toán khả dụng"""
        return [
            {
                "code": "COD",
                "name": "Thanh toán khi nhận hàng",
                "description": "Thanh toán trực tiếp khi nhận đơn hàng"
            },
            {
                "code": "CREDIT_CARD",
                "name": "Thẻ tín dụng",
                "description": "Thanh toán bằng thẻ tín dụng/ghi nợ",
                "fee": "2%"
            },
            {
                "code": "BANK_TRANSFER",
                "name": "Chuyển khoản ngân hàng",
                "description": "Chuyển khoản từ tài khoản ngân hàng",
                "fee": "Miễn phí"
            },
            {
                "code": "E_WALLET",
                "name": "Ví điện tử",
                "description": "Thanh toán bằng ví điện tử",
                "fee": "1%"
            }
        ]
