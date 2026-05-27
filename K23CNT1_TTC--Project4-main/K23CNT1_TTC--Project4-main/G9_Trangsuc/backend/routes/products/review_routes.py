# ==============================
# FILE: routes/products/review_routes.py
# CHỨC NĂNG:
# - Lấy đánh giá theo sản phẩm
# - Thêm đánh giá sản phẩm
# ==============================

from flask import Blueprint, jsonify, request
from models.auth_model import AuthModel
from models.review_model import ReviewModel
from services.review_service import ReviewService
from middleware import require_auth, require_user
from utils.request_validator import ValidationError, validate_review_payload

review_bp = Blueprint("reviews", __name__)


# ==============================
# API LẤY ĐÁNH GIÁ THEO SẢN PHẨM
# URL: /api/reviews/product/<product_id>
# ==============================
@review_bp.route("/product/<int:product_id>", methods=["GET"])
def get_reviews_by_product(product_id):
    try:
        reviews = ReviewModel.get_reviews_by_product(product_id)

        return jsonify({
            "success": True,
            "message": "Lấy đánh giá thành công",
            "data": reviews
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==============================
# API THÊM ĐÁNH GIÁ
# BODY: product_id, rating, content
# User ID is taken from the authenticated JWT token
# ==============================
@review_bp.route("/", methods=["POST"])
@require_auth
@require_user
def create_review():
    try:
        data = request.json or {}
        validate_review_payload(data)

        user_id = request.current_user.get("id")
        if not user_id:
            return jsonify({
                "success": False,
                "message": "Không tìm thấy thông tin người dùng"
            }), 401

        current_user = AuthModel.get_user_by_id(user_id)
        if not current_user:
            return jsonify({
                "success": False,
                "message": "Người dùng xác thực không tồn tại"
            }), 401

        ReviewModel.create_review(
            product_id=data.get("product_id"),
            user_id=user_id,
            rating=data.get("rating"),
            content=data.get("content")
        )

        return jsonify({
            "success": True,
            "message": "Đánh giá sản phẩm thành công"
        }), 201

    except ValidationError as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
