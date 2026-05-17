from urllib import request

from flask import Blueprint, jsonify
from database.db_config import get_connection

# TẠO BLUEPRINT
product_bp = Blueprint(
    "product_bp",
    __name__
)

# API LẤY DANH SÁCH SẢN PHẨM
@product_bp.route("/", methods=["GET"])
def get_products():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM G9_SanPham
    """)

    products = []

    rows = cursor.fetchall()

    for row in rows:

        products.append({

            "id": row.G9_MaSanPham,
            "name": row.G9_TenSanPham,
            "price": float(row.G9_Gia),
            "image": row.G9_HinhAnhChinh,
            "quantity": row.G9_SoLuongTon

        })

    conn.close()

    return jsonify(products)

#CRUD sản phẩm
@product_bp.route("/update/<int:id>", methods=["PUT"])
def update_product(id):
    data = request.json

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE G9_SanPham
        SET 
            G9_TenSanPham = ?,
            G9_MaDanhMuc = ?,
            G9_ChatLieu = ?,
            G9_Gia = ?,
            G9_SoLuongTon = ?,
            G9_HinhAnhChinh = ?,
            G9_MoTa = ?,
            G9_TrangThai = ?
        WHERE G9_MaSanPham = ?
    """, (
        data["name"],
        data["categoryId"],
        data["material"],
        data["price"],
        data["quantity"],
        data["image"],
        data["description"],
        data["status"],
        id
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Cập nhật sản phẩm thành công"
    })


@product_bp.route("/delete/<int:id>", methods=["DELETE"])
def delete_product(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM G9_SanPham
        WHERE G9_MaSanPham = ?
    """, (id,))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Xóa sản phẩm thành công"
    })
#API tìm kiếm sản phẩm 
@product_bp.route("/search/<string:keyword>", methods=["GET"])
def search_products(keyword):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM G9_SanPham
        WHERE G9_TenSanPham LIKE ?
    """, (f"%{keyword}%",))

    products = []

    rows = cursor.fetchall()

    for row in rows:

        products.append({

            "id": row.G9_MaSanPham,
            "name": row.G9_TenSanPham,
            "price": float(row.G9_Gia),
            "image": row.G9_HinhAnhChinh,
            "quantity": row.G9_SoLuongTon,
            "material": row.G9_ChatLieu,
            "description": row.G9_MoTa,
            "status": row.G9_TrangThai

        })

    conn.close()

    return jsonify(products)
#lọc theo danh mục
@product_bp.route("/category/<int:category_id>", methods=["GET"])
def get_products_by_category(category_id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM G9_SanPham
        WHERE G9_MaDanhMuc = ?
    """, (category_id,))

    products = []

    for row in cursor.fetchall():

        products.append({

            "id": row.G9_MaSanPham,
            "name": row.G9_TenSanPham,
            "price": float(row.G9_Gia),
            "image": row.G9_HinhAnhChinh,
            "quantity": row.G9_SoLuongTon,
            "material": row.G9_ChatLieu

        })

    conn.close()

    return jsonify(products)
