from flask import Blueprint, jsonify, request
from database.db_config import get_connection

review_bp = Blueprint("review_bp", __name__)

@review_bp.route("/product/<int:product_id>", methods=["GET"])
def get_reviews_by_product(product_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            dg.G9_MaDanhGia,
            nd.G9_HoTen,
            dg.G9_SoSao,
            dg.G9_NoiDung,
            dg.G9_NgayDanhGia
        FROM G9_DanhGia dg
        JOIN G9_NguoiDung nd 
            ON dg.G9_MaNguoiDung = nd.G9_MaNguoiDung
        WHERE dg.G9_MaSanPham = ?
        ORDER BY dg.G9_NgayDanhGia DESC
    """, (product_id,))

    reviews = []

    for row in cursor.fetchall():
        reviews.append({
            "id": row.G9_MaDanhGia,
            "user": row.G9_HoTen,
            "stars": row.G9_SoSao,
            "content": row.G9_NoiDung,
            "createdAt": str(row.G9_NgayDanhGia)
        })

    conn.close()
    return jsonify(reviews)


@review_bp.route("/create", methods=["POST"])
def create_review():
    data = request.json

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO G9_DanhGia
        (
            G9_MaSanPham,
            G9_MaNguoiDung,
            G9_SoSao,
            G9_NoiDung
        )
        VALUES (?, ?, ?, ?)
    """, (
        data["productId"],
        data["userId"],
        data["stars"],
        data["content"]
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Đánh giá sản phẩm thành công"
    })