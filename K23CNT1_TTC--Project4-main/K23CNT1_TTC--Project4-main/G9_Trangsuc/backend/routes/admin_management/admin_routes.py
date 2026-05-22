# ==============================
# FILE: routes/admin_management/admin_routes.py
# CHỨC NĂNG:
# - Quản lý người dùng
# ==============================

from flask import Blueprint, jsonify, request
from models.admin_model import AdminModel
from middleware import require_auth, require_admin

admin_bp = Blueprint("admin", __name__)


# ==============================
# API LẤY DANH SÁCH NGƯỜI DÙNG
# URL: /api/admin/users
# ==============================
@admin_bp.route("/users", methods=["GET"])
@require_auth
@require_admin
def get_users():
    try:
        users = AdminModel.get_all_users()
        return jsonify({
            "success": True,
            "message": "Lấy danh sách người dùng thành công",
            "data": users
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==============================
# API CẬP NHẬT TRẠNG THÁI NGƯỜI DÙNG
# BODY: status
@require_auth
@require_admin
# ==============================
@admin_bp.route("/users/status/<int:user_id>", methods=["PUT"])
def update_user_status(user_id):
    try:
        data = request.json
        status = data.get("status")

        AdminModel.update_user_status(user_id, status)

        return jsonify({
            "success": True,
            "message": "Cập nhật trạng thái người dùng thành công"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
