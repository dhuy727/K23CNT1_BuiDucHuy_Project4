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
    # Đặt trạng thái sản phẩm theo tồn kho
    def resolve_status_by_quantity(quantity, status=None):
        """Tự động đặt trạng thái theo số lượng tồn kho"""
        quantity = int(quantity or 0)
        if quantity <= 0:
            return "Hết hàng"
        if status == "Hết hàng":
            return "Còn hàng"
        return status or "Còn hàng"

    @staticmethod
    # Đồng bộ trạng thái sau khi đổi tồn kho
    def sync_status_with_stock(product_id, cursor=None):
        """Đồng bộ trạng thái sản phẩm sau khi thay đổi tồn kho"""
        sql = """
            UPDATE G9_SanPham
            SET G9_TrangThai = CASE
                WHEN G9_SoLuongTon <= 0 THEN N'Hết hàng'
                WHEN G9_TrangThai = N'Hết hàng' THEN N'Còn hàng'
                ELSE G9_TrangThai
            END
            WHERE G9_MaSanPham = ?
        """

        if cursor is not None:
            cursor.execute(sql, (product_id,))
            return True

        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(sql, (product_id,))
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def create_product(data):
        """Tạo sản phẩm mới"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            quantity = int(data.get("quantity") or 0)
            status = ProductModel.resolve_status_by_quantity(
                quantity,
                data.get("status", "Còn hàng")
            )

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
                quantity,
                data.get("image"),
                data.get("description"),
                status
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
            quantity = int(data.get("quantity") or 0)
            status = ProductModel.resolve_status_by_quantity(
                quantity,
                data.get("status", "Còn hàng")
            )

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
                quantity,
                data.get("image"),
                data.get("description"),
                status,
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
    def update_product_status(product_id, status):
        """Cập nhật trạng thái sản phẩm"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                UPDATE G9_SanPham
                SET G9_TrangThai = ?
                WHERE G9_MaSanPham = ?
            """, (status, product_id))

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
