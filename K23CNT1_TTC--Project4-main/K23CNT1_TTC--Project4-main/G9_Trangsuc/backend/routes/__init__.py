# ==============================
# FILE: routes/__init__.py
# CHỨC NĂNG:
# - Import tất cả blueprints từ các folder routes
# - Cung cấp centralized import
# ==============================

from .auth import auth_bp
from .products import product_bp, category_bp, review_bp
from .cart_checkout import cart_bp, order_bp
from .account import user_bp
from .admin_management import admin_bp, dashboard_bp
from .news import news_bp
from .gold import gold_bp
from .promotions import promotion_bp
from .uploads import upload_bp
from .payments.paypal_routes import paypal_bp

__all__ = [
    "auth_bp",
    "product_bp",
    "category_bp",
    "review_bp",
    "cart_bp",
    "order_bp",
    "user_bp",
    "admin_bp",
    "dashboard_bp",
    "news_bp",
    "gold_bp",
    "promotion_bp",
    "upload_bp",
    "paypal_bp"
]
