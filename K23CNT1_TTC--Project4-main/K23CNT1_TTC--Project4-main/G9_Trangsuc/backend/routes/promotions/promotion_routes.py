# ==============================
# FILE: routes/promotions/promotion_routes.py
# CHỨC NĂNG:
# - Xem danh sách khuyến mãi
# - Xem chi tiết khuyến mãi
# - Tìm kiếm khuyến mãi theo code
# - Tạo khuyến mãi mới (admin)
# - Cập nhật khuyến mãi (admin)
# - Xóa khuyến mãi (admin)
# ==============================

from flask import Blueprint, jsonify, request
from models.promotion_model import PromotionModel
from middleware import require_auth, require_admin
from utils.request_validator import ValidationError, validate_promotion_payload

promotion_bp = Blueprint("promotions", __name__)


# ==============================
# API LẤY TẤT CẢ KHUYẾN MÃI
# URL: /api/promotions/
# ==============================
@promotion_bp.route("/", methods=["GET"])
def get_all_promotions():
    try:
        promotions = PromotionModel.get_all_promotions()
        return jsonify({
            "success": True,
            "message": "Lấy danh sách khuyến mãi thành công",
            "data": promotions
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==============================
# API LẤY CHI TIẾT KHUYẾN MÃI
# URL: /api/promotions/<id>
# ==============================
@promotion_bp.route("/<int:promotion_id>", methods=["GET"])
def get_promotion(promotion_id):
    try:
        promotion = PromotionModel.get_promotion_by_id(promotion_id)
        if not promotion:
            return jsonify({
                "success": False,
                "message": "Khuyến mãi không tồn tại"
            }), 404

        return jsonify({
            "success": True,
            "message": "Lấy chi tiết khuyến mãi thành công",
            "data": promotion
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==============================
# API TÌM KHUYẾN MÃI THEO CODE
# URL: /api/promotions/code/<code>
# ==============================
@promotion_bp.route("/code/<code>", methods=["GET"])
def get_promotion_by_code(code):
    try:
        promotion = PromotionModel.get_promotion_by_code(code)
        if not promotion:
            return jsonify({
                "success": False,
                "message": "Mã khuyến mãi không hợp lệ hoặc đã hết hạn"
            }), 404

        return jsonify({
            "success": True,
            "message": "Lấy khuyến mãi theo code thành công",
            "data": promotion
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==============================
# API LẤY KHUYẾN MÃI THEO DANH MỤC
# URL: /api/promotions/category/<category_id>
# ==============================
@promotion_bp.route("/category/<int:category_id>", methods=["GET"])
def get_promotions_by_category(category_id):
    try:
        promotions = PromotionModel.get_promotions_by_category(category_id)
        return jsonify({
            "success": True,
            "message": "Lấy khuyến mãi theo danh mục thành công",
            "data": promotions
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==============================
# API TẠO KHUYẾN MÃI MỚI (ADMIN)
# BODY: code, discount_value, start_date, end_date, categories
# ==============================
@promotion_bp.route("/", methods=["POST"])
@require_auth
@require_admin
def create_promotion():
    try:
        data = request.json or {}
        validate_promotion_payload(data)

        promotion_id = PromotionModel.create_promotion(
            code=data.get("code"),
            discount_value=data.get("discount_value"),
            start_date=data.get("start_date"),
            end_date=data.get("end_date"),
            categories=data.get("categories", [])
        )

        return jsonify({
            "success": True,
            "message": "Tạo khuyến mãi thành công",
            "promotion_id": promotion_id
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


# ==============================
# API CẬP NHẬT KHUYẾN MÃI (ADMIN)
# BODY: discount_value, start_date, end_date, status, categories
@require_auth
@require_admin
# ==============================
@promotion_bp.route("/<int:promotion_id>", methods=["PUT"])
def update_promotion(promotion_id):
    try:
        data = request.json or {}
        validate_promotion_payload(data, require_all=False)

        PromotionModel.update_promotion(
            promotion_id=promotion_id,
            discount_value=data.get("discount_value"),
            start_date=data.get("start_date"),
            end_date=data.get("end_date"),
            status=data.get("status"),
            categories=data.get("categories")
        )

        return jsonify({
            "success": True,
            "message": "Cập nhật khuyến mãi thành công"
        })

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


# ==============================
# API XÓA KHUYẾN MÃI (ADMIN)
# URL: /api/promotions/<id>
@require_auth
@require_admin
# ==============================
@promotion_bp.route("/<int:promotion_id>", methods=["DELETE"])
def delete_promotion(promotion_id):
    try:
        PromotionModel.delete_promotion(promotion_id)

        return jsonify({
            "success": True,
            "message": "Xóa khuyến mãi thành công"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==============================
# API KIỂM TRA KHUYẾN MÃI HỢP LỆ
# URL: /api/promotions/validate/<code>
# ==============================
@promotion_bp.route("/validate/<code>", methods=["GET"])
def validate_promotion(code):
    try:
        is_valid = PromotionModel.is_promotion_valid(code)

        return jsonify({
            "success": True,
            "data": {
                "code": code,
                "is_valid": is_valid
            }
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
