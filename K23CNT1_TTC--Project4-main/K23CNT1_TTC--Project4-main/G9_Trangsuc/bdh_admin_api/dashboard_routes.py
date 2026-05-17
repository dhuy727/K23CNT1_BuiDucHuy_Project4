from flask import Blueprint, jsonify
from database.db_config import get_connection

# TẠO BLUEPRINT
dashboard_bp = Blueprint(
    "dashboard_bp",
    __name__
)

# API THỐNG KÊ DASHBOARD
@dashboard_bp.route("/statistics", methods=["GET"])
def statistics():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM G9_SanPham")
    product_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM G9_DonHang")
    order_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM G9_NguoiDung")
    user_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM G9_TinTuc")
    news_count = cursor.fetchone()[0]

    cursor.execute("SELECT ISNULL(SUM(G9_TongTien), 0) FROM G9_DonHang")
    revenue = cursor.fetchone()[0]

    conn.close()

    return jsonify({
        "products": product_count,
        "orders": order_count,
        "users": user_count,
        "news": news_count,
        "revenue": float(revenue)
    })