from flask import Blueprint, jsonify
from database.db_config import get_connection

# TẠO BLUEPRINT
news_bp = Blueprint(
    "news_bp",
    __name__
)

# LẤY DANH SÁCH TIN TỨC
@news_bp.route("/", methods=["GET"])
def get_news():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            tt.G9_MaTinTuc,
            tt.G9_TieuDe,
            tt.G9_MoTaNgan,
            tt.G9_NoiDung,
            tt.G9_HinhAnh,
            tt.G9_NgayDang,
            dm.G9_TenDanhMuc,
            nd.G9_HoTen

        FROM G9_TinTuc tt

        LEFT JOIN G9_DanhMucTinTuc dm
            ON tt.G9_MaDanhMuc = dm.G9_MaDanhMuc

        LEFT JOIN G9_NguoiDung nd
            ON tt.G9_MaNguoiDang = nd.G9_MaNguoiDung

        ORDER BY tt.G9_NgayDang DESC
    """)

    news_list = []

    rows = cursor.fetchall()

    for row in rows:

        news_list.append({

            "id": row.G9_MaTinTuc,
            "title": row.G9_TieuDe,
            "shortDescription": row.G9_MoTaNgan,
            "content": row.G9_NoiDung,
            "image": row.G9_HinhAnh,
            "createdAt": str(row.G9_NgayDang),
            "category": row.G9_TenDanhMuc,
            "author": row.G9_HoTen

        })

    conn.close()

    return jsonify(news_list)


# CHI TIẾT TIN TỨC
@news_bp.route("/<int:id>", methods=["GET"])
def get_news_detail(id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM G9_TinTuc
        WHERE G9_MaTinTuc = ?
    """, (id))

    row = cursor.fetchone()

    conn.close()

    if row:

        return jsonify({

            "id": row.G9_MaTinTuc,
            "title": row.G9_TieuDe,
            "shortDescription": row.G9_MoTaNgan,
            "content": row.G9_NoiDung,
            "image": row.G9_HinhAnh,
            "createdAt": str(row.G9_NgayDang)

        })

    return jsonify({
        "message": "Không tìm thấy tin tức"
    })