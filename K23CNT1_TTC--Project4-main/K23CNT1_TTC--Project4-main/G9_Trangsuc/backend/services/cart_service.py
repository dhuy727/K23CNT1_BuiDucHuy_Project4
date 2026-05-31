# ==============================
# FILE: services/cart_service.py
# CHỨC NĂNG:
# - Quản lý giỏ hàng
# - Tính tổng tiền
# - Validate giỏ hàng
# ==============================

from models.cart_model import CartModel
from models.product_model import ProductModel
from services.product_service import ProductService


class CartService:
    # ==============================
    # LẤY TỔNG TIỀN GIỎ HÀNG
    # ==============================
    @staticmethod
    def get_cart_total(user_id):
        """Tính tổng tiền giỏ hàng"""
        cart_items = CartModel.get_cart_by_user(user_id)

        if not cart_items:
            return 0

        total = sum([item.get("total", 0) for item in cart_items])
        return round(total, 0)

    # ==============================
    # LẤY SỐ LƯỢNG SẢN PHẨM TRONG GIỎ
    # ==============================
    @staticmethod
    def get_cart_item_count(user_id):
        """Đếm số sản phẩm trong giỏ hàng"""
        cart_items = CartModel.get_cart_by_user(user_id)
        return len(cart_items) if cart_items else 0

    # ==============================
    # KIỂM TRA GIỎ HÀNG CÓ HÀNG KHÔNG
    # ==============================
    @staticmethod
    def is_cart_empty(user_id):
        """Kiểm tra giỏ hàng có trống không"""
        count = CartService.get_cart_item_count(user_id)
        return count == 0

    # ==============================
    # KIỂM TRA HÀNG CÓ SẴN TRONG GIỎ KHÔNG
    # ==============================
    @staticmethod
    def add_to_cart(user_id, product_id, quantity):
        """Thêm vào giỏ sau khi kiểm tra tồn kho (cộng dồn số lượng đã có)."""
        quantity = int(quantity)
        if quantity < 1:
            raise ValueError("Số lượng phải lớn hơn hoặc bằng 1")

        cart_items = CartModel.get_cart_by_user(user_id)
        current_in_cart = 0
        for item in cart_items:
            if item.get("product_id") == product_id:
                current_in_cart = int(item.get("quantity", 0))
                break

        ProductService.check_stock(product_id, current_in_cart + quantity)
        return CartModel.add_to_cart(user_id, product_id, quantity)

    @staticmethod
    def update_cart_item(cart_detail_id, quantity):
        """Cập nhật số lượng sau khi kiểm tra tồn kho."""
        quantity = int(quantity)
        if quantity < 1:
            raise ValueError("Số lượng phải lớn hơn hoặc bằng 1")

        product_id = CartModel.get_cart_line_product_id(cart_detail_id)
        ProductService.check_stock(product_id, quantity)
        return CartModel.update_cart_item(cart_detail_id, quantity)

    @staticmethod
    def validate_cart_availability(user_id):
        """
        Kiểm tra tất cả sản phẩm trong giỏ còn hàng không
        Trả về: (is_valid, error_message)
        """
        cart_items = CartModel.get_cart_by_user(user_id)

        if not cart_items:
            return False, "Giỏ hàng trống"

        for item in cart_items:
            product_id = item.get("product_id")
            quantity = item.get("quantity", 0)

            try:
                ProductService.check_stock(product_id, quantity)
            except ValueError as e:
                return False, str(e)

        return True, "OK"

    # ==============================
    # TÍNH TIỀN SẢN PHẨM TRONG GIỎ
    # ==============================
    @staticmethod
    def calculate_item_total(product_id, quantity):
        """Tính tổng tiền của 1 sản phẩm trong giỏ"""
        product = ProductModel.get_product_by_id(product_id)

        if not product:
            raise ValueError("Sản phẩm không tồn tại")

        price = product.get("price", 0)
        total = price * quantity

        return round(total, 0)

    # ==============================
    # APPLY KHUYẾN MÃI CHO GIỎ HÀNG
    # ==============================
    @staticmethod
    def apply_promotion_to_cart(cart_total, promotion_discount):
        """
        Áp dụng khuyến mãi vào giỏ hàng
        promotion_discount: số tiền giảm
        """
        final_total = max(0, cart_total - promotion_discount)
        return round(final_total, 0)

    # ==============================
    # GET CHI TIẾT GIỎ HÀNG
    # ==============================
    @staticmethod
    def get_cart_summary(user_id):
        """Lấy tóm tắt giỏ hàng"""
        cart_items = CartModel.get_cart_by_user(user_id)
        item_count = CartService.get_cart_item_count(user_id)
        total = CartService.get_cart_total(user_id)

        return {
            "item_count": item_count,
            "total": total,
            "items": cart_items
        }
