# ==============================
# FILE: models/order_model.py
# CHỨC NĂNG:
# - Xử lý tất cả SQL logic liên quan tới đơn hàng
# ==============================

from database.db import get_connection, rows_to_dict, row_to_dict
from models.product_model import ProductModel


class OrderModel:
    """Model xử lý tất cả operations liên quan tới đơn hàng"""

    @staticmethod
    def get_all_orders():
        """Lấy tất cả đơn hàng"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                dh.G9_MaDonHang AS id,
                nd.G9_HoTen AS customer_name,
                dh.G9_TenNguoiNhan AS receiver_name,
                dh.G9_SDTNhan AS phone,
                dh.G9_DiaChiGiao AS address,
                dh.G9_TongTien AS total,
                dh.G9_TrangThai AS status,
                dh.G9_NgayDat AS created_at
            FROM G9_DonHang dh
            INNER JOIN G9_NguoiDung nd
                ON dh.G9_MaNguoiDung = nd.G9_MaNguoiDung
            ORDER BY dh.G9_MaDonHang DESC
        """)

        orders = rows_to_dict(cursor)
        cursor.close()
        conn.close()

        return orders

    @staticmethod
    def get_orders_by_user(user_id):
        """Lấy đơn hàng theo user"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                G9_MaDonHang AS id,
                G9_TenNguoiNhan AS receiver_name,
                G9_SDTNhan AS phone,
                G9_DiaChiGiao AS address,
                G9_TongTien AS total,
                G9_TrangThai AS status,
                G9_NgayDat AS created_at
            FROM G9_DonHang
            WHERE G9_MaNguoiDung = ?
            ORDER BY G9_MaDonHang DESC
        """, (user_id,))

        orders = rows_to_dict(cursor)
        cursor.close()
        conn.close()

        return orders

    @staticmethod
    def get_order_detail(order_id):
        """Lấy chi tiết đơn hàng"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                G9_MaDonHang AS id,
                G9_TenNguoiNhan AS receiver_name,
                G9_SDTNhan AS phone,
                G9_DiaChiGiao AS address,
                G9_TongTien AS total,
                G9_TrangThai AS status,
                G9_NgayDat AS created_at
            FROM G9_DonHang
            WHERE G9_MaDonHang = ?
        """, (order_id,))

        order = row_to_dict(cursor)

        cursor.execute("""
            SELECT
                ct.G9_MaChiTiet AS id,
                sp.G9_TenSanPham AS product_name,
                sp.G9_HinhAnhChinh AS image,
                ct.G9_SoLuong AS quantity,
                ct.G9_DonGia AS price,
                ct.G9_ThanhTien AS total
            FROM G9_ChiTietDonHang ct
            INNER JOIN G9_SanPham sp
                ON ct.G9_MaSanPham = sp.G9_MaSanPham
            WHERE ct.G9_MaDonHang = ?
        """, (order_id,))

        items = rows_to_dict(cursor)
        cursor.close()
        conn.close()

        return {"order": order, "items": items}

    @staticmethod
    def create_order(user_id, receiver_name, phone, address, payment_method="COD"):
        """Tạo đơn hàng từ giỏ hàng"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                SELECT G9_MaGioHang
                FROM G9_GioHang
                WHERE G9_MaNguoiDung = ?
            """, (user_id,))

            cart = cursor.fetchone()

            if not cart:
                raise ValueError("Giỏ hàng trống")

            cart_id = cart[0]

            cursor.execute("""
                SELECT 
                    G9_MaSanPham,
                    G9_SoLuong,
                    G9_DonGia,
                    G9_SoLuong * G9_DonGia AS ThanhTien
                FROM G9_ChiTietGioHang
                WHERE G9_MaGioHang = ?
            """, (cart_id,))

            cart_items = cursor.fetchall()

            if not cart_items:
                raise ValueError("Giỏ hàng chưa có sản phẩm")

            # Tính tổng tiền
            total = sum([item.ThanhTien for item in cart_items])

            # Nếu phương thức thanh toán là PAYPAL thì để trạng thái đơn là 'Chưa thanh toán'
            # để tránh tự động duyệt đơn trước khi PayPal xác nhận.
            order_status = 'Chờ xác nhận'
            if payment_method and payment_method.upper() == 'PAYPAL':
                order_status = 'Chưa thanh toán'

            cursor.execute("""
                INSERT INTO G9_DonHang
                (
                    G9_MaNguoiDung,
                    G9_TenNguoiNhan,
                    G9_SDTNhan,
                    G9_DiaChiGiao,
                    G9_TongTien,
                    G9_TrangThai
                )
                OUTPUT INSERTED.G9_MaDonHang
                VALUES (?, ?, ?, ?, ?, ?)
            """, (user_id, receiver_name, phone, address, total, order_status))

            order_id = cursor.fetchone()[0]

            for item in cart_items:
                cursor.execute("""
                    INSERT INTO G9_ChiTietDonHang
                    (
                        G9_MaDonHang,
                        G9_MaSanPham,
                        G9_SoLuong,
                        G9_DonGia
                    )
                    VALUES (?, ?, ?, ?)
                """, (order_id, item.G9_MaSanPham, item.G9_SoLuong, item.G9_DonGia))

                # Trừ tồn kho sản phẩm
                cursor.execute("""
                    UPDATE G9_SanPham
                    SET G9_SoLuongTon = G9_SoLuongTon - ?
                    WHERE G9_MaSanPham = ?
                """, (item.G9_SoLuong, item.G9_MaSanPham))

                ProductModel.sync_status_with_stock(item.G9_MaSanPham, cursor=cursor)

            payment_status = 'Chưa thanh toán'
            cursor.execute("""
                INSERT INTO G9_ThanhToan
                (
                    G9_MaDonHang,
                    G9_PhuongThuc,
                    G9_SoTien,
                    G9_TrangThai
                )
                VALUES (?, ?, ?, ?)
            """, (order_id, payment_method, total, payment_status))

            cursor.execute("""
                DELETE FROM G9_ChiTietGioHang
                WHERE G9_MaGioHang = ?
            """, (cart_id,))

            conn.commit()
            return order_id
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def cancel_unpaid_order_and_restore_cart(order_id):
        """Hủy đơn chưa thanh toán và trả sản phẩm về giỏ hàng (idempotent)."""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            order_id = int(order_id)

            cursor.execute("""
                SELECT G9_MaNguoiDung, G9_TrangThai
                FROM G9_DonHang
                WHERE G9_MaDonHang = ?
            """, (order_id,))
            row = cursor.fetchone()
            if not row:
                raise ValueError("Đơn hàng không tồn tại")

            user_id, status = row[0], row[1]

            if status == "Đã hủy":
                return {"restored": False, "message": "Đơn đã được hủy trước đó"}

            if status == "Đã thanh toán":
                raise ValueError("Không thể hủy đơn đã thanh toán")

            if status != "Chưa thanh toán":
                raise ValueError(f"Không thể hủy đơn ở trạng thái '{status}'")

            cursor.execute("""
                SELECT G9_MaSanPham, G9_SoLuong, G9_DonGia
                FROM G9_ChiTietDonHang
                WHERE G9_MaDonHang = ?
            """, (order_id,))
            items = cursor.fetchall()

            cursor.execute("""
                SELECT G9_MaGioHang
                FROM G9_GioHang
                WHERE G9_MaNguoiDung = ?
            """, (user_id,))
            cart = cursor.fetchone()

            if not cart:
                cursor.execute("""
                    INSERT INTO G9_GioHang(G9_MaNguoiDung)
                    OUTPUT INSERTED.G9_MaGioHang
                    VALUES(?)
                """, (user_id,))
                cart_id = cursor.fetchone()[0]
            else:
                cart_id = cart[0]

            for item in items:
                product_id, qty, price = item[0], item[1], item[2]

                cursor.execute("""
                    UPDATE G9_SanPham
                    SET G9_SoLuongTon = G9_SoLuongTon + ?
                    WHERE G9_MaSanPham = ?
                """, (qty, product_id))

                ProductModel.sync_status_with_stock(product_id, cursor=cursor)

                cursor.execute("""
                    SELECT G9_MaChiTiet, G9_SoLuong
                    FROM G9_ChiTietGioHang
                    WHERE G9_MaGioHang = ? AND G9_MaSanPham = ?
                """, (cart_id, product_id))
                existing = cursor.fetchone()

                if existing:
                    cursor.execute("""
                        UPDATE G9_ChiTietGioHang
                        SET G9_SoLuong = G9_SoLuong + ?
                        WHERE G9_MaChiTiet = ?
                    """, (qty, existing[0]))
                else:
                    cursor.execute("""
                        INSERT INTO G9_ChiTietGioHang
                        (G9_MaGioHang, G9_MaSanPham, G9_SoLuong, G9_DonGia)
                        VALUES (?, ?, ?, ?)
                    """, (cart_id, product_id, qty, price))

            cursor.execute("""
                UPDATE G9_DonHang
                SET G9_TrangThai = ?
                WHERE G9_MaDonHang = ?
            """, ("Đã hủy", order_id))

            cursor.execute("""
                INSERT INTO G9_LichSuTrangThaiDonHang
                (G9_MaDonHang, G9_TrangThai)
                VALUES (?, ?)
            """, (order_id, "Đã hủy"))

            cursor.execute("""
                UPDATE G9_ThanhToan
                SET G9_TrangThai = ?
                WHERE G9_MaDonHang = ?
            """, ("Thất bại", order_id))

            conn.commit()
            return {"restored": True, "message": "Đã hủy đơn và trả sản phẩm về giỏ hàng"}
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def update_order_status(order_id, status):
        """Cập nhật trạng thái đơn hàng"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                UPDATE G9_DonHang
                SET G9_TrangThai = ?
                WHERE G9_MaDonHang = ?
            """, (status, order_id))

            # Lưu lịch sử trạng thái
            cursor.execute("""
                INSERT INTO G9_LichSuTrangThaiDonHang
                (
                    G9_MaDonHang,
                    G9_TrangThai
                )
                VALUES (?, ?)
            """, (order_id, status))

            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()
