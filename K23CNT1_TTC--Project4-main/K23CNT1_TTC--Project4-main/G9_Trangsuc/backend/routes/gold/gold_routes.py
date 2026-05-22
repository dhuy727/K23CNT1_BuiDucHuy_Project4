from flask import Blueprint, jsonify, request
from models.gold_model import GoldModel
from middleware import require_auth, require_admin

gold_bp = Blueprint("gold", __name__)

@gold_bp.route("/", methods=["GET"])
def get_gold_price():
    try:
        data = GoldModel.get_all_gold_prices()
        return jsonify({
            "success": True,
            "message": "Lấy giá vàng thành công",
            "data": data
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==============================
# API THÊM GIÁ VÀNG
# ==============================
@gold_bp.route("/", methods=["POST"])
@require_auth
@require_admin
def create_gold_price():
    try:
        data = request.json
        GoldModel.create_gold_price(data)
        return jsonify({
            "success": True,
            "message": "Thêm giá vàng thành công"
        }), 201
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==============================
# API CẬP NHẬT GIÁ VÀNG
# ==============================
@gold_bp.route("/<int:gold_id>", methods=["PUT"])
@require_auth
@require_admin
def update_gold_price(gold_id):
    try:
        data = request.json
        GoldModel.update_gold_price(gold_id, data)
        return jsonify({
            "success": True,
            "message": "Cập nhật giá vàng thành công"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
