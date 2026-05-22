from flask import Blueprint, jsonify, request
from models.news_model import NewsModel
from middleware import require_auth, require_admin

news_bp = Blueprint("news", __name__)

@news_bp.route("/", methods=["GET"])
def get_news():
    try:
        news = NewsModel.get_all_news()
        return jsonify({
            "success": True,
            "message": "Lấy tin tức thành công",
            "data": news
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==============================
# API THÊM TIN TỨC
# ==============================
@news_bp.route("/", methods=["POST"])
@require_auth
@require_admin
def create_news():
    try:
        data = request.json
        NewsModel.create_news(data)
        return jsonify({
            "success": True,
            "message": "Thêm tin tức thành công"
        }), 201
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==============================
# API CẬP NHẬT TIN TỨC
# ==============================
@news_bp.route("/<int:news_id>", methods=["PUT"])
@require_auth
@require_admin
def update_news(news_id):
    try:
        data = request.json
        NewsModel.update_news(news_id, data)
        return jsonify({
            "success": True,
            "message": "Cập nhật tin tức thành công"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==============================
# API XÓA TIN TỨC
# ==============================
@news_bp.route("/<int:news_id>", methods=["DELETE"])
@require_auth
@require_admin
def delete_news(news_id):
    try:
        NewsModel.delete_news(news_id)
        return jsonify({
            "success": True,
            "message": "Xóa tin tức thành công"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
