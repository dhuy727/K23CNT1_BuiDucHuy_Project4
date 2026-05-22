# ==============================
# FILE: routes/cart_checkout/order_routes.py
# CHỨC NĂNG:
# - Xem đơn hàng
# - Tạo đơn hàng từ giỏ hàng
# - Xem chi tiết đơn hàng
# - Admin cập nhật trạng thái đơn hàng
# ==============================

from flask import Blueprint, jsonify, request
from models.order_model import OrderModel
from middleware import require_auth, require_admin, is_current_user
from services.order_service import OrderService
from utils.request_validator import ValidationError, validate_checkout_payload

order_bp = Blueprint("orders", __name__)


# ==============================
# API LẤY TẤT CẢ ĐƠN HÀNG
# URL: /api/orders/
# ==============================
@order_bp.route("/", methods=["GET"])
@require_auth
@require_admin
def get_orders():
    try:
        data = OrderModel.get_all_orders()
        return jsonify({
            "success": True,
            "message": "Lấy danh sách đơn hàng thành công",
            "data": data
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==============================
# API LẤY ĐƠN HÀNG THEO USER
# URL: /api/orders/user/2
# ==============================
@order_bp.route("/user/<int:user_id>", methods=["GET"])
@require_auth
def get_orders_by_user(user_id):
    try:
        data = OrderModel.get_orders_by_user(user_id)
        return jsonify({
            "success": True,
            "message": "Lấy đơn hàng theo người dùng thành công",
            "data": data
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==============================
# API XEM CHI TIẾT ĐƠN HÀNG
# URL: /api/orders/detail/1
# ==============================
@order_bp.route("/detail/<int:order_id>", methods=["GET"])
def get_order_detail(order_id):
    try:
        result = OrderModel.get_order_detail(order_id)
        return jsonify({
            "success": True,
            "message": "Lấy chi tiết đơn hàng thành công",
            "data": result
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==============================
# API TẠO ĐƠN HÀNG TỪ GIỎ HÀNG
# BODY: user_id, receiver_name, phone, address, payment_method
# ==============================
@order_bp.route("/checkout", methods=["POST"])
@require_auth
def checkout():
    try:
        data = request.json or {}
        validate_checkout_payload(data)

        user_id = data.get("user_id")
        if not is_current_user(user_id):
            return jsonify({
                "success": False,
                "message": "Bạn không có quyền tạo đơn hàng cho user này"
            }), 403

        OrderService.validate_checkout(
            user_id=user_id,
            receiver_name=data.get("receiver_name"),
            phone=data.get("phone"),
            address=data.get("address")
        )

        order_id = OrderModel.create_order(
            user_id=user_id,
            receiver_name=data.get("receiver_name"),
            phone=data.get("phone"),
            address=data.get("address"),
            payment_method=data.get("payment_method", "COD")
        )
        return jsonify({
            "success": True,
            "message": "Đặt hàng thành công",
            "order_id": order_id
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
# API CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
# BODY: status
# ==============================
@order_bp.route("/status/<int:order_id>", methods=["PUT"])
@require_auth
@require_admin
def update_order_status(order_id):
    try:
        data = request.json
        OrderModel.update_order_status(order_id, data.get("status"))
        return jsonify({
            "success": True,
            "message": "Cập nhật trạng thái đơn hàng thành công"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
