from flask import Blueprint, jsonify, request
from models.user_model import UserModel
from models.auth_model import AuthModel
from services.user_service import UserService
from services.auth_service import AuthService
from middleware import require_auth, require_admin, require_user, get_current_user_id

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


@user_bp.route("/profile", methods=["PUT"])
@require_auth
@require_user
def update_profile():
    try:
        user_id = get_current_user_id()
        data = request.json or {}

        full_name = (data.get("fullname") or "").strip()
        username = (data.get("username") or "").strip()
        email = (data.get("email") or "").strip()
        phone = (data.get("phone") or "").strip()

        if not full_name or not username or not email or not phone:
            return jsonify({
                "success": False,
                "message": "Vui lòng nhập đủ họ tên, tên đăng nhập, email và số điện thoại"
            }), 400

        if len(username) < 3 or len(username) > 50:
            return jsonify({
                "success": False,
                "message": "Tên đăng nhập phải từ 3 đến 50 ký tự"
            }), 400

        if not UserService.validate_email(email):
            return jsonify({
                "success": False,
                "message": "Email không hợp lệ"
            }), 400

        if not UserService.validate_phone(phone):
            return jsonify({
                "success": False,
                "message": "Số điện thoại không hợp lệ"
            }), 400

        existing_username = AuthModel.get_user_by_username(username)
        if existing_username and existing_username.get("id") != user_id:
            return jsonify({
                "success": False,
                "message": "Tên đăng nhập đã được sử dụng"
            }), 400

        existing_email = AuthModel.get_user_by_email(email)
        if existing_email and existing_email.get("id") != user_id:
            return jsonify({
                "success": False,
                "message": "Email đã được sử dụng"
            }), 400

        UserModel.update_user_profile(user_id, full_name, username, email, phone)
        updated_user = UserModel.get_user_by_id(user_id)
        token = AuthService.generate_auth_token(updated_user)

        return jsonify({
            "success": True,
            "message": "Cập nhật hồ sơ thành công",
            "user": updated_user,
            "token": token
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@user_bp.route("/change-password", methods=["PUT"])
@require_auth
@require_user
def change_password():
    try:
        user_id = get_current_user_id()
        data = request.json or {}

        current_password = data.get("current_password", "")
        new_password = data.get("new_password", "")
        confirm_password = data.get("confirm_password", "")

        if not current_password or not new_password or not confirm_password:
            return jsonify({
                "success": False,
                "message": "Vui lòng điền mật khẩu hiện tại và mật khẩu mới"
            }), 400

        if new_password != confirm_password:
            return jsonify({
                "success": False,
                "message": "Mật khẩu mới và xác nhận mật khẩu không khớp"
            }), 400

        user = AuthModel.get_user_by_id(user_id)
        if not user:
            return jsonify({
                "success": False,
                "message": "Người dùng không tồn tại"
            }), 404

        if not AuthService.verify_password(current_password, user.get("password", "")):
            return jsonify({
                "success": False,
                "message": "Mật khẩu hiện tại không đúng"
            }), 400

        try:
            UserService.validate_password(new_password)
        except ValueError as ve:
            return jsonify({
                "success": False,
                "message": str(ve)
            }), 400

        hashed_password = AuthService.hash_password(new_password)
        UserModel.update_user_password(user_id, hashed_password)

        return jsonify({
            "success": True,
            "message": "Đổi mật khẩu thành công"
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
