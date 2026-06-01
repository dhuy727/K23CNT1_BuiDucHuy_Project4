# ==============================
# FILE: models/cart_model.py
# CHỨC NĂNG:
# - Xử lý tất cả SQL logic liên quan tới giỏ hàng
# ==============================

from database.db import get_connection, rows_to_dict


class CartModel:
    """Model xử lý tất cả operations liên quan tới giỏ hàng"""

    @staticmethod
    def get_cart_by_user(user_id):
        """Lấy giỏ hàng theo user"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                ct.G9_MaChiTiet AS cart_detail_id,
                gh.G9_MaGioHang AS cart_id,
                sp.G9_MaSanPham AS product_id,
                sp.G9_TenSanPham AS product_name,
                sp.G9_HinhAnhChinh AS image,
                ct.G9_SoLuong AS quantity,
                sp.G9_SoLuongTon AS stock_quantity,
                ct.G9_DonGia AS price,
                ct.G9_SoLuong * ct.G9_DonGia AS total
            FROM G9_GioHang gh
            INNER JOIN G9_ChiTietGioHang ct
                ON gh.G9_MaGioHang = ct.G9_MaGioHang
            INNER JOIN G9_SanPham sp
                ON ct.G9_MaSanPham = sp.G9_MaSanPham
            WHERE gh.G9_MaNguoiDung = ?
        """, (user_id,))

        cart_items = rows_to_dict(cursor)
        cursor.close()
        conn.close()

        return cart_items

    @staticmethod
    def add_to_cart(user_id, product_id, quantity):
        """Thêm sản phẩm vào giỏ hàng"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                SELECT G9_Gia 
                FROM G9_SanPham 
                WHERE G9_MaSanPham = ?
            """, (product_id,))
            product = cursor.fetchone()

            if not product:
                raise ValueError("Sản phẩm không tồn tại")

            price = product[0]

            cursor.execute("""
                SELECT G9_MaGioHang 
                FROM G9_GioHang 
                WHERE G9_MaNguoiDung = ?
            """, (user_id,))
            cart = cursor.fetchone()

            # Nếu chưa có giỏ hàng thì tạo mới
            if not cart:
                cursor.execute("""
                    INSERT INTO G9_GioHang(G9_MaNguoiDung)
                    OUTPUT INSERTED.G9_MaGioHang
                    VALUES(?)
                """, (user_id,))
                cart_id = cursor.fetchone()[0]
            else:
                cart_id = cart[0]

            cursor.execute("""
                SELECT G9_MaChiTiet, G9_SoLuong
                FROM G9_ChiTietGioHang
                WHERE G9_MaGioHang = ? AND G9_MaSanPham = ?
            """, (cart_id, product_id))
            item = cursor.fetchone()

            if item:
                # Nếu có rồi thì cộng thêm số lượng
                cursor.execute("""
                    UPDATE G9_ChiTietGioHang
                    SET G9_SoLuong = G9_SoLuong + ?
                    WHERE G9_MaChiTiet = ?
                """, (quantity, item[0]))
            else:
                # Nếu chưa có thì thêm mới
                cursor.execute("""
                    INSERT INTO G9_ChiTietGioHang
                    (G9_MaGioHang, G9_MaSanPham, G9_SoLuong, G9_DonGia)
                    VALUES (?, ?, ?, ?)
                """, (cart_id, product_id, quantity, price))

            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_cart_line_product_id(cart_detail_id):
        """Lấy mã sản phẩm từ dòng chi tiết giỏ hàng"""
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("""
                SELECT G9_MaSanPham
                FROM G9_ChiTietGioHang
                WHERE G9_MaChiTiet = ?
            """, (cart_detail_id,))
            row = cursor.fetchone()
            if not row:
                raise ValueError("Sản phẩm không tồn tại trong giỏ hàng")
            return row[0]
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def update_cart_item(cart_detail_id, quantity):
        """Cập nhật số lượng sản phẩm trong giỏ"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                UPDATE G9_ChiTietGioHang
                SET G9_SoLuong = ?
                WHERE G9_MaChiTiet = ?
            """, (quantity, cart_detail_id))

            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def delete_cart_item(cart_detail_id):
        """Xóa sản phẩm khỏi giỏ hàng"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                DELETE FROM G9_ChiTietGioHang
                WHERE G9_MaChiTiet = ?
            """, (cart_detail_id,))

            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()
