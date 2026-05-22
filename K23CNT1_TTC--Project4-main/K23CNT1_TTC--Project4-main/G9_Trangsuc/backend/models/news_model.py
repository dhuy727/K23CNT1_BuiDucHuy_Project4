# ==============================
# FILE: models/news_model.py
# CHỨC NĂNG:
# - Xử lý tất cả SQL logic liên quan tới tin tức
# ==============================

from database.db import get_connection, rows_to_dict


class NewsModel:
    """Model xử lý tất cả operations liên quan tới tin tức"""

    @staticmethod
    def get_all_news():
        """Lấy danh sách tất cả tin tức"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                tt.G9_MaTinTuc AS id,
                tt.G9_TieuDe AS title,
                tt.G9_MoTaNgan AS short_description,
                tt.G9_NoiDung AS content,
                tt.G9_HinhAnh AS image,
                tt.G9_NgayDang AS created_at,
                tt.G9_TrangThai AS status,
                dm.G9_TenDanhMuc AS category_name
            FROM G9_TinTuc tt
            LEFT JOIN G9_DanhMucTinTuc dm
                ON tt.G9_MaDanhMuc = dm.G9_MaDanhMuc
            ORDER BY tt.G9_NgayDang DESC
        """)

        news = rows_to_dict(cursor)
        cursor.close()
        conn.close()

        return news
