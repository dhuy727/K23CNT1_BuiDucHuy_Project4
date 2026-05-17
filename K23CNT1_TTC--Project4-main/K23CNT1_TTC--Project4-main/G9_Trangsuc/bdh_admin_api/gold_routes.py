from flask import Blueprint, jsonify
from database.db_config import get_connection

# TẠO BLUEPRINT
gold_bp = Blueprint(
    "gold_bp",
    __name__
)

# LẤY DANH SÁCH GIÁ VÀNG
@gold_bp.route("/", methods=["GET"])
def get_gold_prices():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            G9_MaGiaVang,
            G9_LoaiVang,
            G9_GiaMua,
            G9_GiaBan,
            G9_NgayCapNhat
        FROM G9_GiaVang
        ORDER BY G9_NgayCapNhat DESC
    """)

    gold_prices = []

    rows = cursor.fetchall()

    for row in rows:

        gold_prices.append({

            "id": row.G9_MaGiaVang,
            "type": row.G9_LoaiVang,
            "buyPrice": float(row.G9_GiaMua),
            "sellPrice": float(row.G9_GiaBan),
            "updatedAt": str(row.G9_NgayCapNhat)

        })

    conn.close()

    return jsonify(gold_prices)


# GIÁ VÀNG MỚI NHẤT
@gold_bp.route("/latest", methods=["GET"])
def get_latest_gold_prices():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM (
            SELECT *,
                   ROW_NUMBER() OVER(
                       PARTITION BY G9_LoaiVang
                       ORDER BY G9_NgayCapNhat DESC
                   ) AS rn
            FROM G9_GiaVang
        ) t
        WHERE rn = 1
    """)

    prices = []

    rows = cursor.fetchall()

    for row in rows:

        prices.append({

            "type": row.G9_LoaiVang,
            "buyPrice": float(row.G9_GiaMua),
            "sellPrice": float(row.G9_GiaBan),
            "updatedAt": str(row.G9_NgayCapNhat)

        })

    conn.close()

    return jsonify(prices)