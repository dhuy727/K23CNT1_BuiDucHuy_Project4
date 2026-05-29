# ==============================
# FILE: models/news_model.py
# CHỨC NĂNG:
# - Xử lý tất cả SQL logic liên quan tới tin tức
# ==============================

from database.db import get_connection, rows_to_dict, row_to_dict


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
                tt.G9_MaDanhMuc AS category_id,
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

    @staticmethod
    def get_news_by_id(news_id):
        """Lấy chi tiết tin tức theo ID"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                tt.G9_MaTinTuc AS id,
                tt.G9_TieuDe AS title,
                tt.G9_MoTaNgan AS short_description,
                tt.G9_NoiDung AS content,
                tt.G9_HinhAnh AS image,
                tt.G9_MaDanhMuc AS category_id,
                tt.G9_NgayDang AS created_at,
                tt.G9_TrangThai AS status,
                dm.G9_TenDanhMuc AS category_name
            FROM G9_TinTuc tt
            LEFT JOIN G9_DanhMucTinTuc dm
                ON tt.G9_MaDanhMuc = dm.G9_MaDanhMuc
            WHERE tt.G9_MaTinTuc = ?
        """, (news_id,))

        item = row_to_dict(cursor)
        cursor.close()
        conn.close()

        return item

    @staticmethod
    def create_news(data):
        """Tạo tin tức mới"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                INSERT INTO G9_TinTuc (
                    G9_TieuDe,
                    G9_MoTaNgan,
                    G9_NoiDung,
                    G9_HinhAnh,
                    G9_MaDanhMuc,
                    G9_TrangThai
                )
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                data.get("title"),
                data.get("short_description"),
                data.get("content"),
                data.get("image"),
                data.get("category_id") or None,
                data.get("status", "Hiển thị"),
            ))
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def update_news(news_id, data):
        """Cập nhật tin tức"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                UPDATE G9_TinTuc
                SET
                    G9_TieuDe = ?,
                    G9_MoTaNgan = ?,
                    G9_NoiDung = ?,
                    G9_HinhAnh = ?,
                    G9_MaDanhMuc = ?,
                    G9_TrangThai = ?
                WHERE G9_MaTinTuc = ?
            """, (
                data.get("title"),
                data.get("short_description"),
                data.get("content"),
                data.get("image"),
                data.get("category_id") or None,
                data.get("status"),
                news_id,
            ))
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def delete_news(news_id):
        """Xóa tin tức"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                DELETE FROM G9_TinTuc
                WHERE G9_MaTinTuc = ?
            """, (news_id,))
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()
