CREATE DATABASE G9_TrangSucDB;
GO

USE G9_TrangSucDB;
GO

CREATE TABLE G9_VaiTro (
    G9_MaVaiTro INT IDENTITY PRIMARY KEY,
    G9_TenVaiTro NVARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE G9_NguoiDung (
    G9_MaNguoiDung INT IDENTITY PRIMARY KEY,
    G9_HoTen NVARCHAR(150) NOT NULL,
    G9_TenDangNhap VARCHAR(50) UNIQUE NOT NULL,
    G9_MatKhau VARCHAR(255) NOT NULL,
    G9_Email VARCHAR(100) UNIQUE,
    G9_SoDienThoai VARCHAR(15),
    G9_Avatar NVARCHAR(255),
    G9_MaVaiTro INT NOT NULL,
    G9_TrangThai NVARCHAR(30) DEFAULT N'Hoạt động',
    G9_NgayTao DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (G9_MaVaiTro) REFERENCES G9_VaiTro(G9_MaVaiTro)
);

CREATE TABLE G9_DanhMuc (
    G9_MaDanhMuc INT IDENTITY PRIMARY KEY,
    G9_TenDanhMuc NVARCHAR(100) NOT NULL,
    G9_MoTa NVARCHAR(255) NULL,
    G9_MaDanhMucCha INT NULL,
    G9_TrangThai NVARCHAR(30) DEFAULT N'Hoạt động',

    CONSTRAINT FK_G9_DanhMuc_Cha
        FOREIGN KEY (G9_MaDanhMucCha)
        REFERENCES G9_DanhMuc(G9_MaDanhMuc)
);
--NULL → danh mục cha (cấp 1)
-- Có giá trị → danh mục con 

CREATE TABLE G9_SanPham (
    G9_MaSanPham INT IDENTITY PRIMARY KEY,
    G9_TenSanPham NVARCHAR(200) NOT NULL,
    G9_MaDanhMuc INT NOT NULL,
    G9_ChatLieu NVARCHAR(100),
    G9_Gia DECIMAL(18,2) NOT NULL,
    G9_SoLuongTon INT DEFAULT 0,
    G9_HinhAnhChinh NVARCHAR(255),
    G9_MoTa NVARCHAR(MAX),
    G9_TrangThai NVARCHAR(30) DEFAULT N'Còn hàng',
    G9_NgayTao DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (G9_MaDanhMuc) REFERENCES G9_DanhMuc(G9_MaDanhMuc)
);

CREATE TABLE G9_HinhAnhSanPham (
    G9_MaHinh INT IDENTITY PRIMARY KEY,
    G9_MaSanPham INT NOT NULL,
    G9_DuongDan NVARCHAR(255),
    G9_LaAnhChinh BIT DEFAULT 0,

    FOREIGN KEY (G9_MaSanPham) REFERENCES G9_SanPham(G9_MaSanPham)
    ON DELETE CASCADE
);

CREATE TABLE G9_GioHang (
    G9_MaGioHang INT IDENTITY PRIMARY KEY,
    G9_MaNguoiDung INT NOT NULL,
    G9_NgayTao DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (G9_MaNguoiDung) REFERENCES G9_NguoiDung(G9_MaNguoiDung)
);

CREATE TABLE G9_ChiTietGioHang (
    G9_MaChiTiet INT IDENTITY PRIMARY KEY,
    G9_MaGioHang INT NOT NULL,
    G9_MaSanPham INT NOT NULL,
    G9_SoLuong INT CHECK (G9_SoLuong > 0),
    G9_DonGia DECIMAL(18,2),

    FOREIGN KEY (G9_MaGioHang) REFERENCES G9_GioHang(G9_MaGioHang) ON DELETE CASCADE,
    FOREIGN KEY (G9_MaSanPham) REFERENCES G9_SanPham(G9_MaSanPham)
);

CREATE TABLE G9_DonHang (
    G9_MaDonHang INT IDENTITY PRIMARY KEY,
    G9_MaNguoiDung INT NOT NULL,
    G9_TenNguoiNhan NVARCHAR(150),
    G9_SDTNhan VARCHAR(15),
    G9_DiaChiGiao NVARCHAR(255),
    G9_TongTien DECIMAL(18,2),
    G9_TrangThai NVARCHAR(30) DEFAULT N'Chờ xác nhận',
    G9_NgayDat DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (G9_MaNguoiDung) REFERENCES G9_NguoiDung(G9_MaNguoiDung)
);

CREATE TABLE G9_ChiTietDonHang (
    G9_MaChiTiet INT IDENTITY PRIMARY KEY,
    G9_MaDonHang INT NOT NULL,
    G9_MaSanPham INT NOT NULL,
    G9_SoLuong INT CHECK (G9_SoLuong > 0),
    G9_DonGia DECIMAL(18,2),
    G9_ThanhTien AS (G9_SoLuong * G9_DonGia),

    FOREIGN KEY (G9_MaDonHang) REFERENCES G9_DonHang(G9_MaDonHang) ON DELETE CASCADE,
    FOREIGN KEY (G9_MaSanPham) REFERENCES G9_SanPham(G9_MaSanPham)
);

CREATE TABLE G9_LichSuTrangThaiDonHang (
    G9_ID INT IDENTITY PRIMARY KEY,
    G9_MaDonHang INT,
    G9_TrangThai NVARCHAR(50),
    G9_ThoiGian DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (G9_MaDonHang) REFERENCES G9_DonHang(G9_MaDonHang)
);

CREATE TABLE G9_ThanhToan (
    G9_MaThanhToan INT IDENTITY PRIMARY KEY,
    G9_MaDonHang INT NOT NULL,
    G9_PhuongThuc NVARCHAR(50) NOT NULL,
    G9_CongThanhToan NVARCHAR(50) NULL, 
    G9_MaGiaoDich VARCHAR(100) NULL,
    G9_SoTien DECIMAL(18,2) NOT NULL,
    G9_TrangThai NVARCHAR(30) DEFAULT N'Chưa thanh toán',
    G9_NgayThanhToan DATETIME NULL,
    G9_NgayTao DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_G9_ThanhToan_DonHang
        FOREIGN KEY (G9_MaDonHang)
        REFERENCES G9_DonHang(G9_MaDonHang)
);

CREATE TABLE G9_KhuyenMai (
    G9_MaKhuyenMai INT IDENTITY PRIMARY KEY,
    G9_MaCode VARCHAR(50) UNIQUE,
    G9_GiaTriGiam DECIMAL(18,2),
    G9_NgayBatDau DATETIME,
    G9_NgayKetThuc DATETIME,
    G9_TrangThai NVARCHAR(30) DEFAULT N'Hoạt động'
);

CREATE TABLE G9_DanhMuc_KhuyenMai (
    G9_ID INT IDENTITY PRIMARY KEY,
    G9_MaDanhMuc INT NOT NULL,
    G9_MaKhuyenMai INT NOT NULL,

    CONSTRAINT FK_G9_DMKM_DanhMuc
        FOREIGN KEY (G9_MaDanhMuc) REFERENCES G9_DanhMuc(G9_MaDanhMuc)
        ON DELETE CASCADE,

    CONSTRAINT FK_G9_DMKM_KhuyenMai
        FOREIGN KEY (G9_MaKhuyenMai) REFERENCES G9_KhuyenMai(G9_MaKhuyenMai)
        ON DELETE CASCADE
);

CREATE TABLE G9_DanhGia (
    G9_MaDanhGia INT IDENTITY PRIMARY KEY,
    G9_MaSanPham INT,
    G9_MaNguoiDung INT,
    G9_SoSao INT CHECK (G9_SoSao BETWEEN 1 AND 5),
    G9_NoiDung NVARCHAR(500),
    G9_TrangThai NVARCHAR(30) DEFAULT N'Hiển thị',
    G9_NgayDanhGia DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (G9_MaSanPham) REFERENCES G9_SanPham(G9_MaSanPham) ON DELETE CASCADE,
    FOREIGN KEY (G9_MaNguoiDung) REFERENCES G9_NguoiDung(G9_MaNguoiDung)
);

CREATE TABLE G9_GiaVang (
    G9_MaGiaVang INT IDENTITY PRIMARY KEY,
    G9_LoaiVang NVARCHAR(50), -- VD: SJC, 18K, 24K
    G9_GiaMua DECIMAL(18,2),
    G9_GiaBan DECIMAL(18,2),
    G9_NgayCapNhat DATETIME DEFAULT GETDATE()
);

CREATE TABLE G9_TinTuc (
    G9_MaTinTuc INT IDENTITY PRIMARY KEY,
    G9_TieuDe NVARCHAR(255) NOT NULL,
    G9_MoTaNgan NVARCHAR(500),
    G9_NoiDung NVARCHAR(MAX),
    G9_HinhAnh NVARCHAR(255),
    G9_MaNguoiDang INT,
    G9_NgayDang DATETIME DEFAULT GETDATE(),
    G9_TrangThai NVARCHAR(30) DEFAULT N'Hiển thị',

    FOREIGN KEY (G9_MaNguoiDang) REFERENCES G9_NguoiDung(G9_MaNguoiDung)
);

CREATE TABLE G9_DanhMucTinTuc (
    G9_MaDanhMuc INT IDENTITY PRIMARY KEY,
    G9_TenDanhMuc NVARCHAR(100)
);

ALTER TABLE G9_TinTuc
ADD G9_MaDanhMuc INT;

ALTER TABLE G9_TinTuc
ADD CONSTRAINT FK_TinTuc_DanhMuc
FOREIGN KEY (G9_MaDanhMuc)
REFERENCES G9_DanhMucTinTuc(G9_MaDanhMuc);

CREATE INDEX IX_G9_SanPham_Ten ON G9_SanPham(G9_TenSanPham);
CREATE INDEX IX_G9_DonHang_User ON G9_DonHang(G9_MaNguoiDung);
CREATE INDEX IX_G9_GioHang_User ON G9_GioHang(G9_MaNguoiDung);
CREATE INDEX IX_G9_DanhMuc_Cha 
ON G9_DanhMuc(G9_MaDanhMucCha);
CREATE INDEX IX_G9_ThanhToan_DonHang
ON G9_ThanhToan(G9_MaDonHang);

INSERT INTO G9_VaiTro (G9_TenVaiTro)
VALUES 
(N'Admin'),
(N'Nhân viên'),
(N'Khách hàng');

INSERT INTO G9_NguoiDung 
(G9_HoTen, G9_TenDangNhap, G9_MatKhau, G9_Email, G9_SoDienThoai, G9_MaVaiTro)
VALUES
(N'Bùi Đức Huy', 'admin', '123456', 'admin@gmail.com', '0900000001', 1), -- Admin
(N'Vũ Mai Chi', 'user1', '123456', 'chi@gmail.com', '0900000002', 3),
(N'Phạm Tuấn Phong', 'user2', '123456', 'phong@gmail.com', '0900000003', 3),
(N'Nguyễn Ngọc Hiến', 'user3', '123456', 'hien@gmail.com', '0900000004', 3),
(N'Công An Hà Nội','conganhn','123456','congan@gmail.com','113',3);

-- cha
INSERT INTO G9_DanhMuc (G9_TenDanhMuc)
VALUES (N'Trang sức'),
(N'Vàng');

-- con
INSERT INTO G9_DanhMuc (G9_TenDanhMuc, G9_MaDanhMucCha)
VALUES 
(N'Nhẫn', 1),
(N'Dây chuyền', 1),
(N'Vòng tay', 1);

-- cấp 3
INSERT INTO G9_DanhMuc (G9_TenDanhMuc, G9_MaDanhMucCha)
VALUES 
(N'Nhẫn vàng', 2),
(N'Nhẫn bạc', 2);

INSERT INTO G9_DanhMuc (G9_TenDanhMuc, G9_MoTa, G9_MaDanhMucCha)
VALUES (N'Bông tai', N'Các mẫu bông tai thời trang', 1);

INSERT INTO G9_SanPham
(G9_TenSanPham, G9_MaDanhMuc, G9_ChatLieu, G9_Gia, G9_SoLuongTon, G9_HinhAnhChinh, G9_MoTa)
VALUES
(N'Bông tai bạc đính đá xanh', 8, N'Bạc 925', 850000, 15, 'Bong_tai1.jpg', N'Bông tai bạc dáng dài đính đá xanh, phù hợp đi tiệc và sự kiện.'),
(N'Bông tai bạc tròn tinh giản', 8, N'Bạc 925', 650000, 20, 'Bong_tai2.jpg', N'Mẫu bông tai tròn nhỏ, thiết kế tối giản dễ phối đồ.'),
(N'Bông tai bạc đính đá xanh ngọc', 8, N'Bạc 925', 900000, 12, 'Bong_tai3.jpg', N'Bông tai sang trọng với tông xanh nổi bật.'),
(N'Bông tai hoa bạc đính đá', 8, N'Bạc 925', 780000, 18, 'Bong_tai4.jpg', N'Thiết kế hoa tuyết lấp lánh, trẻ trung và nữ tính.'),
(N'Bông tai đen sang trọng', 8, N'Hợp kim mạ bạc', 700000, 16, 'Bong_tai5.jpg', N'Bông tai vòng lớn, phối đá đen nổi bật.'),
(N'Bông tai ngọc trai dáng dài', 8, N'Bạc 925', 980000, 10, 'Bong_tai6.jpg', N'Bông tai ngọc trai thả dài, tinh tế và thanh lịch.'),
(N'Bông tai bạc hiện đại', 8, N'Bạc 925', 820000, 14, 'Bong_tai7.jpg', N'Mẫu bông tai phong cách hiện đại, dễ dùng hằng ngày.'),
(N'Bông tai ngọc trai tròn', 8, N'Bạc 925', 880000, 12, 'Bong_tai_ngoc_trai.jpg', N'Bông tai ngọc trai tròn cổ điển, phù hợp nhiều độ tuổi.'),
(N'Dây chuyền bạc giọt nước', 4, N'Bạc 925', 1250000, 20, 'Day_chuyen_bac.jpg', N'Mặt dây chuyền giọt nước đính đá, thiết kế thanh lịch.'),
(N'Dây chuyền bạc cành lá', 4, N'Bạc 925', 2200000, 15, 'Day_chuyen_bac1.jpg', N'Dây chuyền đính đá dạng cành lá, nổi bật và sang trọng.'),
(N'Dây chuyền bạc nơ treo đá', 4, N'Bạc 925', 1150000, 18, 'Day_chuyen_bac2.jpg', N'Mặt nơ nhỏ kèm đá treo, nhẹ nhàng và nữ tính.'),
(N'Dây chuyền bạc viên đá xanh', 4, N'Bạc 925', 1450000, 16, 'Day_chuyen_bac3.jpg', N'Mặt dây chuyền đính đá xanh, tạo điểm nhấn tinh tế.'),
(N'Dây chuyền bạc hoa xanh', 4, N'Bạc 925', 1600000, 12, 'Day_chuyen_bac4.jpg', N'Thiết kế hoa xanh nổi bật, phù hợp làm quà tặng.'),
(N'Dây chuyền bạc hoa tròn', 4, N'Bạc 925', 1550000, 14, 'Day_chuyen_bac5.jpg', N'Mặt dây chuyền tròn đính đá, ánh sáng đẹp.'),
(N'Dây chuyền bạc sao xanh', 4, N'Bạc 925', 1480000, 13, 'Day_chuyen_bac6.jpg', N'Mẫu mặt sao xanh cá tính, hợp phong cách trẻ.'),
(N'Dây chuyền bạc ngọc trai', 4, N'Bạc 925', 1300000, 17, 'Day_chuyen_bac7.jpg', N'Mặt ngọc trai thanh lịch, dễ phối với váy áo.'),
(N'Dây chuyền bạc bông hoa PNJ', 4, N'Bạc 925', 1650000, 11, 'Day_chuyen_bac8.jpg', N'Thiết kế bông hoa đính đá sang trọng, tinh xảo.'),
(N'Dây chuyền vàng opal', 4, N'Vàng 18K', 7800000, 8, 'Day_chuyen_vang1.jpg', N'Mặt opal nhẹ nhàng, phù hợp phong cách nữ tính.'),
(N'Dây chuyền vàng lá', 4, N'Vàng 18K', 6800000, 8, 'Day_chuyen_vang2.jpg', N'Mặt dây chuyền dáng lá tinh tế, hiện đại.'),
(N'Dây chuyền vàng hoa nhỏ', 4, N'Vàng 18K', 6500000, 10, 'Day_chuyen_vang3.jpg', N'Thiết kế hoa nhỏ sang trọng, hợp làm quà.'),
(N'Dây chuyền vàng nhiều tầng', 4, N'Vàng 18K', 9200000, 6, 'Day_chuyen_vang4.jpg', N'Mẫu dây chuyền nhiều tầng lộng lẫy, nổi bật.'),
(N'Dây chuyền vàng cánh hoa đỏ', 4, N'Vàng 18K', 5400000, 9, 'Day_chuyen_vang5.jpg', N'Mặt cánh hoa nhỏ đính điểm nhấn đỏ độc đáo.'),
(N'Dây chuyền vàng oval xanh', 4, N'Vàng 18K', 4300000, 10, 'Day_chuyen_vang6.jpg', N'Mặt oval xanh, thiết kế thanh lịch tối giản.'),
(N'Dây chuyền vàng trái tim đỏ', 4, N'Vàng 18K', 5100000, 7, 'Day_chuyen_vang7.jpg', N'Mặt trái tim đỏ nữ tính, thích hợp quà tặng.'),
(N'Dây chuyền vàng tim nhỏ', 4, N'Vàng 18K', 4700000, 7, 'Day_chuyen_vang9.jpg', N'Mặt tim nhỏ xinh, dễ đeo hằng ngày.'),
(N'Dây chuyền vàng giọt đá', 4, N'Vàng 18K', 7300000, 6, 'Day_chuyen_vang10.jpg', N'Mặt giọt đá thanh mảnh, phù hợp sự kiện.'),
(N'Lắc tay bạc đặc biệt', 5, N'Bạc 925', 1900000, 10, 'Lac_bac_dac_biet.jpg', N'Lắc tay bạc thiết kế tinh xảo, tạo cảm giác sang trọng.'),
(N'Vòng cổ bạc đá xanh', 5, N'Bạc 925', 1750000, 12, 'Vong_co.jpg', N'Mẫu vòng cổ đá xanh nổi bật, trẻ trung.'),
(N'Vòng tay bạc đá turquoise', 5, N'Bạc 925', 2100000, 11, 'Vong_tay_bac.jpg', N'Vòng tay bạc với viên đá trung tâm ấn tượng.'),
(N'Vòng tay bạc đính đá thanh lịch', 5, N'Bạc 925', 2300000, 9, 'Vong_tay_bac2.jpg', N'Thiết kế vòng tay mảnh, đính đá tinh tế.'),
(N'Vòng tay bạc đá xanh đen', 5, N'Bạc 925', 1850000, 13, 'Vong_tay_bac3.jpg', N'Vòng tay bạc kết hợp đá xanh đen sang trọng.'),
(N'Vòng tay ngọc trai hồng', 5, N'Bạc 925', 1600000, 14, 'Vong_tay_ngoc_trai_hong..jpg', N'Vòng tay ngọc trai hồng nhẹ nhàng, nữ tính.'),
(N'Vòng tay vàng charm 1', 5, N'Vàng 18K', 3500000, 8, 'Vong_tay_vang1.jpg', N'Vòng tay vàng dạng charm phù hợp phong cách trẻ.'),
(N'Vòng tay vàng hộp quà', 5, N'Vàng 18K', 3200000, 8, 'Vong_tay_vang2.jpg', N'Mẫu vòng tay vàng nổi bật, thích hợp làm quà tặng.'),
(N'Vòng tay vàng mặt treo', 5, N'Vàng 18K', 2800000, 10, 'Vong_tay_vang3.jpg', N'Vòng tay vàng mặt treo nhỏ, tạo điểm nhấn nhẹ nhàng.'),
(N'Nhẫn hồng ngọc', 6, N'Vàng 18K', 9500000, 5, 'nhan_hong_ngoc.jpg', N'Nhẫn mặt đá đỏ sang trọng, nổi bật và quý phái.'),
(N'Nhẫn kim cương 1', 7, N'Kim cương', 6500000, 6, 'Nhan_KC.jpg', N'Nhẫn đính đá sáng, kiểu dáng tinh xảo.'),
(N'Nhẫn kim cương 2', 7, N'Kim cương', 7200000, 6, 'Nhan_KC1.jpg', N'Nhẫn thiết kế uốn lượn, đính đá lấp lánh.'),
(N'Nhẫn kim cương 3', 7, N'Kim cương', 6800000, 6, 'Nhan_KC10.jpg', N'Mẫu nhẫn cao cấp, form lớn nổi bật.'),
(N'Nhẫn kim cương 4', 7, N'Kim cương', 7600000, 5, 'Nhan_KC2.jpg', N'Nhẫn đính đá lớn, phù hợp dự tiệc.'),
(N'Nhẫn kim cương 5', 7, N'Kim cương', 8200000, 5, 'Nhan_KC3.jpg', N'Thiết kế cổ điển với điểm nhấn đá sáng.'),
(N'Nhẫn kim cương 6', 7, N'Kim cương', 5400000, 7, 'Nhan_KC4.jpg', N'Nhẫn hộp quà sang trọng, thích hợp làm quà.'),
(N'Nhẫn kim cương 7', 7, N'Kim cương', 6900000, 5, 'Nhan_KC5.jpg', N'Mẫu nhẫn dáng vương miện, thanh lịch.'),
(N'Nhẫn kim cương 8', 7, N'Kim cương', 7300000, 5, 'Nhan_KC6.jpg', N'Nhẫn đính đá lớn, ánh sáng bắt mắt.'),
(N'Nhẫn kim cương 9', 7, N'Kim cương', 6100000, 5, 'Nhan_KC7.jpg', N'Nhẫn họa tiết tròn, sang trọng và bền đẹp.'),
(N'Nhẫn kim cương 10', 7, N'Kim cương', 8800000, 4, 'Nhan_KC8.jpg', N'Mẫu nhẫn đắt giá với đường nét mềm mại.'),
(N'Nhẫn kim cương mặt tròn', 7, N'Kim cương', 5900000, 6, 'Nhan_KC9.jpg', N'Nhẫn mặt tròn đính đá, dễ phối với nhiều trang phục.'),
(N'Nhẫn ngọc trai', 7, N'Bạc 925', 5500000, 6, 'Nhan_ngoc_trai.jpg', N'Nhẫn ngọc trai đen tạo cảm giác sang trọng.'),
(N'Nhẫn vàng trơn', 6, N'Vàng 18K', 6200000, 7, 'Nhan_vang.jpg', N'Nhẫn vàng trơn bản nhỏ, đơn giản và tinh tế.'),
(N'Nhẫn vàng đôi', 6, N'Vàng 18K', 6100000, 7, 'Nhan_vang2.jpg', N'Mẫu nhẫn vàng đôi dễ đeo hằng ngày.'),
(N'Nhẫn vàng đính kim cương', 6, N'Vàng 18K', 7800000, 4, 'Nhan_vang_dinh_kc.jpg', N'Nhẫn vàng đính đá, phù hợp làm quà tặng.'),
(N'Nhẫn vàng đính kim cương 2', 6, N'Vàng 18K', 7400000, 4, 'Nhan_vang_dinh_kc2.jpg', N'Thiết kế đôi nhẫn vàng, ánh kim nổi bật.'),
(N'Nhẫn vàng đính kim cương 3', 6, N'Vàng 18K', 8900000, 3, 'Nhan_vang_dinh_kc3.jpg', N'Nhẫn vàng đính đá đa sắc, sang trọng và bắt mắt.');

INSERT INTO G9_HinhAnhSanPham (G9_MaSanPham, G9_DuongDan, G9_LaAnhChinh)
VALUES
(1, 'nhan1_1.jpg', 1),
(1, 'nhan1_2.jpg', 0),
(2, 'nhan2_1.jpg', 1),
(4, 'Bong_tai1.jpg', 1),
(5, 'Bong_tai2.jpg', 1),
(6, 'Bong_tai3.jpg', 1),
(7, 'Bong_tai4.jpg', 1),
(8, 'Bong_tai5.jpg', 1),
(9, 'Bong_tai6.jpg', 1),
(10, 'Bong_tai7.jpg', 1),
(11, 'Bong_tai_ngoc_trai.jpg', 1),
(12, 'Day_chuyen_bac.jpg', 1),
(13, 'Day_chuyen_bac1.jpg', 1),
(14, 'Day_chuyen_bac2.jpg', 1),
(15, 'Day_chuyen_bac3.jpg', 1),
(16, 'Day_chuyen_bac4.jpg', 1),
(17, 'Day_chuyen_bac5.jpg', 1),
(18, 'Day_chuyen_bac6.jpg', 1),
(19, 'Day_chuyen_bac7.jpg', 1),
(20, 'Day_chuyen_bac8.jpg', 1),
(21, 'Day_chuyen_vang1.jpg', 1),
(22, 'Day_chuyen_vang2.jpg', 1),
(23, 'Day_chuyen_vang3.jpg', 1),
(24, 'Day_chuyen_vang4.jpg', 1),
(25, 'Day_chuyen_vang5.jpg', 1),
(26, 'Day_chuyen_vang6.jpg', 1),
(27, 'Day_chuyen_vang7.jpg', 1),
(28, 'Day_chuyen_vang9.jpg', 1),
(29, 'Day_chuyen_vang10.jpg', 1),
(30, 'Lac_bac_dac_biet.jpg', 1),
(31, 'Vong_co.jpg', 1),
(32, 'Vong_tay_bac.jpg', 1),
(33, 'Vong_tay_bac2.jpg', 1),
(34, 'Vong_tay_bac3.jpg', 1),
(35, 'Vong_tay_ngoc_trai_hong..jpg', 1),
(36, 'Vong_tay_vang1.jpg', 1),
(37, 'Vong_tay_vang2.jpg', 1),
(38, 'Vong_tay_vang3.jpg', 1),
(39, 'nhan_hong_ngoc.jpg', 1),
(40, 'Nhan_KC.jpg', 1),
(41, 'Nhan_KC1.jpg', 1),
(42, 'Nhan_KC10.jpg', 1),
(43, 'Nhan_KC2.jpg', 1),
(44, 'Nhan_KC3.jpg', 1),
(45, 'Nhan_KC4.jpg', 1),
(46, 'Nhan_KC5.jpg', 1),
(47, 'Nhan_KC6.jpg', 1),
(48, 'Nhan_KC7.jpg', 1),
(49, 'Nhan_KC8.jpg', 1),
(50, 'Nhan_KC9.jpg', 1),
(51, 'Nhan_ngoc_trai.jpg', 1),
(52, 'Nhan_vang.jpg', 1),
(53, 'Nhan_vang2.jpg', 1),
(54, 'Nhan_vang_dinh_kc.jpg', 1),
(55, 'Nhan_vang_dinh_kc2.jpg', 1),
(56, 'Nhan_vang_dinh_kc3.jpg', 1);

INSERT INTO G9_GioHang (G9_MaNguoiDung)
VALUES (2), (3), (4);

INSERT INTO G9_ChiTietGioHang
(G9_MaGioHang, G9_MaSanPham, G9_SoLuong, G9_DonGia)
VALUES
(1, 1, 2, 5000000),
(1, 2, 1, 1200000),
(2, 3, 1, 7000000), 
(3, 1, 1, 5000000); 

INSERT INTO G9_DonHang
(G9_MaNguoiDung, G9_TenNguoiNhan, G9_SDTNhan, G9_DiaChiGiao, G9_TongTien)
VALUES
(2, N'Vũ Mai Chi', '0900000002', N'Hà Nội', 6200000),
(3, N'Phạm Tuấn Phong', '0900000003', N'Hải Phòng', 7000000),
(4, N'Nguyễn Ngọc Hiến', '0900000004', N'Đà Nẵng', 5000000);

INSERT INTO G9_ChiTietDonHang
(G9_MaDonHang, G9_MaSanPham, G9_SoLuong, G9_DonGia)
VALUES
(1, 1, 1, 5000000),
(1, 2, 1, 1200000),
(2, 3, 1, 7000000),
(3, 1, 1, 5000000);

INSERT INTO G9_ThanhToan
(G9_MaDonHang, G9_PhuongThuc, G9_SoTien)
VALUES
(1, N'COD', 6200000);

INSERT INTO G9_ThanhToan
(G9_MaDonHang, G9_PhuongThuc, G9_CongThanhToan, G9_MaGiaoDich, G9_SoTien, G9_TrangThai, G9_NgayThanhToan)
VALUES
(2, N'Online', N'VNPay', 'VNP123456', 7000000, N'Thành công', GETDATE());

INSERT INTO G9_ThanhToan
(G9_MaDonHang, G9_PhuongThuc, G9_SoTien)
VALUES
(3, N'COD', 5000000);

INSERT INTO G9_ThanhToan
(G9_MaDonHang, G9_PhuongThuc, G9_CongThanhToan, G9_MaGiaoDich, G9_SoTien, G9_TrangThai, G9_NgayThanhToan)
VALUES
(2, N'Online', N'VNPay', 'VNP123456', 7000000, N'Thành công', GETDATE());

INSERT INTO G9_KhuyenMai
(G9_MaCode, G9_GiaTriGiam, G9_NgayBatDau, G9_NgayKetThuc)
VALUES
('SALE10', 100000, GETDATE(), DATEADD(DAY, 30, GETDATE())),
('SALE20', 200000, GETDATE(), DATEADD(DAY, 15, GETDATE()));

INSERT INTO G9_DanhMuc_KhuyenMai
(G9_MaDanhMuc, G9_MaKhuyenMai)
VALUES
(1, 1),
(2, 2);

INSERT INTO G9_DanhGia
(G9_MaSanPham, G9_MaNguoiDung, G9_SoSao, G9_NoiDung)
VALUES
(1, 2, 5, N'Sản phẩm rất đẹp'), 
(2, 3, 4, N'Khá ổn trong tầm giá'), 
(3, 4, 5, N'Rất hài lòng'); 

INSERT INTO G9_GiaVang (G9_LoaiVang, G9_GiaMua, G9_GiaBan, G9_NgayCapNhat)
VALUES
(N'SJC', 78500000, 79500000, DATEADD(DAY, -2, GETDATE())),
(N'SJC', 79000000, 80000000, DATEADD(DAY, -1, GETDATE())),
(N'SJC', 79500000, 80500000, GETDATE()),

(N'Vàng 24K', 75000000, 76000000, DATEADD(DAY, -2, GETDATE())),
(N'Vàng 24K', 75500000, 76500000, DATEADD(DAY, -1, GETDATE())),
(N'Vàng 24K', 76000000, 77000000, GETDATE()),

(N'Vàng 18K', 55000000, 56000000, DATEADD(DAY, -2, GETDATE())),
(N'Vàng 18K', 55500000, 56500000, DATEADD(DAY, -1, GETDATE())),
(N'Vàng 18K', 56000000, 57000000, GETDATE());

INSERT INTO G9_DanhMucTinTuc (G9_TenDanhMuc)
VALUES
(N'Tin thị trường vàng'),
(N'Tin kinh tế'),
(N'Khuyến mãi');

INSERT INTO G9_TinTuc 
(G9_TieuDe, G9_MoTaNgan, G9_NoiDung, G9_HinhAnh, G9_MaNguoiDang, G9_MaDanhMuc)
VALUES
(
N'Giá vàng hôm nay tăng mạnh',
N'Giá vàng SJC tăng gần 1 triệu đồng/lượng',
N'Trong phiên giao dịch hôm nay, giá vàng SJC tiếp tục tăng mạnh do ảnh hưởng từ thị trường thế giới...',
'vang1.jpg',
1,
1
),
(
N'Xu hướng đầu tư vàng năm 2026',
N'Vàng tiếp tục là kênh đầu tư an toàn',
N'Các chuyên gia nhận định rằng vàng vẫn là lựa chọn hàng đầu trong bối cảnh kinh tế biến động...',
'vang2.jpg',
1,
2
),
(
N'Khuyến mãi giảm giá trang sức mùa hè',
N'Giảm đến 20% cho các sản phẩm vàng',
N'Nhằm kích cầu mua sắm, cửa hàng triển khai chương trình giảm giá lên đến 20%...',
'km1.jpg',
1,
3
),
(
N'Giá vàng thế giới biến động nhẹ',
N'Ảnh hưởng từ FED khiến giá vàng dao động',
N'Giá vàng thế giới có xu hướng điều chỉnh nhẹ do các chính sách tiền tệ từ Mỹ...',
'vang3.jpg',
1,
1
);

IF NOT EXISTS (SELECT 1 FROM G9_TinTuc WHERE G9_TieuDe = N'Giá vàng hôm nay biến động mạnh')
BEGIN
    INSERT INTO G9_TinTuc
    (G9_TieuDe, G9_MoTaNgan, G9_NoiDung, G9_HinhAnh, G9_MaNguoiDang, G9_MaDanhMuc)
    VALUES
    (N'Giá vàng hôm nay biến động mạnh', N'Giá vàng trong nước tăng giảm theo diễn biến thị trường quốc tế.', N'Nội dung minh họa cho bài viết 1. Hình ảnh được lấy từ bộ ảnh tin tức đã tải lên, phù hợp hiển thị trên trang tin tức của website.', 'Tin_tuc1.jpg', 1, 1);
END;

IF NOT EXISTS (SELECT 1 FROM G9_TinTuc WHERE G9_TieuDe = N'Xu hướng đầu tư vàng an toàn')
BEGIN
    INSERT INTO G9_TinTuc
    (G9_TieuDe, G9_MoTaNgan, G9_NoiDung, G9_HinhAnh, G9_MaNguoiDang, G9_MaDanhMuc)
    VALUES
    (N'Xu hướng đầu tư vàng an toàn', N'Vàng tiếp tục là kênh tích lũy được nhiều người quan tâm.', N'Nội dung minh họa cho bài viết 2. Hình ảnh được lấy từ bộ ảnh tin tức đã tải lên, phù hợp hiển thị trên trang tin tức của website.', 'Tin_tuc2.jpg', 1, 1);
END;

IF NOT EXISTS (SELECT 1 FROM G9_TinTuc WHERE G9_TieuDe = N'Khuyến mãi trang sức cuối mùa')
BEGIN
    INSERT INTO G9_TinTuc
    (G9_TieuDe, G9_MoTaNgan, G9_NoiDung, G9_HinhAnh, G9_MaNguoiDang, G9_MaDanhMuc)
    VALUES
    (N'Khuyến mãi trang sức cuối mùa', N'Nhiều mẫu trang sức được giảm giá hấp dẫn trong đợt khuyến mãi.', N'Nội dung minh họa cho bài viết 3. Hình ảnh được lấy từ bộ ảnh tin tức đã tải lên, phù hợp hiển thị trên trang tin tức của website.', 'Tin_tuc3.jpg', 1, 3);
END;

IF NOT EXISTS (SELECT 1 FROM G9_TinTuc WHERE G9_TieuDe = N'Thị trường vàng miếng sôi động')
BEGIN
    INSERT INTO G9_TinTuc
    (G9_TieuDe, G9_MoTaNgan, G9_NoiDung, G9_HinhAnh, G9_MaNguoiDang, G9_MaDanhMuc)
    VALUES
    (N'Thị trường vàng miếng sôi động', N'Lượng giao dịch vàng miếng tăng lên trong những phiên gần đây.', N'Nội dung minh họa cho bài viết 4. Hình ảnh được lấy từ bộ ảnh tin tức đã tải lên, phù hợp hiển thị trên trang tin tức của website.', 'Tin_tuc4.jpg', 1, 1);
END;

IF NOT EXISTS (SELECT 1 FROM G9_TinTuc WHERE G9_TieuDe = N'Trang sức cưới được săn đón')
BEGIN
    INSERT INTO G9_TinTuc
    (G9_TieuDe, G9_MoTaNgan, G9_NoiDung, G9_HinhAnh, G9_MaNguoiDang, G9_MaDanhMuc)
    VALUES
    (N'Trang sức cưới được săn đón', N'Các bộ sưu tập trang sức cưới đang được khách hàng quan tâm.', N'Nội dung minh họa cho bài viết 5. Hình ảnh được lấy từ bộ ảnh tin tức đã tải lên, phù hợp hiển thị trên trang tin tức của website.', 'Tin_tuc5.jpg', 1, 2);
END;

IF NOT EXISTS (SELECT 1 FROM G9_TinTuc WHERE G9_TieuDe = N'Bí quyết chọn nhẫn phù hợp')
BEGIN
    INSERT INTO G9_TinTuc
    (G9_TieuDe, G9_MoTaNgan, G9_NoiDung, G9_HinhAnh, G9_MaNguoiDang, G9_MaDanhMuc)
    VALUES
    (N'Bí quyết chọn nhẫn phù hợp', N'Chọn nhẫn theo dáng tay và phong cách giúp tôn vẻ đẹp tổng thể.', N'Nội dung minh họa cho bài viết 6. Hình ảnh được lấy từ bộ ảnh tin tức đã tải lên, phù hợp hiển thị trên trang tin tức của website.', 'Tin_tuc6.jpg', 1, 2);
END;

IF NOT EXISTS (SELECT 1 FROM G9_TinTuc WHERE G9_TieuDe = N'Giá vàng thế giới dao động')
BEGIN
    INSERT INTO G9_TinTuc
    (G9_TieuDe, G9_MoTaNgan, G9_NoiDung, G9_HinhAnh, G9_MaNguoiDang, G9_MaDanhMuc)
    VALUES
    (N'Giá vàng thế giới dao động', N'Ảnh hưởng từ chính sách tiền tệ khiến giá vàng thế giới thay đổi.', N'Nội dung minh họa cho bài viết 7. Hình ảnh được lấy từ bộ ảnh tin tức đã tải lên, phù hợp hiển thị trên trang tin tức của website.', 'Tin_tuc7.jpg', 1, 1);
END;

IF NOT EXISTS (SELECT 1 FROM G9_TinTuc WHERE G9_TieuDe = N'Mẹo chọn quà tặng trang sức')
BEGIN
    INSERT INTO G9_TinTuc
    (G9_TieuDe, G9_MoTaNgan, G9_NoiDung, G9_HinhAnh, G9_MaNguoiDang, G9_MaDanhMuc)
    VALUES
    (N'Mẹo chọn quà tặng trang sức', N'Trang sức luôn là món quà tinh tế trong các dịp đặc biệt.', N'Nội dung minh họa cho bài viết 8. Hình ảnh được lấy từ bộ ảnh tin tức đã tải lên, phù hợp hiển thị trên trang tin tức của website.', 'Tin_tuc8.jpg', 1, 3);
END;

IF NOT EXISTS (SELECT 1 FROM G9_TinTuc WHERE G9_TieuDe = N'Không khí mua sắm tại cửa hàng')
BEGIN
    INSERT INTO G9_TinTuc
    (G9_TieuDe, G9_MoTaNgan, G9_NoiDung, G9_HinhAnh, G9_MaNguoiDang, G9_MaDanhMuc)
    VALUES
    (N'Không khí mua sắm tại cửa hàng', N'Khách hàng ghé mua các mẫu mới tại cửa hàng trong tuần.', N'Nội dung minh họa cho bài viết 9. Hình ảnh được lấy từ bộ ảnh tin tức đã tải lên, phù hợp hiển thị trên trang tin tức của website.', 'Tin_tuc9.jpg', 1, 2);
END;

IF NOT EXISTS (SELECT 1 FROM G9_TinTuc WHERE G9_TieuDe = N'Nhẫn và dây chuyền lên ngôi')
BEGIN
    INSERT INTO G9_TinTuc
    (G9_TieuDe, G9_MoTaNgan, G9_NoiDung, G9_HinhAnh, G9_MaNguoiDang, G9_MaDanhMuc)
    VALUES
    (N'Nhẫn và dây chuyền lên ngôi', N'Nhiều khách hàng ưu tiên các mẫu nhẫn và dây chuyền thanh lịch.', N'Nội dung minh họa cho bài viết 10. Hình ảnh được lấy từ bộ ảnh tin tức đã tải lên, phù hợp hiển thị trên trang tin tức của website.', 'Tin_tuc10.jpg', 1, 1);
END;

IF NOT EXISTS (SELECT 1 FROM G9_TinTuc WHERE G9_TieuDe = N'Bộ sưu tập mới ra mắt')
BEGIN
    INSERT INTO G9_TinTuc
    (G9_TieuDe, G9_MoTaNgan, G9_NoiDung, G9_HinhAnh, G9_MaNguoiDang, G9_MaDanhMuc)
    VALUES
    (N'Bộ sưu tập mới ra mắt', N'Bộ sưu tập mới mang phong cách hiện đại và sang trọng.', N'Nội dung minh họa cho bài viết 11. Hình ảnh được lấy từ bộ ảnh tin tức đã tải lên, phù hợp hiển thị trên trang tin tức của website.', 'Tin_tuc11.jpg', 1, 3);
END;