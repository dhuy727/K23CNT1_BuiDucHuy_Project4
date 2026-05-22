# ==============================
# FILE: services/gold_service.py
# CHỨC NĂNG:
# - Quản lý giá vàng
# - Tính toán giá vàng
# - Theo dõi biến động giá
# ==============================

from models.gold_model import GoldModel
from datetime import datetime, timedelta


class GoldService:
    # ==============================
    # VALIDATE GIÁB VÀNG
    # ==============================
    @staticmethod
    def validate_gold_price(buy_price, sell_price):
        """Kiểm tra giá vàng hợp lệ"""
        if buy_price <= 0 or sell_price <= 0:
            raise ValueError("Giá vàng phải lớn hơn 0")

        if sell_price < buy_price:
            raise ValueError("Giá bán phải lớn hơn hoặc bằng giá mua")

        return True

    # ==============================
    # TÍNH MARGIN LỢINHUẬN
    # ==============================
    @staticmethod
    def calculate_gold_margin(buy_price, sell_price):
        """Tính margin lợi nhuận"""
        if buy_price == 0:
            return 0

        margin = ((sell_price - buy_price) / buy_price) * 100
        return round(margin, 2)

    # ==============================
    # LẤY GIÁ VÀNG HIỆN TẠI
    # ==============================
    @staticmethod
    def get_current_gold_prices():
        """Lấy giá vàng hiện tại theo loại"""
        prices = GoldModel.get_all_gold_prices()

        if not prices:
            return []

        # Nhóm theo loại vàng
        grouped = {}
        for price in prices:
            gold_type = price.get("gold_type", "Unknown")
            if gold_type not in grouped:
                grouped[gold_type] = price

        return list(grouped.values())

    # ==============================
    # SO SÁNH GIÁ VÀNG
    # ==============================
    @staticmethod
    def compare_gold_prices(gold_type, old_prices, new_prices):
        """
        So sánh giá vàng cũ và mới
        Trả về: sự thay đổi % và tuyệt đối
        """
        old = next((p for p in old_prices if p.get("gold_type") == gold_type), None)
        new = next((p for p in new_prices if p.get("gold_type") == gold_type), None)

        if not old or not new:
            return None

        old_buy = old.get("buy_price", 0)
        new_buy = new.get("buy_price", 0)

        change_amount = new_buy - old_buy
        change_percent = (change_amount / old_buy * 100) if old_buy != 0 else 0

        return {
            "gold_type": gold_type,
            "old_price": old_buy,
            "new_price": new_buy,
            "change_amount": round(change_amount, 0),
            "change_percent": round(change_percent, 2),
            "direction": "up" if change_amount > 0 else ("down" if change_amount < 0 else "stable")
        }

    # ==============================
    # TÍNH LƯỢNG VÀNG TỪ GIÁ TIỀN
    # ==============================
    @staticmethod
    def calculate_gold_weight_from_price(price, gold_type="24K"):
        """
        Tính lượng vàng từ giá tiền
        gold_type: loại vàng (24K, 18K, SJC, etc)
        """
        current_prices = GoldService.get_current_gold_prices()
        gold_price = next((p for p in current_prices if p.get("gold_type") == gold_type), None)

        if not gold_price:
            raise ValueError(f"Không tìm thấy giá vàng loại {gold_type}")

        sell_price = gold_price.get("sell_price", 0)

        if sell_price == 0:
            raise ValueError("Giá bán vàng không hợp lệ")

        # Giả sử 1 chỉ = 3.75g
        weight_ly = price / sell_price
        weight_gram = weight_ly * 3.75

        return {
            "price": price,
            "gold_type": gold_type,
            "weight_ly": round(weight_ly, 2),
            "weight_gram": round(weight_gram, 2)
        }

    # ==============================
    # LẤY LỊCH SỬ GIÁ VÀNG
    # ==============================
    @staticmethod
    def get_gold_price_history(days=7):
        """
        Mô phỏng lấy lịch sử giá vàng (cần database để lưu lịch)
        days: số ngày lấy lịch sử
        """
        # Cần có bảng lưu lịch sử giá vàng
        # Hiện tại chỉ lấy giá hiện tại
        current = GoldService.get_current_gold_prices()

        return [{
            "date": datetime.now().strftime("%Y-%m-%d"),
            "prices": current
        }]

    # ==============================
    # KIỂM TRA GIÁ VÀNG CÓ THAY ĐỔI
    # ==============================
    @staticmethod
    def has_gold_price_changed(old_prices, new_prices):
        """Kiểm tra giá vàng có thay đổi so với trước"""
        if not old_prices or not new_prices:
            return True

        for gold_type in ["24K", "18K", "SJC"]:
            old = next((p for p in old_prices if p.get("gold_type") == gold_type), None)
            new = next((p for p in new_prices if p.get("gold_type") == gold_type), None)

            if not old or not new:
                continue

            if old.get("sell_price") != new.get("sell_price"):
                return True

        return False
