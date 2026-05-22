from flask import Blueprint, jsonify, request
from models.user_model import UserModel
from middleware import require_auth, require_admin, get_current_user_id

user_bp = Blueprint("user_bp", __name__)

@user_bp.route("/", methods=["GET"])
@require_auth
@require_admin
def get_users():
    try:
        users = UserModel.get_all_users()
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


@user_bp.route("/update-status/<int:id>", methods=["PUT"])
@require_auth
@require_admin
def update_user_status(id):
    try:
        data = request.json
        status = data.get("status")

        UserModel.update_user_status(id, status)

        return jsonify({
            "success": True,
            "message": "Cập nhật trạng thái người dùng thành công"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
