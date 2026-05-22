# 📁 Cấu trúc Routes Mới

## Tổng Quan
Routes đã được reorganize từ tất cả các file nằm rải rác trong folder `routes/` sang các subfolder theo chức năng để dễ bảo trì và mở rộng.

## Cấu Trúc Folder

```
routes/
├── auth/                      # Xác thực & đăng nhập
│   ├── auth_routes.py
│   └── __init__.py
├── products/                  # Sản phẩm, danh mục, đánh giá
│   ├── product_routes.py
│   ├── category_routes.py
│   ├── review_routes.py
│   └── __init__.py
├── cart_checkout/             # Giỏ hàng & đặt hàng
│   ├── cart_routes.py
│   ├── order_routes.py
│   └── __init__.py
├── account/                   # Quản lý tài khoản người dùng
│   ├── user_routes.py
│   └── __init__.py
├── admin_management/          # Quản lý admin
│   ├── admin_routes.py
│   ├── dashboard_routes.py
│   └── __init__.py
├── news/                      # Tin tức
│   ├── news_routes.py
│   └── __init__.py
├── gold/                      # Giá vàng
│   ├── gold_routes.py
│   └── __init__.py
├── uploads/                   # Upload ảnh
│   ├── upload_routes.py
│   └── __init__.py
├── __init__.py               # Centralized imports
└── [các file cũ - có thể xóa]

```

## Các Folder Chính

### 1. `auth/`
- **Mục đích:** Xác thực người dùng
- **File:** `auth_routes.py`
- **Endpoints:**
  - `POST /api/auth/login` - Đăng nhập

### 2. `products/`
- **Mục đích:** Quản lý sản phẩm, danh mục, và đánh giá
- **Files:**
  - `product_routes.py` - CRUD sản phẩm
  - `category_routes.py` - CRUD danh mục
  - `review_routes.py` - Đánh giá sản phẩm
- **Endpoints:**
  - `GET/POST /api/products` - Sản phẩm
  - `GET/PUT/DELETE /api/products/<id>`
  - `GET/POST /api/categories` - Danh mục
  - `GET/POST /api/reviews` - Đánh giá

### 3. `cart_checkout/`
- **Mục đích:** Quản lý giỏ hàng và đơn hàng
- **Files:**
  - `cart_routes.py` - Giỏ hàng
  - `order_routes.py` - Đơn hàng
- **Endpoints:**
  - `GET/POST /api/cart/<user_id>` - Giỏ hàng
  - `GET/POST /api/orders` - Đơn hàng
  - `POST /api/orders/checkout` - Thanh toán

### 4. `account/`
- **Mục đích:** Quản lý thông tin tài khoản người dùng
- **File:** `user_routes.py`
- **Endpoints:**
  - `GET /api/user` - Danh sách người dùng
  - `PUT /api/user/update-status/<id>` - Cập nhật trạng thái

### 5. `admin_management/`
- **Mục đích:** Quản lý admin panel
- **Files:**
  - `admin_routes.py` - Quản lý người dùng
  - `dashboard_routes.py` - Thống kê dashboard
- **Endpoints:**
  - `GET /api/admin/users` - Danh sách người dùng
  - `GET /api/dashboard` - Thống kê

### 6. `news/`
- **Mục đích:** Quản lý tin tức
- **File:** `news_routes.py`
- **Endpoints:**
  - `GET /api/news` - Lấy tin tức

### 7. `gold/`
- **Mục đích:** Quản lý giá vàng
- **File:** `gold_routes.py`
- **Endpoints:**
  - `GET /api/gold` - Lấy giá vàng

### 8. `uploads/`
- **Mục đích:** Upload ảnh
- **File:** `upload_routes.py`
- **Endpoints:**
  - `POST /api/upload` - Upload ảnh

## Cách Import

### Cách cũ (không còn sử dụng):
```python
from routes.auth_routes import auth_bp
from routes.product_routes import product_bp
```

### Cách mới:
```python
from routes import auth_bp, product_bp, category_bp, ...
```

Hoặc import từ subfolder:
```python
from routes.auth import auth_bp
from routes.products import product_bp, category_bp, review_bp
```

## Lợi Ích của Cấu Trúc Mới

✅ **Dễ bảo trì:** Các route liên quan được nhóm lại với nhau  
✅ **Dễ mở rộng:** Thêm route mới chỉ cần thêm file vào folder thích hợp  
✅ **Rõ ràng:** Biết ngay route nào thuộc module nào  
✅ **Tránh xung đột:** Tên file không bị trùng lặp  
✅ **Centralized imports:** File `__init__.py` tập trung tất cả imports  

## Hướng Dẫn Thêm Route Mới

1. **Thêm route vào folder thích hợp:**
   - Sản phẩm mới? Thêm vào `products/`
   - Tính năng mới cho admin? Thêm vào `admin_management/`

2. **Update `__init__.py` của folder:**
   ```python
   from .new_routes import new_bp
   
   __all__ = ["...", "new_bp"]
   ```

3. **Update `routes/__init__.py`:**
   ```python
   from .folder import new_bp
   
   __all__ = [..., "new_bp"]
   ```

4. **Register blueprint trong `app.py`:**
   ```python
   app.register_blueprint(new_bp, url_prefix="/api/new")
   ```

## Lưu Ý

- Các file routes cũ ở folder `routes/` gốc có thể được xóa sau khi kiểm tra không có ai import từ đó
- Đảm bảo tất cả imports đã được cập nhật
- Kiểm tra blueprint names không bị trùng lặp
