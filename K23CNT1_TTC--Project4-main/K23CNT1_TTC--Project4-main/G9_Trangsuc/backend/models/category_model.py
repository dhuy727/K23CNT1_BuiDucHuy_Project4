# ==============================
# FILE: models/category_model.py
# CHỨC NĂNG:
# - Xử lý tất cả SQL logic liên quan tới danh mục
# ==============================

from database.db import get_connection, rows_to_dict, row_to_dict


class CategoryModel:
    """Model xử lý tất cả operations liên quan tới danh mục"""

    @staticmethod
    def get_all_categories():
        """Lấy danh sách tất cả danh mục"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                G9_MaDanhMuc AS id,
                G9_TenDanhMuc AS name,
                G9_MoTa AS description,
                G9_MaDanhMucCha AS parent_id,
                G9_TrangThai AS status
            FROM G9_DanhMuc
            ORDER BY G9_MaDanhMuc DESC
        """)

        categories = rows_to_dict(cursor)
        cursor.close()
        conn.close()

        return categories

    @staticmethod
    def get_category_by_id(category_id):
        """Lấy chi tiết danh mục theo ID"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                G9_MaDanhMuc AS id,
                G9_TenDanhMuc AS name,
                G9_MoTa AS description,
                G9_MaDanhMucCha AS parent_id,
                G9_TrangThai AS status
            FROM G9_DanhMuc
            WHERE G9_MaDanhMuc = ?
        """, (category_id,))

        category = row_to_dict(cursor)
        cursor.close()
        conn.close()

        return category

    @staticmethod
    def create_category(data):
        """Tạo danh mục mới"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                INSERT INTO G9_DanhMuc
                (
                    G9_TenDanhMuc,
                    G9_MoTa,
                    G9_MaDanhMucCha,
                    G9_TrangThai
                )
                VALUES (?, ?, ?, ?)
            """, (
                data.get("name"),
                data.get("description"),
                data.get("parent_id") or None,
                data.get("status", "Hoạt động")
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
    def update_category(category_id, data):
        """Cập nhật danh mục"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                UPDATE G9_DanhMuc
                SET 
                    G9_TenDanhMuc = ?,
                    G9_MoTa = ?,
                    G9_MaDanhMucCha = ?,
                    G9_TrangThai = ?
                WHERE G9_MaDanhMuc = ?
            """, (
                data.get("name"),
                data.get("description"),
                data.get("parent_id") or None,
                data.get("status"),
                category_id
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
    def delete_category(category_id):
        """Xóa danh mục"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                DELETE FROM G9_DanhMuc
                WHERE G9_MaDanhMuc = ?
            """, (category_id,))

            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()
