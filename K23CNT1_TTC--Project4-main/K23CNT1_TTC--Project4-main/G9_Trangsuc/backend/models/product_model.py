# ==============================
# FILE: models/product_model.py
# CHỨC NĂNG:
# - Xử lý tất cả SQL logic liên quan tới sản phẩm
# ==============================

from database.db import get_connection, rows_to_dict, row_to_dict


class ProductModel:
    """Model xử lý tất cả operations liên quan tới sản phẩm"""
    
    @staticmethod
    def get_all_products():
        """Lấy danh sách tất cả sản phẩm"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                sp.G9_MaSanPham AS id,
                sp.G9_TenSanPham AS name,
                sp.G9_Gia AS price,
                sp.G9_SoLuongTon AS quantity,
                sp.G9_HinhAnhChinh AS image,
                sp.G9_MoTa AS description,
                sp.G9_ChatLieu AS material,
                sp.G9_TrangThai AS status,
                sp.G9_MaDanhMuc AS category_id,
                dm.G9_TenDanhMuc AS category_name
            FROM G9_SanPham sp
            LEFT JOIN G9_DanhMuc dm 
                ON sp.G9_MaDanhMuc = dm.G9_MaDanhMuc
            ORDER BY sp.G9_MaSanPham DESC
        """)

        products = rows_to_dict(cursor)
        cursor.close()
        conn.close()
        
        return products

    @staticmethod
    def get_product_by_id(product_id):
        """Lấy chi tiết sản phẩm theo ID"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                sp.G9_MaSanPham AS id,
                sp.G9_TenSanPham AS name,
                sp.G9_Gia AS price,
                sp.G9_SoLuongTon AS quantity,
                sp.G9_HinhAnhChinh AS image,
                sp.G9_MoTa AS description,
                sp.G9_ChatLieu AS material,
                sp.G9_TrangThai AS status,
                sp.G9_MaDanhMuc AS category_id,
                dm.G9_TenDanhMuc AS category_name
            FROM G9_SanPham sp
            LEFT JOIN G9_DanhMuc dm 
                ON sp.G9_MaDanhMuc = dm.G9_MaDanhMuc
            WHERE sp.G9_MaSanPham = ?
        """, (product_id,))

        product = row_to_dict(cursor)
        cursor.close()
        conn.close()
        
        return product

    @staticmethod
    def create_product(data):
        """Tạo sản phẩm mới"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                INSERT INTO G9_SanPham
                (
                    G9_TenSanPham,
                    G9_MaDanhMuc,
                    G9_ChatLieu,
                    G9_Gia,
                    G9_SoLuongTon,
                    G9_HinhAnhChinh,
                    G9_MoTa,
                    G9_TrangThai
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data.get("name"),
                data.get("category_id"),
                data.get("material"),
                data.get("price"),
                data.get("quantity"),
                data.get("image"),
                data.get("description"),
                data.get("status", "Còn hàng")
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
    def update_product(product_id, data):
        """Cập nhật sản phẩm"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                UPDATE G9_SanPham
                SET 
                    G9_TenSanPham = ?,
                    G9_MaDanhMuc = ?,
                    G9_ChatLieu = ?,
                    G9_Gia = ?,
                    G9_SoLuongTon = ?,
                    G9_HinhAnhChinh = ?,
                    G9_MoTa = ?,
                    G9_TrangThai = ?
                WHERE G9_MaSanPham = ?
            """, (
                data.get("name"),
                data.get("category_id"),
                data.get("material"),
                data.get("price"),
                data.get("quantity"),
                data.get("image"),
                data.get("description"),
                data.get("status"),
                product_id
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
    def delete_product(product_id):
        """Xóa sản phẩm"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                DELETE FROM G9_SanPham
                WHERE G9_MaSanPham = ?
            """, (product_id,))

            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()
