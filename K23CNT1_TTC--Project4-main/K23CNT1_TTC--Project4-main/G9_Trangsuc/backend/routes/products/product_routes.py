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
from utils.request_validator import ValidationError, validate_product_payload, validate_status_field

product_bp = Blueprint("products", __name__)


# ==============================
# API LẤY DANH SÁCH SẢN PHẨM
# ==============================
@product_bp.route("/", methods=["GET"])
def get_products():
    try:
        products = ProductModel.get_all_products()
        from models.review_model import ReviewModel
        for product in products:
            product_id = product.get("id")
            reviews = ReviewModel.get_reviews_by_product(product_id)
            count = len(reviews) if reviews else 0
            product["review_count"] = count
            if count > 0:
                product["avg_rating"] = round(
                    sum(r.get("rating", 0) for r in reviews) / count, 1
                )
            else:
                product["avg_rating"] = 0
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
# API CẬP NHẬT TRẠNG THÁI SẢN PHẨM
# BODY: status
# ==============================
@product_bp.route("/status/<int:id>", methods=["PUT"])
@require_auth
@require_admin
def update_product_status(id):
    try:
        data = request.json or {}
        status = data.get("status")
        validate_status_field(status, ["Còn hàng", "Hết hàng", "Ngừng bán"])

        product = ProductModel.get_product_by_id(id)
        if not product:
            return jsonify({
                "success": False,
                "message": "Không tìm thấy sản phẩm"
            }), 404

        if int(product.get("quantity") or 0) <= 0:
            status = "Hết hàng"

        ProductModel.update_product_status(id, status)
        return jsonify({
            "success": True,
            "message": "Cập nhật trạng thái sản phẩm thành công"
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
