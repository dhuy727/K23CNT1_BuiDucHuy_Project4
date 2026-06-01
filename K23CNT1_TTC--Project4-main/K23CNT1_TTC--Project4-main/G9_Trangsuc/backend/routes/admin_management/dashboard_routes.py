# ==============================
# FILE: routes/admin_management/dashboard_routes.py
# CHỨC NĂNG:
# - Thống kê tổng quan admin
# ==============================

from flask import Blueprint, jsonify
from models.dashboard_model import DashboardModel
from middleware import require_auth, require_admin

dashboard_bp = Blueprint("dashboard", __name__)


# ==============================
# URL: /api/dashboard/
# ==============================
@dashboard_bp.route("/", methods=["GET"])
@require_auth
@require_admin
def dashboard():
    try:
        stats = DashboardModel.get_dashboard_stats()
        return jsonify({
            "success": True,
            "message": "Lấy thống kê thành công",
            "data": stats
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
