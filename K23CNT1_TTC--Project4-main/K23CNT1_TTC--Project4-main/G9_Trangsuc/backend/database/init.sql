-- -- CREATE DATABASE IF NOT EXISTS G9_TrangSucDB;
-- -- USE G9_TrangSucDB;

-- USE G9_TrangSucDB;
-- GO

-- CREATE TABLE G9_VaiTro (
--     G9_MaVaiTro INT IDENTITY PRIMARY KEY,
--     G9_TenVaiTro NVARCHAR(50) UNIQUE NOT NULL
-- );

-- CREATE TABLE G9_NguoiDung (
--     G9_MaNguoiDung INT IDENTITY PRIMARY KEY,
--     G9_HoTen NVARCHAR(150) NOT NULL,
--     G9_TenDangNhap VARCHAR(50) UNIQUE NOT NULL,
--     G9_MatKhau VARCHAR(255) NOT NULL,
--     G9_Email VARCHAR(100) UNIQUE,
--     G9_SoDienThoai VARCHAR(15),
--     G9_Avatar NVARCHAR(255),
--     G9_MaVaiTro INT NOT NULL,
--     G9_TrangThai NVARCHAR(30) DEFAULT N'Hoạt động',
--     G9_NgayTao DATETIME DEFAULT GETDATE(),

--     FOREIGN KEY (G9_MaVaiTro) REFERENCES G9_VaiTro(G9_MaVaiTro)
-- );

-- CREATE TABLE G9_DanhMuc (
--     G9_MaDanhMuc INT IDENTITY PRIMARY KEY,
--     G9_TenDanhMuc NVARCHAR(100) NOT NULL,
--     G9_MoTa NVARCHAR(255) NULL,
--     G9_MaDanhMucCha INT NULL,
--     G9_TrangThai NVARCHAR(30) DEFAULT N'Hoạt động',

--     CONSTRAINT FK_G9_DanhMuc_Cha
--         FOREIGN KEY (G9_MaDanhMucCha)
--         REFERENCES G9_DanhMuc(G9_MaDanhMuc)
-- );
-- --NULL → danh mục cha (cấp 1)
-- -- Có giá trị → danh mục con 

-- CREATE TABLE G9_SanPham (
--     G9_MaSanPham INT IDENTITY PRIMARY KEY,
--     G9_TenSanPham NVARCHAR(200) NOT NULL,
--     G9_MaDanhMuc INT NOT NULL,
--     G9_ChatLieu NVARCHAR(100),
--     G9_Gia DECIMAL(18,2) NOT NULL,
--     G9_SoLuongTon INT DEFAULT 0,
--     G9_HinhAnhChinh NVARCHAR(255),
--     G9_MoTa NVARCHAR(MAX),
--     G9_TrangThai NVARCHAR(30) DEFAULT N'Còn hàng',
--     G9_NgayTao DATETIME DEFAULT GETDATE(),

--     FOREIGN KEY (G9_MaDanhMuc) REFERENCES G9_DanhMuc(G9_MaDanhMuc)
-- );

-- CREATE TABLE G9_HinhAnhSanPham (
--     G9_MaHinh INT IDENTITY PRIMARY KEY,
--     G9_MaSanPham INT NOT NULL,
--     G9_DuongDan NVARCHAR(255),
--     G9_LaAnhChinh BIT DEFAULT 0,

--     FOREIGN KEY (G9_MaSanPham) REFERENCES G9_SanPham(G9_MaSanPham)
--     ON DELETE CASCADE
-- );

-- CREATE TABLE G9_GioHang (
--     G9_MaGioHang INT IDENTITY PRIMARY KEY,
--     G9_MaNguoiDung INT NOT NULL,
--     G9_NgayTao DATETIME DEFAULT GETDATE(),

--     FOREIGN KEY (G9_MaNguoiDung) REFERENCES G9_NguoiDung(G9_MaNguoiDung)
-- );

-- CREATE TABLE G9_ChiTietGioHang (
--     G9_MaChiTiet INT IDENTITY PRIMARY KEY,
--     G9_MaGioHang INT NOT NULL,
--     G9_MaSanPham INT NOT NULL,
--     G9_SoLuong INT CHECK (G9_SoLuong > 0),
--     G9_DonGia DECIMAL(18,2),

--     FOREIGN KEY (G9_MaGioHang) REFERENCES G9_GioHang(G9_MaGioHang) ON DELETE CASCADE,
--     FOREIGN KEY (G9_MaSanPham) REFERENCES G9_SanPham(G9_MaSanPham)
-- );

-- CREATE TABLE G9_DonHang (
--     G9_MaDonHang INT IDENTITY PRIMARY KEY,
--     G9_MaNguoiDung INT NOT NULL,
--     G9_TenNguoiNhan NVARCHAR(150),
--     G9_SDTNhan VARCHAR(15),
--     G9_DiaChiGiao NVARCHAR(255),
--     G9_TongTien DECIMAL(18,2),
--     G9_TrangThai NVARCHAR(30) DEFAULT N'Chờ xác nhận',
--     G9_NgayDat DATETIME DEFAULT GETDATE(),

--     FOREIGN KEY (G9_MaNguoiDung) REFERENCES G9_NguoiDung(G9_MaNguoiDung)
-- );

-- CREATE TABLE G9_ChiTietDonHang (
--     G9_MaChiTiet INT IDENTITY PRIMARY KEY,
--     G9_MaDonHang INT NOT NULL,
--     G9_MaSanPham INT NOT NULL,
--     G9_SoLuong INT CHECK (G9_SoLuong > 0),
--     G9_DonGia DECIMAL(18,2),
--     G9_ThanhTien AS (G9_SoLuong * G9_DonGia),

--     FOREIGN KEY (G9_MaDonHang) REFERENCES G9_DonHang(G9_MaDonHang) ON DELETE CASCADE,
--     FOREIGN KEY (G9_MaSanPham) REFERENCES G9_SanPham(G9_MaSanPham)
-- );

-- CREATE TABLE G9_LichSuTrangThaiDonHang (
--     G9_ID INT IDENTITY PRIMARY KEY,
--     G9_MaDonHang INT,
--     G9_TrangThai NVARCHAR(50),
--     G9_ThoiGian DATETIME DEFAULT GETDATE(),

--     FOREIGN KEY (G9_MaDonHang) REFERENCES G9_DonHang(G9_MaDonHang)
-- );

-- CREATE TABLE G9_ThanhToan (
--     G9_MaThanhToan INT IDENTITY PRIMARY KEY,
--     G9_MaDonHang INT NOT NULL,
--     G9_PhuongThuc NVARCHAR(50) NOT NULL,
--     G9_CongThanhToan NVARCHAR(50) NULL, 
--     G9_MaGiaoDich VARCHAR(100) NULL,
--     G9_SoTien DECIMAL(18,2) NOT NULL,
--     G9_TrangThai NVARCHAR(30) DEFAULT N'Chưa thanh toán',
--     G9_NgayThanhToan DATETIME NULL,
--     G9_NgayTao DATETIME DEFAULT GETDATE(),

--     CONSTRAINT FK_G9_ThanhToan_DonHang
--         FOREIGN KEY (G9_MaDonHang)
--         REFERENCES G9_DonHang(G9_MaDonHang)
-- );

-- CREATE TABLE G9_KhuyenMai (
--     G9_MaKhuyenMai INT IDENTITY PRIMARY KEY,
--     G9_MaCode VARCHAR(50) UNIQUE,
--     G9_GiaTriGiam DECIMAL(18,2),
--     G9_NgayBatDau DATETIME,
--     G9_NgayKetThuc DATETIME,
--     G9_TrangThai NVARCHAR(30) DEFAULT N'Hoạt động'
-- );

-- CREATE TABLE G9_DanhMuc_KhuyenMai (
--     G9_ID INT IDENTITY PRIMARY KEY,
--     G9_MaDanhMuc INT NOT NULL,
--     G9_MaKhuyenMai INT NOT NULL,

--     CONSTRAINT FK_G9_DMKM_DanhMuc
--         FOREIGN KEY (G9_MaDanhMuc) REFERENCES G9_DanhMuc(G9_MaDanhMuc)
--         ON DELETE CASCADE,

--     CONSTRAINT FK_G9_DMKM_KhuyenMai
--         FOREIGN KEY (G9_MaKhuyenMai) REFERENCES G9_KhuyenMai(G9_MaKhuyenMai)
--         ON DELETE CASCADE
-- );

-- CREATE TABLE G9_DanhGia (
--     G9_MaDanhGia INT IDENTITY PRIMARY KEY,
--     G9_MaSanPham INT,
--     G9_MaNguoiDung INT,
--     G9_SoSao INT CHECK (G9_SoSao BETWEEN 1 AND 5),
--     G9_NoiDung NVARCHAR(500),
--     G9_TrangThai NVARCHAR(30) DEFAULT N'Hiển thị',
--     G9_NgayDanhGia DATETIME DEFAULT GETDATE(),

--     FOREIGN KEY (G9_MaSanPham) REFERENCES G9_SanPham(G9_MaSanPham) ON DELETE CASCADE,
--     FOREIGN KEY (G9_MaNguoiDung) REFERENCES G9_NguoiDung(G9_MaNguoiDung)
-- );

-- CREATE TABLE G9_GiaVang (
--     G9_MaGiaVang INT IDENTITY PRIMARY KEY,
--     G9_LoaiVang NVARCHAR(50), -- VD: SJC, 18K, 24K
--     G9_GiaMua DECIMAL(18,2),
--     G9_GiaBan DECIMAL(18,2),
--     G9_NgayCapNhat DATETIME DEFAULT GETDATE()
-- );

-- CREATE TABLE G9_TinTuc (
--     G9_MaTinTuc INT IDENTITY PRIMARY KEY,
--     G9_TieuDe NVARCHAR(255) NOT NULL,
--     G9_MoTaNgan NVARCHAR(500),
--     G9_NoiDung NVARCHAR(MAX),
--     G9_HinhAnh NVARCHAR(255),
--     G9_MaNguoiDang INT,
--     G9_NgayDang DATETIME DEFAULT GETDATE(),
--     G9_TrangThai NVARCHAR(30) DEFAULT N'Hiển thị',

--     FOREIGN KEY (G9_MaNguoiDang) REFERENCES G9_NguoiDung(G9_MaNguoiDung)
-- );

-- CREATE TABLE G9_DanhMucTinTuc (
--     G9_MaDanhMuc INT IDENTITY PRIMARY KEY,
--     G9_TenDanhMuc NVARCHAR(100)
-- );

-- ALTER TABLE G9_TinTuc
-- ADD G9_MaDanhMuc INT;

-- ALTER TABLE G9_TinTuc
-- ADD CONSTRAINT FK_TinTuc_DanhMuc
-- FOREIGN KEY (G9_MaDanhMuc)
-- REFERENCES G9_DanhMucTinTuc(G9_MaDanhMuc);