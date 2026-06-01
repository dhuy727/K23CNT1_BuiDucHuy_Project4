# K23CNT1_TTC--Project4

## Tổng quan

Dự án là một website bán trang sức với backend Flask và frontend jS/html5. Backend nằm trong `G9_Trangsuc/backend`, còn frontend cho admin và user nằm trong `G9_Trangsuc/backend/frontend`.

Backend cung cấp API và chức năng chính:
- Xác thực JWT cho admin và user
- Quản lý sản phẩm, danh mục, tin tức, giá vàng, khuyến mãi
- Giỏ hàng, đơn hàng, thanh toán, người dùng, quản trị
- Upload ảnh và xử lý file

## Cấu trúc thư mục chính

- `G9_Trangsuc/backend/`
  - `app.py` - entrypoint Flask server
  - `config.py` - cấu hình ứng dụng
  - `requirements.txt` - thư viện Python cần cài
  - `.env` - biến môi trường cấu hình
  - `database/` - kết nối SQL Server và helper database
  - `routes/` - định nghĩa blueprint API
  - `services/` - logic nghiệp vụ
  - `models/` - truy vấn SQL và thao tác dữ liệu
  - `middleware/` - xác thực JWT và kiểm tra quyền
  - `extensions/` - mở rộng OAuth Google
  - `utils/` - helper chung
  - `uploads/` - lưu trữ file upload
  - `frontend/` - giao diện HTML/CSS/JS tĩnh cho admin và user

## Thiết lập môi trường backend

1. Mở terminal vào thư mục backend:
   ```powershell
   cd G9_Trangsuc/backend
   ```

2. Cài thư viện:
   ```powershell
   pip install -r requirements.txt
   ```

3. Tạo hoặc cập nhật file `.env` trong `G9_Trangsuc/backend` với nội dung tương tự:
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
- `Authlib`

## Cơ sở dữ liệu

Backend hiện tại kết nối SQL Server bằng `pyodbc` trong `G9_Trangsuc/backend/database/db.py`.

> Lưu ý: file `db.py` có thể chứa cấu hình kết nối . Nếu bạn dùng máy khác, hãy chỉnh lại kết nối trong `database/db.py` hoặc cập nhật `.env`.

## Chức năng nổi bật

- Xác thực JWT theo role admin/user
- Quản lý sản phẩm, danh mục, đánh giá, tin tức
- Giỏ hàng, đặt hàng, thanh toán
- Quản trị đơn hàng, người dùng, dashboard
- Upload ảnh