# ==============================
# FILE: services/order_service.py
# CHỨC NĂNG:
# - Quản lý đơn hàng
# - Tính toán tổng tiền đơn
# - Cập nhật trạng thái
# - Validate đơn hàng
# ==============================

from datetime import datetime
from models.order_model import OrderModel
from models.cart_model import CartModel
from services.cart_service import CartService


class OrderService:
    # ==============================
    # VALIDATE THÔNG TIN ĐẶT HÀNG
    # ==============================
    @staticmethod
    def validate_checkout(user_id, receiver_name, phone, address):
        """Kiểm tra thông tin đặt hàng có hợp lệ"""
        errors = []

        if not user_id:
            errors.append("Người dùng không hợp lệ")

        if not receiver_name or len(receiver_name.strip()) == 0:
            errors.append("Tên người nhận không được trống")

        if not phone or len(phone.strip()) < 10:
            errors.append("Số điện thoại không hợp lệ")

        if not address or len(address.strip()) == 0:
            errors.append("Địa chỉ giao hàng không được trống")

        # Kiểm tra giỏ hàng
        if CartService.is_cart_empty(user_id):
            errors.append("Giỏ hàng trống")

        # Kiểm tra hàng có sẵn
        is_valid, message = CartService.validate_cart_availability(user_id)
        if not is_valid:
            errors.append(message)

        if errors:
            raise ValueError(", ".join(errors))

        return True

    # ==============================
    # TÍNH TỔNG TIỀN ĐƠN HÀNG
    # ==============================
    @staticmethod
    def calculate_order_total(user_id, discount=0, shipping_fee=0):
        """Tính tổng tiền đơn hàng"""
        cart_total = CartService.get_cart_total(user_id)
        final_total = cart_total - discount + shipping_fee
        return max(0, round(final_total, 0))

    # ==============================
    # LẤY TRẠNG THÁI ĐƠN HÀNG TIẾP THEO
    # ==============================
    @staticmethod
    def get_next_status(current_status):
        """Lấy trạng thái tiếp theo của đơn hàng"""
        status_flow = {
            "Chờ xác nhận": "Đã xác nhận",
            "Đã xác nhận": "Đang chuẩn bị",
            "Đang chuẩn bị": "Đang giao",
            "Đang giao": "Đã giao",
            "Đã giao": "Hoàn thành"
        }
        return status_flow.get(current_status, current_status)

    # ==============================
    # KIỂM TRA CÓ THỂ HỦY ĐƠN KHÔNG
    # ==============================
    @staticmethod
    def can_cancel_order(order_status):
        """Kiểm tra đơn hàng có thể hủy được không"""
        cancelable_statuses = ["Chờ xác nhận", "Đã xác nhận"]
        return order_status in cancelable_statuses

    # ==============================
    # KIỂM TRA CÓ THỂ RETURN ĐƠN KHÔNG
    # ==============================
    @staticmethod
    def can_return_order(order_status):
        """Kiểm tra đơn hàng có thể trả lại được không"""
        returnable_statuses = ["Đã giao", "Hoàn thành"]
        return order_status in returnable_statuses

    # ==============================
    # TÍNH THỜI GIAN DỰ KIẾN GIAO HÀNG
    # ==============================
    @staticmethod
    def estimate_delivery_date(days=3):
        """Tính ngày dự kiến giao hàng (mặc định 3 ngày)"""
        from datetime import timedelta
        estimated = datetime.now() + timedelta(days=days)
        return estimated.strftime("%Y-%m-%d")

    # ==============================
    # LẤY THÔNG TIN GIAO HÀNG
    # ==============================
    @staticmethod
    def get_shipping_info(order_id):
        """Lấy thông tin chi tiết đơn hàng"""
        return OrderModel.get_order_detail(order_id)

    # ==============================
    # KIỂM TRA THANH TOÁN CÓ THỰC HIỆN CHƯA
    # ==============================
    @staticmethod
    def is_payment_pending(payment_status):
        """Kiểm tra thanh toán đang chờ"""
        return payment_status == "Chưa thanh toán"
