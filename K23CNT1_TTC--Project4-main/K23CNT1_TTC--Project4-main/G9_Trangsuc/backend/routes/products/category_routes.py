# ==============================
# FILE: routes/products/category_routes.py
# CHỨC NĂNG:
# - Lấy danh mục
# - Thêm danh mục
# - Cập nhật danh mục
# - Xóa danh mục
# ==============================

from flask import Blueprint, jsonify, request
from models.category_model import CategoryModel
from services.category_service import CategoryService
from middleware import require_auth, require_admin
from utils.request_validator import ValidationError, validate_category_payload

category_bp = Blueprint("categories", __name__)


# ==============================
# URL: /api/categories/
# ==============================
@category_bp.route("/", methods=["GET"])
def get_categories():
    try:
        categories = CategoryModel.get_all_categories()
        return jsonify({
            "success": True,
            "message": "Lấy danh mục thành công",
            "data": categories
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==============================
# URL: /api/categories/<id>
# ==============================
@category_bp.route("/<int:category_id>", methods=["GET"])
def get_category(category_id):
    try:
        category = CategoryModel.get_category_by_id(category_id)
        if not category:
            return jsonify({
                "success": False,
                "message": "Không tìm thấy danh mục"
            }), 404

        return jsonify({
            "success": True,
            "message": "Lấy chi tiết danh mục thành công",
            "data": category
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==============================
# BODY: name, description, parent_id, status
# ==============================
@category_bp.route("/", methods=["POST"])
@require_auth
@require_admin
def create_category():
    try:
        data = request.json or {}
        validate_category_payload(data)

        CategoryModel.create_category({
            "name": data.get("name"),
            "description": data.get("description"),
            "parent_id": data.get("parent_id"),
            "status": data.get("status", "Hoạt động"),
        })

        return jsonify({
            "success": True,
            "message": "Thêm danh mục thành công"
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
# BODY: name, description, parent_id, status
@require_auth
@require_admin
# ==============================
@category_bp.route("/<int:category_id>", methods=["PUT"])
@require_auth
@require_admin
def update_category(category_id):
    try:
        data = request.json or {}
        validate_category_payload(data, require_all=False)

        CategoryModel.update_category(category_id, {
            "name": data.get("name"),
            "description": data.get("description"),
            "parent_id": data.get("parent_id"),
            "status": data.get("status"),
        })

        return jsonify({
            "success": True,
            "message": "Cập nhật danh mục thành công"
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
# URL: /api/categories/<id>
@require_auth
@require_admin
# ==============================
@category_bp.route("/<int:category_id>", methods=["DELETE"])
def delete_category(category_id):
    try:
        CategoryModel.delete_category(category_id)

        return jsonify({
            "success": True,
            "message": "Xóa danh mục thành công"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
