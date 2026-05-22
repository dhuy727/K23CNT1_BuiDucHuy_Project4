from flask import Blueprint, request, jsonify
from models.auth_model import AuthModel
from utils.jwt_helper import generate_token
from utils.request_validator import ValidationError, validate_login_payload

auth_bp = Blueprint("auth", __name__)

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

        if user and user["password"] == password:
            token = generate_token(user)
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
