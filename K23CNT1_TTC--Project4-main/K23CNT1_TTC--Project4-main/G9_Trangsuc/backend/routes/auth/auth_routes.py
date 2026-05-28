from flask import Blueprint, request, jsonify
from models.auth_model import AuthModel
from services.auth_service import AuthService
from utils.request_validator import ValidationError, validate_login_payload, validate_register_payload

auth_bp = Blueprint("auth", __name__)

# ==============================
# ĐĂNG KÝ
# ==============================
@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.json or {}
        validate_register_payload(data)

        fullname = data.get("fullname")
        username = data.get("username")
        email = data.get("email")
        phone = data.get("phone")
        password = data.get("password")

        if AuthModel.get_user_by_username(username):
            return jsonify({
                "success": False,
                "message": "Tên đăng nhập đã tồn tại"
            }), 400

        if email and AuthModel.get_user_by_email(email):
            return jsonify({
                "success": False,
                "message": "Email đã được sử dụng"
            }), 400

        hashed_password = AuthService.hash_password(password)
        user = AuthModel.create_user(fullname, username, hashed_password, email, phone)

        if not user:
            return jsonify({
                "success": False,
                "message": "Không thể đăng ký tài khoản"
            }), 500

        user.pop("password", None)
        return jsonify({
            "success": True,
            "message": "Đăng ký thành công",
            "user": user
        })
    except ValidationError as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400


# ==============================
# ĐĂNG NHẬP
# ==============================
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.json or {}
        validate_login_payload(data)

        username = data.get("username")
        password = data.get("password")

        # Gọi model để lấy user từ database
        user = AuthModel.get_user_by_username(username)
        stored_password = user.get("password", "") if user else ""
        password_is_valid = stored_password == password or AuthService.verify_password(password, stored_password)

        if user and password_is_valid:
            token = AuthService.generate_auth_token(user)
            user.pop("password", None)

            return jsonify({
                "success": True,
                "message": "Đăng nhập thành công",
                "token": token,
                "user": user
            })

        return jsonify({
            "success": False,
            "message": "Sai tài khoản hoặc mật khẩu"
        }), 401
    except ValidationError as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400
