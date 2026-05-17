from flask import Blueprint, jsonify
from database.db_config import get_connection
from flask import Blueprint, jsonify, request

# TẠO BLUEPRINT DANH MỤC
category_bp = Blueprint(
    "category_bp",
    __name__
)

# API LẤY DANH SÁCH DANH MỤC
@category_bp.route("/", methods=["GET"])
def get_categories():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            G9_MaDanhMuc,
            G9_TenDanhMuc,
            G9_MoTa,
            G9_MaDanhMucCha,
            G9_TrangThai
        FROM G9_DanhMuc
    """)

    categories = []

    rows = cursor.fetchall()

    for row in rows:
        categories.append({
            "id": row.G9_MaDanhMuc,
            "name": row.G9_TenDanhMuc,
            "description": row.G9_MoTa,
            "parentId": row.G9_MaDanhMucCha,
            "status": row.G9_TrangThai
        })

    conn.close()

    return jsonify(categories)

@category_bp.route("/create", methods=["POST"])
def create_category():
    data = request.json

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO G9_DanhMuc
        (
            G9_TenDanhMuc,
            G9_MoTa,
            G9_MaDanhMucCha
        )
        VALUES (?, ?, ?)
    """, (
        data["name"],
        data["description"],
        data.get("parentId")
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Thêm danh mục thành công"
    })


@category_bp.route("/update/<int:id>", methods=["PUT"])
def update_category(id):
    data = request.json

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE G9_DanhMuc
        SET 
            G9_TenDanhMuc = ?,
            G9_MoTa = ?,
            G9_MaDanhMucCha = ?,
            G9_TrangThai = ?
        WHERE G9_MaDanhMuc = ?
    """, (
        data["name"],
        data["description"],
        data.get("parentId"),
        data["status"],
        id
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Cập nhật danh mục thành công"
    })


@category_bp.route("/delete/<int:id>", methods=["DELETE"])
def delete_category(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM G9_DanhMuc
        WHERE G9_MaDanhMuc = ?
    """, (id,))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Xóa danh mục thành công"
    })
#API cập nhật trạng thái
@category_bp.route("/update-status/<int:id>", methods=["PUT"])
def update_category_status(id):
    data = request.json
    status = data.get("status")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE G9_DanhMuc
        SET G9_TrangThai = ?
        WHERE G9_MaDanhMuc = ?
    """, (status, id))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Cập nhật trạng thái danh mục thành công"
    })