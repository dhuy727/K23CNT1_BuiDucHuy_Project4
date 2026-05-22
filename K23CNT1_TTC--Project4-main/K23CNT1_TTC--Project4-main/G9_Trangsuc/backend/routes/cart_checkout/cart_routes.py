# ==============================
# FILE: routes/cart_checkout/cart_routes.py
# CHỨC NĂNG:
# - Xem giỏ hàng
# - Thêm sản phẩm vào giỏ
# - Cập nhật số lượng
# - Xóa sản phẩm khỏi giỏ
# ==============================

from flask import Blueprint, jsonify, request
from models.cart_model import CartModel
from middleware import require_auth, is_current_user
from utils.request_validator import ValidationError, validate_cart_payload

cart_bp = Blueprint("cart", __name__)


# ==============================
# API LẤY GIỎ HÀNG THEO USER
# URL: /api/cart/<user_id>
# ==============================
@cart_bp.route("/<int:user_id>", methods=["GET"])
@require_auth
def get_cart(user_id):
    try:
        # Kiểm tra user chỉ có thể view giỏ hàng của họ
        if not is_current_user(user_id):
            return jsonify({
                "success": False,
                "message": "Bạn không có quyền xem giỏ hàng này"
            }), 403

        cart_items = CartModel.get_cart_by_user(user_id)
        return jsonify({
            "success": True,
            "message": "Lấy giỏ hàng thành công",
            "data": cart_items
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi khi lấy giỏ hàng: {str(e)}"
        }), 500
@require_auth


# ==============================
# API THÊM SẢN PHẨM VÀO GIỎ
# BODY: user_id, product_id, quantity
# ==============================
@cart_bp.route("/add", methods=["POST"])
@require_auth
def add_to_cart():
    try:
        data = request.json or {}
        validate_cart_payload(data)

        user_id = data.get("user_id")
        product_id = data.get("product_id")
        quantity = int(data.get("quantity", 1))

        if not is_current_user(user_id):
            return jsonify({
                "success": False,
                "message": "Bạn không có quyền thêm vào giỏ hàng này"
            }), 403

        CartModel.add_to_cart(user_id, product_id, quantity)
        
        return jsonify({
            "success": True,
            "message": "Thêm vào giỏ hàng thành công"
        })
    except ValidationError as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400
    except ValueError as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 404
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi khi thêm vào giỏ hàng: {str(e)}"
        }), 500


# ==============================
# API CẬP NHẬT SỐ LƯỢNG SẢN PHẨM
# ==============================
@cart_bp.route("/update/<int:cart_detail_id>", methods=["PUT"])
@require_auth
def update_cart_item(cart_detail_id):
    try:
        data = request.json or {}
        validate_cart_payload(data)
        quantity = int(data.get("quantity", 1))

        CartModel.update_cart_item(cart_detail_id, quantity)
        
        return jsonify({
            "success": True,
            "message": "Cập nhật giỏ hàng thành công"
        })
    except ValidationError as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi khi cập nhật giỏ hàng: {str(e)}"
        }), 500


# ==============================
# API XÓA SẢN PHẨM KHỎI GIỎ
# ==============================
@cart_bp.route("/delete/<int:cart_detail_id>", methods=["DELETE"])
@require_auth
def delete_cart_item(cart_detail_id):
    try:
        CartModel.delete_cart_item(cart_detail_id)
        
        return jsonify({
            "success": True,
            "message": "Xóa sản phẩm khỏi giỏ hàng thành công"
        })
    except ValidationError as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi khi xóa sản phẩm: {str(e)}"
        }), 500
