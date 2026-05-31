import json
from urllib.parse import quote

from flask import Blueprint, request, jsonify, redirect, url_for, current_app

from models.auth_model import AuthModel
from services.auth_service import AuthService
from extensions.google_oauth import get_google_client, google_oauth_enabled
from utils.request_validator import ValidationError, validate_login_payload, validate_register_payload

auth_bp = Blueprint("auth", __name__)


def _frontend_base():
    return str(current_app.config.get("FRONTEND_URL", "http://127.0.0.1:5000")).rstrip("/")


def _redirect_google_success(user, token):
    user.pop("password", None)
    params = (
        f"token={quote(token)}"
        f"&user={quote(json.dumps(user, ensure_ascii=False))}"
    )
    return redirect(f"{_frontend_base()}/user/google-callback.html?{params}")


def _redirect_google_error(message=""):
    query = f"?message={quote(message)}" if message else "?google_error=1"
    return redirect(f"{_frontend_base()}/user/login.html{query}")


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


# ==============================
# ĐĂNG NHẬP GOOGLE
# ==============================
@auth_bp.route("/login/google")
def login_google():
    if not google_oauth_enabled():
        return jsonify({
            "success": False,
            "message": "Google OAuth chưa được cấu hình trên server"
        }), 503

    redirect_uri = url_for("auth.authorize_google", _external=True)
    return get_google_client().authorize_redirect(redirect_uri)


@auth_bp.route("/google/callback")
def authorize_google():
    if not google_oauth_enabled():
        return _redirect_google_error("Google OAuth chưa được cấu hình")

    try:
        token = get_google_client().authorize_access_token()
        user_info = token.get("userinfo") if token else None
        if not user_info:
            return _redirect_google_error("Không lấy được thông tin từ Google")

        email = user_info.get("email")
        name = user_info.get("name") or (email.split("@")[0] if email else "")
        if not email:
            return _redirect_google_error("Tài khoản Google không có email")

        user = AuthService.find_or_create_google_user(email, name)
        if not user:
            return _redirect_google_error("Không thể tạo tài khoản")

        jwt_token = AuthService.generate_auth_token(user)
        return _redirect_google_success(user, jwt_token)
    except Exception:
        return _redirect_google_error("Đăng nhập Google thất bại, vui lòng thử lại")
