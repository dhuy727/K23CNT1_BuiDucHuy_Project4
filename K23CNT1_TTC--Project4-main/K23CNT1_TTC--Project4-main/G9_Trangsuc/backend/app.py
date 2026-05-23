# ==============================
# FILE: app.py
# CHỨC NĂNG:
# - Khởi tạo Flask App
# - Kết nối CORS
# - Đăng ký tất cả API routes
# - Chạy server Flask
# ==============================

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os

# ==============================
# IMPORT ROUTES
# ==============================
from routes import (
    auth_bp,
    product_bp,
    category_bp,
    review_bp,
    cart_bp,
    order_bp,
    user_bp,
    admin_bp,
    dashboard_bp,
    news_bp,
    gold_bp,
    promotion_bp,
    upload_bp
)

# ==============================
# KHỞI TẠO APP
# ==============================
app = Flask(__name__)

# ==============================
# CHO PHÉP FRONTEND GỌI API
# ==============================
CORS(app)

# ==============================
# ROUTE TEST SERVER
# ==============================
@app.route("/")
def home():
    return jsonify({
        "success": True,
        "message": "G9 Trang Sức API đang hoạt động"
    })


@app.route("/uploads/<path:filename>")
def serve_uploads(filename):
    uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
    return send_from_directory(uploads_dir, filename)



# ==============================
# ĐĂNG KÝ API ROUTES
# ==============================
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(product_bp, url_prefix="/api/products")
app.register_blueprint(category_bp, url_prefix="/api/categories")
app.register_blueprint(review_bp, url_prefix="/api/reviews")
app.register_blueprint(cart_bp, url_prefix="/api/cart")
app.register_blueprint(order_bp, url_prefix="/api/orders")
app.register_blueprint(user_bp, url_prefix="/api/user")
app.register_blueprint(admin_bp, url_prefix="/api/admin")
app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
app.register_blueprint(news_bp, url_prefix="/api/news")
app.register_blueprint(gold_bp, url_prefix="/api/gold")
app.register_blueprint(promotion_bp, url_prefix="/api/promotions")
app.register_blueprint(upload_bp, url_prefix="/api/upload")


# ==============================
# CHẠY SERVER
# ==============================
if __name__ == "__main__":
    print("===================================")
    print(" G9 TRANG SỨC SERVER ĐANG CHẠY ")
    print(" http://127.0.0.1:5000")
    print("===================================")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )