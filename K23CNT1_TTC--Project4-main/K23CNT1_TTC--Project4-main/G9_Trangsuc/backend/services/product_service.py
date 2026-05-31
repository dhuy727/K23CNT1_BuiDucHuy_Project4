# ==============================
# FILE: services/product_service.py
# CHỨC NĂNG:
# - Tìm kiếm & lọc sản phẩm
# - Tính rating & đánh giá
# - Cập nhật tồn kho
# - Quản lý giá sản phẩm
# ==============================

from models.product_model import ProductModel
from models.review_model import ReviewModel


class ProductService:
    # ==============================
    # TÌM KIẾM SẢN PHẨM
    # ==============================
    @staticmethod
    def search_products(keyword, category_id=None, min_price=None, max_price=None):
        """
        Tìm kiếm sản phẩm theo từ khóa và bộ lọc
        """
        products = ProductModel.get_all_products()

        # Lọc theo từ khóa
        if keyword:
            products = [p for p in products if keyword.lower() in p.get("name", "").lower()]

        # Lọc theo danh mục
        if category_id:
            products = [p for p in products if p.get("category_id") == category_id]

        # Lọc theo giá
        if min_price is not None:
            products = [p for p in products if p.get("price", 0) >= min_price]

        if max_price is not None:
            products = [p for p in products if p.get("price", 0) <= max_price]

        return products

    # ==============================
    # LẤY RATING TRUNG BÌNH SẢN PHẨM
    # ==============================
    @staticmethod
    def get_product_rating(product_id):
        """Tính rating trung bình từ các đánh giá"""
        reviews = ReviewModel.get_reviews_by_product(product_id)

        if not reviews:
            return 0

        total_stars = sum([r.get("rating", 0) for r in reviews])
        avg_rating = total_stars / len(reviews)

        return round(avg_rating, 1)

    # ==============================
    # LẤY SỐ LƯỢNG ĐÁNH GIÁ
    # ==============================
    @staticmethod
    def get_review_count(product_id):
        """Lấy số lượng đánh giá của sản phẩm"""
        reviews = ReviewModel.get_reviews_by_product(product_id)
        return len(reviews) if reviews else 0

    # ==============================
    # KIỂM TRA TỒN KHO
    # ==============================
    @staticmethod
    def check_stock(product_id, quantity):
        """Kiểm tra sản phẩm có đủ số lượng không"""
        product = ProductModel.get_product_by_id(product_id)

        if not product:
            raise ValueError("Sản phẩm không tồn tại")

        available_quantity = product.get("quantity", 0)

        if quantity > available_quantity:
            if available_quantity <= 0:
                raise ValueError("Sản phẩm đã hết hàng trong kho")
            raise ValueError(
                f"Kho không còn đủ hàng. Chỉ còn {available_quantity} sản phẩm."
            )

        return True

    # ==============================
    # KIỂM TRA SẢN PHẨM CÓ HÀNG KHÔNG
    # ==============================
    @staticmethod
    def is_in_stock(product_id):
        """Kiểm tra sản phẩm còn hàng hay không"""
        product = ProductModel.get_product_by_id(product_id)

        if not product:
            return False

        return product.get("quantity", 0) > 0

    # ==============================
    # TÍNH GIÁ SAU GIẢM GIÁ
    # ==============================
    @staticmethod
    def calculate_discounted_price(original_price, discount_percent=0, discount_amount=0):
        """
        Tính giá sau khi giảm
        - discount_percent: phần trăm giảm (%)
        - discount_amount: số tiền giảm (VND)
        """
        if discount_percent > 0:
            discount = (original_price * discount_percent) / 100
        elif discount_amount > 0:
            discount = discount_amount
        else:
            discount = 0

        final_price = max(0, original_price - discount)
        return round(final_price, 0)

    # ==============================
    # LẤY SẢN PHẨM LIÊN QUAN
    # ==============================
    @staticmethod
    def get_related_products(product_id, category_id, limit=6):
        """Lấy các sản phẩm liên quan cùng danh mục"""
        all_products = ProductModel.get_all_products()

        # Lọc: cùng danh mục, không phải chính nó
        related = [p for p in all_products
                   if p.get("category_id") == category_id and p.get("id") != product_id]

        return related[:limit]
