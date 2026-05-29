# K23CNT1_TTC--Project4

## Tổng quan

Dự án là một website bán trang sức với backend Flask và frontend tĩnh. Backend cung cấp API cho các chức năng:
- Xác thực JWT
- Quản lý sản phẩm, danh mục, tin tức, giá vàng, khuyến mãi
- Giỏ hàng, đơn hàng, người dùng và quản trị
- Tải ảnh và xử lý upload

Frontend được tổ chức trong thư mục `G9_Trangsuc/backend/frontend` với các trang dành cho admin và user.

## Cấu trúc thư mục chính

- `G9_Trangsuc/backend`
  - `app.py` - entrypoint Flask server
  - `requirements.txt` - thư viện Python cần cài
  - `.env` - biến môi trường cấu hình
  - `database/` - kết nối và hàm helper cho SQL Server
  - `routes/` - định nghĩa blueprint API
  - `services/` - logic nghiệp vụ
  - `models/` - truy vấn SQL và thao tác dữ liệu
  - `middleware/` - xác thực JWT và kiểm tra quyền
  - `utils/` - helper chung
  - `frontend/` - giao diện HTML/CSS/JS cho admin và user

## Thiết lập môi trường backend

1. Mở terminal vào thư mục backend:
   ```powershell
   cd G9_Trangsuc/backend
   ```

2. Cài thư viện:
   ```powershell
   pip install -r requirements.txt
   ```

3. Cấu hình biến môi trường trong `G9_Trangsuc/backend/.env`:
   ```text
   DB_SERVER=localhost
   DB_NAME=G9_TrangSucDB
   DB_DRIVER=ODBC Driver 17 for SQL Server
   DB_TRUSTED_CONNECTION=yes

   SECRET_KEY=G9_SECRET_KEY
   JWT_SECRET=G9_JWT_SECRET
   ```

4. Chạy server:
   ```powershell
   python app.py
   ```

5. Truy cập API:
   - `http://127.0.0.1:5000/`

## Yêu cầu Python

Các gói backend chính:
- `Flask`
- `Flask-Cors`
- `python-dotenv`
- `pyodbc`
- `PyJWT`
- `requests`

## Cơ sở dữ liệu

Backend hiện tại kết nối SQL Server bằng `pyodbc` trong `G9_Trangsuc/backend/database/db.py`.

> Lưu ý: file `db.py` hiện dùng kết nối tĩnh tới `DESKTOP-OBG50HB\SQLEXPRESS` và cơ sở dữ liệu `G9_TrangSucDB`. Nếu bạn dùng máy khác, hãy chỉnh lại kết nối trong `database/db.py` hoặc chuyển sang dùng biến môi trường.

## Chức năng nổi bật

- Hệ thống xác thực JWT theo role admin/user
- Quản lý sản phẩm, loại sản phẩm, đánh giá, tin tức
- Giỏ hàng, đặt hàng, thanh toán
- Quản trị đơn hàng, người dùng, báo cáo dashboard
- Upload ảnh

## Ghi chú

- `AUTHENTICATION.md` chứa chi tiết về cách hoạt động JWT và middleware.
- `REFACTORING_SUMMARY.md` chứa tóm tắt tinh chỉnh code nếu cần tham khảo.

---

## Tên repo gốc

Repo hiện tại: `K23CNT1_BuiDucHuy_Project4` (nhánh `master`).
