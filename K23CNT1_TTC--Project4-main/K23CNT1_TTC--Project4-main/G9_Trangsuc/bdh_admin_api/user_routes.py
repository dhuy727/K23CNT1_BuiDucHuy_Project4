from flask import Blueprint, jsonify, request
from database.db_config import get_connection

user_bp = Blueprint("user_bp", __name__)

@user_bp.route("/", methods=["GET"])
def get_users():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            nd.G9_MaNguoiDung,
            nd.G9_HoTen,
            nd.G9_TenDangNhap,
            nd.G9_Email,
            nd.G9_SoDienThoai,
            nd.G9_TrangThai,
            vt.G9_TenVaiTro
        FROM G9_NguoiDung nd
        JOIN G9_VaiTro vt ON nd.G9_MaVaiTro = vt.G9_MaVaiTro
    """)

    users = []

    for row in cursor.fetchall():
        users.append({
            "id": row.G9_MaNguoiDung,
            "name": row.G9_HoTen,
            "username": row.G9_TenDangNhap,
            "email": row.G9_Email,
            "phone": row.G9_SoDienThoai,
            "status": row.G9_TrangThai,
            "role": row.G9_TenVaiTro
        })

    conn.close()
    return jsonify(users)


@user_bp.route("/update-status/<int:id>", methods=["PUT"])
def update_user_status(id):
    data = request.json
    status = data.get("status")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE G9_NguoiDung
        SET G9_TrangThai = ?
        WHERE G9_MaNguoiDung = ?
    """, (status, id))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Cập nhật trạng thái người dùng thành công"
    })