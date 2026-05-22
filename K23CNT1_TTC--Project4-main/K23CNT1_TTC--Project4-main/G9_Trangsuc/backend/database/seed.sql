-- -- USE G9_TrangSucDB;

-- -- INSERT INTO users(full_name, username, email, password, role)
-- -- VALUES 
-- -- ('Admin G9', 'admin', 'admin@gmail.com', '123456', 'admin'),
-- -- ('Nguyễn Ngọc Hiến', 'hien', 'hien@gmail.com', '123456', 'user');

-- -- INSERT INTO categories(name, description)
-- -- VALUES
-- -- ('Nhẫn', 'Các mẫu nhẫn vàng, bạc, kim cương'),
-- -- ('Dây chuyền', 'Trang sức dây chuyền cao cấp'),
-- -- ('Bông tai', 'Bông tai nữ thời trang'),
-- -- ('Lắc tay', 'Lắc tay vàng bạc');

-- -- INSERT INTO products(name, price, quantity, image, description, category_id)
-- -- VALUES
-- -- ('Nhẫn vàng 18K', 5000000, 10, 'ring1.jpg', 'Nhẫn vàng 18K sang trọng', 1),
-- -- ('Nhẫn kim cương', 25000000, 5, 'ring2.jpg', 'Nhẫn kim cương cao cấp', 1),
-- -- ('Dây chuyền bạc', 1200000, 20, 'necklace1.jpg', 'Dây chuyền bạc nữ đẹp', 2),
-- -- ('Dây chuyền vàng', 8000000, 8, 'necklace2.jpg', 'Dây chuyền vàng 24K', 2),
-- -- ('Bông tai ngọc trai', 2000000, 15, 'earring1.jpg', 'Bông tai ngọc trai nữ tính', 3),
-- -- ('Lắc tay vàng', 6500000, 12, 'bracelet1.jpg', 'Lắc tay vàng sang trọng', 4);
-- INSERT INTO G9_VaiTro (G9_TenVaiTro)
-- VALUES 
-- (N'Admin'),
-- (N'Nhân viên'),
-- (N'Khách hàng');

-- INSERT INTO G9_NguoiDung 
-- (G9_HoTen, G9_TenDangNhap, G9_MatKhau, G9_Email, G9_SoDienThoai, G9_MaVaiTro)
-- VALUES
-- (N'Bùi Đức Huy', 'admin', '123456', 'admin@gmail.com', '0900000001', 1), -- Admin
-- (N'Vũ Mai Chi', 'user1', '123456', 'chi@gmail.com', '0900000002', 3),
-- (N'Phạm Tuấn Phong', 'user2', '123456', 'phong@gmail.com', '0900000003', 3),
-- (N'Nguyễn Ngọc Hiến', 'user3', '123456', 'hien@gmail.com', '0900000004', 3);

-- -- cha
-- INSERT INTO G9_DanhMuc (G9_TenDanhMuc)
-- VALUES (N'Trang sức'),
-- (N'Vàng');

-- -- con
-- INSERT INTO G9_DanhMuc (G9_TenDanhMuc, G9_MaDanhMucCha)
-- VALUES 
-- (N'Nhẫn', 1),
-- (N'Dây chuyền', 1),
-- (N'Vòng tay', 1);

-- -- cấp 3
-- INSERT INTO G9_DanhMuc (G9_TenDanhMuc, G9_MaDanhMucCha)
-- VALUES 
-- (N'Nhẫn vàng', 2),
-- (N'Nhẫn bạc', 2);

-- INSERT INTO G9_SanPham
-- (G9_TenSanPham, G9_MaDanhMuc, G9_ChatLieu, G9_Gia, G9_SoLuongTon, G9_HinhAnhChinh, G9_MoTa)
-- VALUES
-- (N'Nhẫn vàng 18K', 5, N'Vàng 18K', 5000000, 10, 'nhan1.jpg', N'Nhẫn vàng cao cấp'),
-- (N'Nhẫn bạc 925', 6, N'Bạc 925', 1200000, 20, 'nhan2.jpg', N'Nhẫn bạc đẹp'),
-- (N'Dây chuyền vàng', 3, N'Vàng 24K', 7000000, 5, 'day1.jpg', N'Dây chuyền sang trọng');

-- INSERT INTO G9_HinhAnhSanPham (G9_MaSanPham, G9_DuongDan, G9_LaAnhChinh)
-- VALUES
-- (1, 'nhan1_1.jpg', 1),
-- (1, 'nhan1_2.jpg', 0),
-- (2, 'nhan2_1.jpg', 1);

-- INSERT INTO G9_GioHang (G9_MaNguoiDung)
-- VALUES (2), (3), (4);

-- INSERT INTO G9_ChiTietGioHang
-- (G9_MaGioHang, G9_MaSanPham, G9_SoLuong, G9_DonGia)
-- VALUES
-- (1, 1, 2, 5000000),
-- (1, 2, 1, 1200000),
-- (2, 3, 1, 7000000), 
-- (3, 1, 1, 5000000); 

-- INSERT INTO G9_DonHang
-- (G9_MaNguoiDung, G9_TenNguoiNhan, G9_SDTNhan, G9_DiaChiGiao, G9_TongTien)
-- VALUES
-- (2, N'Vũ Mai Chi', '0900000002', N'Hà Nội', 6200000),
-- (3, N'Phạm Tuấn Phong', '0900000003', N'Hải Phòng', 7000000),
-- (4, N'Nguyễn Ngọc Hiến', '0900000004', N'Đà Nẵng', 5000000);

-- INSERT INTO G9_ChiTietDonHang
-- (G9_MaDonHang, G9_MaSanPham, G9_SoLuong, G9_DonGia)
-- VALUES
-- (1, 1, 1, 5000000),
-- (1, 2, 1, 1200000),
-- (2, 3, 1, 7000000),
-- (3, 1, 1, 5000000);

-- INSERT INTO G9_ThanhToan
-- (G9_MaDonHang, G9_PhuongThuc, G9_SoTien)
-- VALUES
-- (1, N'COD', 6200000);

-- INSERT INTO G9_ThanhToan
-- (G9_MaDonHang, G9_PhuongThuc, G9_CongThanhToan, G9_MaGiaoDich, G9_SoTien, G9_TrangThai, G9_NgayThanhToan)
-- VALUES
-- (2, N'Online', N'VNPay', 'VNP123456', 7000000, N'Thành công', GETDATE());

-- INSERT INTO G9_ThanhToan
-- (G9_MaDonHang, G9_PhuongThuc, G9_SoTien)
-- VALUES
-- (3, N'COD', 5000000);

-- INSERT INTO G9_ThanhToan
-- (G9_MaDonHang, G9_PhuongThuc, G9_CongThanhToan, G9_MaGiaoDich, G9_SoTien, G9_TrangThai, G9_NgayThanhToan)
-- VALUES
-- (2, N'Online', N'VNPay', 'VNP123456', 7000000, N'Thành công', GETDATE());

-- INSERT INTO G9_KhuyenMai
-- (G9_MaCode, G9_GiaTriGiam, G9_NgayBatDau, G9_NgayKetThuc)
-- VALUES
-- ('SALE10', 100000, GETDATE(), DATEADD(DAY, 30, GETDATE())),
-- ('SALE20', 200000, GETDATE(), DATEADD(DAY, 15, GETDATE()));

-- INSERT INTO G9_DanhMuc_KhuyenMai
-- (G9_MaDanhMuc, G9_MaKhuyenMai)
-- VALUES
-- (1, 1),
-- (2, 2);

-- INSERT INTO G9_DanhGia
-- (G9_MaSanPham, G9_MaNguoiDung, G9_SoSao, G9_NoiDung)
-- VALUES
-- (1, 2, 5, N'Sản phẩm rất đẹp'), 
-- (2, 3, 4, N'Khá ổn trong tầm giá'), 
-- (3, 4, 5, N'Rất hài lòng'); 

-- INSERT INTO G9_GiaVang (G9_LoaiVang, G9_GiaMua, G9_GiaBan, G9_NgayCapNhat)
-- VALUES
-- (N'SJC', 78500000, 79500000, DATEADD(DAY, -2, GETDATE())),
-- (N'SJC', 79000000, 80000000, DATEADD(DAY, -1, GETDATE())),
-- (N'SJC', 79500000, 80500000, GETDATE()),

-- (N'Vàng 24K', 75000000, 76000000, DATEADD(DAY, -2, GETDATE())),
-- (N'Vàng 24K', 75500000, 76500000, DATEADD(DAY, -1, GETDATE())),
-- (N'Vàng 24K', 76000000, 77000000, GETDATE()),

-- (N'Vàng 18K', 55000000, 56000000, DATEADD(DAY, -2, GETDATE())),
-- (N'Vàng 18K', 55500000, 56500000, DATEADD(DAY, -1, GETDATE())),
-- (N'Vàng 18K', 56000000, 57000000, GETDATE());

-- INSERT INTO G9_DanhMucTinTuc (G9_TenDanhMuc)
-- VALUES
-- (N'Tin thị trường vàng'),
-- (N'Tin kinh tế'),
-- (N'Khuyến mãi');

-- INSERT INTO G9_TinTuc 
-- (G9_TieuDe, G9_MoTaNgan, G9_NoiDung, G9_HinhAnh, G9_MaNguoiDang, G9_MaDanhMuc)
-- VALUES
-- (
-- N'Giá vàng hôm nay tăng mạnh',
-- N'Giá vàng SJC tăng gần 1 triệu đồng/lượng',
-- N'Trong phiên giao dịch hôm nay, giá vàng SJC tiếp tục tăng mạnh do ảnh hưởng từ thị trường thế giới...',
-- 'vang1.jpg',
-- 1,
-- 1
-- ),
-- (
-- N'Xu hướng đầu tư vàng năm 2026',
-- N'Vàng tiếp tục là kênh đầu tư an toàn',
-- N'Các chuyên gia nhận định rằng vàng vẫn là lựa chọn hàng đầu trong bối cảnh kinh tế biến động...',
-- 'vang2.jpg',
-- 1,
-- 2
-- ),
-- (
-- N'Khuyến mãi giảm giá trang sức mùa hè',
-- N'Giảm đến 20% cho các sản phẩm vàng',
-- N'Nhằm kích cầu mua sắm, cửa hàng triển khai chương trình giảm giá lên đến 20%...',
-- 'km1.jpg',
-- 1,
-- 3
-- ),
-- (
-- N'Giá vàng thế giới biến động nhẹ',
-- N'Ảnh hưởng từ FED khiến giá vàng dao động',
-- N'Giá vàng thế giới có xu hướng điều chỉnh nhẹ do các chính sách tiền tệ từ Mỹ...',
-- 'vang3.jpg',
-- 1,
-- 1
-- );