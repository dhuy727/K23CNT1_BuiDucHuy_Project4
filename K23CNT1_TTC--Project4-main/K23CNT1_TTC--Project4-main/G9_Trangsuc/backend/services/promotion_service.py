# ==============================
# FILE: services/promotion_service.py
# CHỨC NĂNG:
# - Áp dụng khuyến mãi
# - Tính chiết khấu
# - Validate mã khuyến mãi
# ==============================

from datetime import datetime
from models.promotion_model import PromotionModel


class PromotionService:
    # ==============================
    # VALIDATE MÃ KHUYẾN MÃI
    # ==============================
    @staticmethod
    def validate_promotion_code(code):
        """Kiểm tra mã khuyến mãi có hợp lệ"""
        promotion = PromotionModel.get_promotion_by_code(code)

        if not promotion:
            raise ValueError("Mã khuyến mãi không tồn tại hoặc đã hết hạn")

        return promotion

    # ==============================
    # KIỂM TRA KHUYẾN MÃI CÒN HIỆU LỰC
    # ==============================
    @staticmethod
    def is_promotion_active(promotion):
        """Kiểm tra khuyến mãi còn hoạt động"""
        status = promotion.get("status")
        return status == "Hoạt động"

    # ==============================
    # KIỂM TRA KHUYẾN MÃI CÒN THỜI GIAN
    # ==============================
    @staticmethod
    def is_promotion_in_date_range(start_date, end_date):
        """Kiểm tra ngày hiện tại có nằm trong khoảng khuyến mãi"""
        today = datetime.now().date()

        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, "%Y-%m-%d").date()

        return start_date <= today <= end_date

    # ==============================
    # TÍNH TIỀN GIẢM GIÁ
    # ==============================
    @staticmethod
    def calculate_discount(promotion, cart_total):
        """Tính tiền giảm giá từ khuyến mãi"""
        discount_value = promotion.get("discount_value", 0)

        # Giảm giá có thể là % hoặc số tiền cố định
        # Trong DB lưu là số tiền cố định (theo schema)
        discount_amount = min(discount_value, cart_total)

        return round(discount_amount, 0)

    # ==============================
    # APPLY PROMOTION CODE
    # ==============================
    @staticmethod
    def apply_promotion_code(code, cart_total):
        """Áp dụng mã khuyến mãi vào giỏ hàng"""
        try:
            promotion = PromotionService.validate_promotion_code(code)

            if not PromotionService.is_promotion_active(promotion):
                raise ValueError("Mã khuyến mãi đã ngừng hoạt động")

            discount = PromotionService.calculate_discount(promotion, cart_total)
            final_total = max(0, cart_total - discount)

            return {
                "success": True,
                "promotion_code": code,
                "discount_amount": discount,
                "original_total": cart_total,
                "final_total": round(final_total, 0)
            }

        except ValueError as e:
            return {
                "success": False,
                "message": str(e)
            }

    # ==============================
    # GET DANH SÁCH KHUYẾN MÃI ACTIVE
    # ==============================
    @staticmethod
    def get_active_promotions():
        """Lấy danh sách khuyến mãi đang hoạt động"""
        all_promotions = PromotionModel.get_all_promotions()

        active = [p for p in all_promotions
                  if p.get("status") == "Hoạt động"
                  and PromotionService.is_promotion_in_date_range(
                      p.get("start_date"),
                      p.get("end_date")
                  )]

        return active

    # ==============================
    # GET KHUYẾN MÃI CHO DANH MỤC
    # ==============================
    @staticmethod
    def get_promotions_for_category(category_id):
        """Lấy khuyến mãi đang hoạt động cho danh mục"""
        promotions = PromotionModel.get_promotions_by_category(category_id)

        active = [p for p in promotions
                  if p.get("status") == "Hoạt động"
                  and PromotionService.is_promotion_in_date_range(
                      p.get("start_date"),
                      p.get("end_date")
                  )]

        return active

    # ==============================
    # TÍNH GIÁ CUỐI CÙNG SAU GIẢM GIÁ
    # ==============================
    @staticmethod
    def calculate_final_price(original_price, promotion_code=None):
        """Tính giá cuối cùng sau khi áp dụng khuyến mãi"""
        if not promotion_code:
            return original_price

        try:
            promotion = PromotionService.validate_promotion_code(promotion_code)
            discount = PromotionService.calculate_discount(promotion, original_price)
            final_price = max(0, original_price - discount)
            return round(final_price, 0)
        except ValueError:
            return original_price
