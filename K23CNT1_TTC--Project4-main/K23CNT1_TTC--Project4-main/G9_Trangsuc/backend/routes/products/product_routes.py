# ==============================
# FILE: routes/products/product_routes.py
# CHỨC NĂNG:
# - Lấy danh sách sản phẩm
# - Lấy chi tiết sản phẩm
# - Thêm sản phẩm
# - Cập nhật sản phẩm
# - Xóa sản phẩm
# ==============================

from flask import Blueprint, jsonify, request
from models.product_model import ProductModel
from services.product_service import ProductService
from middleware import require_auth, require_admin
from utils.request_validator import ValidationError, validate_product_payload

product_bp = Blueprint("products", __name__)


# ==============================
# API LẤY DANH SÁCH SẢN PHẨM
# ==============================
@product_bp.route("/", methods=["GET"])
def get_products():
    try:
        products = ProductModel.get_all_products()
        for product in products:
            product_id = product.get("id")
            product["avg_rating"] = ProductService.get_product_rating(product_id)
            product["review_count"] = ProductService.get_review_count(product_id)
        return jsonify({
            "success": True,
            "message": "Lấy sản phẩm thành công",
            "data": products
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==============================
# API LẤY CHI TIẾT SẢN PHẨM
# ==============================
@product_bp.route("/<int:id>", methods=["GET"])
def get_product_detail(id):
    try:
        product = ProductModel.get_product_by_id(id)

        if not product:
            return jsonify({
                "success": False,
                "message": "Không tìm thấy sản phẩm"
            }), 404

        return jsonify({
            "success": True,
            "message": "Lấy chi tiết sản phẩm thành công",
            "data": product
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==============================
# API THÊM SẢN PHẨM
# ==============================
@product_bp.route("/", methods=["POST"])
@require_auth
@require_admin
def create_product():
    try:
        data = request.json or {}
        validate_product_payload(data)
        ProductModel.create_product(data)
        return jsonify({
            "success": True,
            "message": "Thêm sản phẩm thành công"
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
# API CẬP NHẬT SẢN PHẨM
# ==============================
@product_bp.route("/<int:id>", methods=["PUT"])
@require_auth
@require_admin
def update_product(id):
    try:
        data = request.json or {}
        validate_product_payload(data, require_all=False)

        ProductModel.update_product(id, data)
        return jsonify({
            "success": True,
            "message": "Cập nhật sản phẩm thành công"
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
# API XÓA SẢN PHẨM
# ==============================
@product_bp.route("/<int:id>", methods=["DELETE"])
@require_auth
@require_admin
def delete_product(id):
    try:
        ProductModel.delete_product(id)
        return jsonify({
            "success": True,
            "message": "Xóa sản phẩm thành công"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
