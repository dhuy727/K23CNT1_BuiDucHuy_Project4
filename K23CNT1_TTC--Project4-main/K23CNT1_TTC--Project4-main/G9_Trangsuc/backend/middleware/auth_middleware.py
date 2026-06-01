# ==============================
# FILE: middleware/auth_middleware.py
# CHỨC NĂNG:
# - Decorators để xác thực JWT token
# - Role-based access control (RBAC)
# - Middleware cho các protected routes
# ==============================

from functools import wraps
from flask import request, jsonify
from utils.jwt_helper import decode_token


# ==============================
# DECORATOR: REQUIRE AUTHENTICATION
# Kiểm tra JWT token từ Authorization header
# ==============================
# Decorator bắt buộc đăng nhập JWT
def require_auth(f):
    """
    Decorator bắt buộc xác thực JWT token
    Authorization: Bearer <token>
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            auth_header = request.headers.get("Authorization")

            if not auth_header:
                return jsonify({
                    "success": False,
                    "message": "Missing Authorization header"
                }), 401

            # Tách "Bearer <token>"
            try:
                bearer, token = auth_header.split()
                if bearer.lower() != "bearer":
                    raise ValueError("Invalid header format")
            except:
                return jsonify({
                    "success": False,
                    "message": "Invalid Authorization header format. Use 'Bearer <token>'"
                }), 401

            # Verify token
            user_data = decode_token(token)
            if not user_data:
                return jsonify({
                    "success": False,
                    "message": "Invalid or expired token"
                }), 401

            # Lưu user data vào request context
            request.current_user = user_data

            return f(*args, **kwargs)

        except Exception as e:
            return jsonify({
                "success": False,
                "message": f"Authentication error: {str(e)}"
            }), 500

    return decorated_function


# ==============================
# DECORATOR: REQUIRE ADMIN ROLE
# Chỉ admin mới có quyền truy cập
# ==============================
# Decorator chỉ cho phép admin
def require_admin(f):
    """
    Decorator bắt buộc admin role
    Phải được sử dụng cùng với @require_auth
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            if not hasattr(request, "current_user"):
                return jsonify({
                    "success": False,
                    "message": "Authentication required. Use @require_auth decorator"
                }), 401

            user_role = request.current_user.get("role", "").lower()

            if user_role != "admin":
                return jsonify({
                    "success": False,
                    "message": "Admin access required"
                }), 403

            return f(*args, **kwargs)

        except Exception as e:
            return jsonify({
                "success": False,
                "message": f"Authorization error: {str(e)}"
            }), 500

    return decorated_function


# ==============================
# DECORATOR: REQUIRE USER ROLE
# Chỉ user bình thường có quyền truy cập
# ==============================
# Decorator chỉ cho phép user đã đăng nhập
def require_user(f):
    """
    Decorator bắt buộc user role (không phải guest)
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            if not hasattr(request, "current_user"):
                return jsonify({
                    "success": False,
                    "message": "Authentication required"
                }), 401

            user_role = request.current_user.get("role", "").lower()

            # Bất kỳ người dùng hợp lệ nào cũng được phép (admin hoặc user)
            # Hỗ trợ cả role tiếng Việt từ database như 'khách hàng' hoặc 'nhân viên'
            if not user_role or user_role in ["guest", "visitor"]:
                return jsonify({
                    "success": False,
                    "message": "User access required"
                }), 403

            return f(*args, **kwargs)

        except Exception as e:
            return jsonify({
                "success": False,
                "message": f"Authorization error: {str(e)}"
            }), 500

    return decorated_function


# ==============================
# DECORATOR: OPTIONAL AUTHENTICATION
# Authentication không bắt buộc nhưng nếu có token thì verify
# ==============================
# Decorator xác thực tùy chọn (có token thì kiểm tra)
def optional_auth(f):
    """
    Decorator optional - user có thể access với hoặc không có token
    Nhưng nếu có token thì phải valid
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            auth_header = request.headers.get("Authorization")

            if auth_header:
                try:
                    bearer, token = auth_header.split()
                    if bearer.lower() != "bearer":
                        return jsonify({
                            "success": False,
                            "message": "Invalid Authorization header format"
                        }), 401

                    user_data = decode_token(token)
                    if not user_data:
                        return jsonify({
                            "success": False,
                            "message": "Invalid or expired token"
                        }), 401

                    request.current_user = user_data
                except:
                    return jsonify({
                        "success": False,
                        "message": "Invalid Authorization header"
                    }), 401

            return f(*args, **kwargs)

        except Exception as e:
            return jsonify({
                "success": False,
                "message": f"Authentication error: {str(e)}"
            }), 500

    return decorated_function


# ==============================
# UTILITY: GET CURRENT USER
# Lấy thông tin user từ request context
# ==============================
# Lấy thông tin user hiện tại từ request
def get_current_user():
    """
    Lấy user data từ request context
    Sử dụng trong route handler sau khi @require_auth
    """
    return getattr(request, "current_user", None)


# ==============================
# UTILITY: GET CURRENT USER ID
# Lấy user ID
# ==============================
# Lấy ID user hiện tại
def get_current_user_id():
    """
    Lấy user ID
    """
    user = get_current_user()
    return user.get("id") if user else None


# ==============================
# UTILITY: IS ADMIN
# Kiểm tra user là admin
# ==============================
# Kiểm tra user hiện tại là admin
def is_admin():
    """
    Kiểm tra user là admin
    """
    user = get_current_user()
    return user and user.get("role", "").lower() == "admin"


# ==============================
# UTILITY: IS CURRENT USER
# Kiểm tra user request = user trong DB
# ==============================
# Kiểm tra user_id trùng user hiện tại hoặc admin
def is_current_user(user_id):
    """
    Kiểm tra user_id = current_user.id
    Dùng để validate ownership khi edit/delete
    """
    current_id = get_current_user_id()
    return current_id == user_id or is_admin()
