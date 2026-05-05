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
(N'Nguyễn Ngọc Hiến', 'user3', '123456', 'hien@gmail.com', '0900000004', 3);

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

INSERT INTO G9_SanPham
(G9_TenSanPham, G9_MaDanhMuc, G9_ChatLieu, G9_Gia, G9_SoLuongTon, G9_HinhAnhChinh, G9_MoTa)
VALUES
(N'Nhẫn vàng 18K', 5, N'Vàng 18K', 5000000, 10, 'nhan1.jpg', N'Nhẫn vàng cao cấp'),
(N'Nhẫn bạc 925', 6, N'Bạc 925', 1200000, 20, 'nhan2.jpg', N'Nhẫn bạc đẹp'),
(N'Dây chuyền vàng', 3, N'Vàng 24K', 7000000, 5, 'day1.jpg', N'Dây chuyền sang trọng');

INSERT INTO G9_HinhAnhSanPham (G9_MaSanPham, G9_DuongDan, G9_LaAnhChinh)
VALUES
(1, 'nhan1_1.jpg', 1),
(1, 'nhan1_2.jpg', 0),
(2, 'nhan2_1.jpg', 1);

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