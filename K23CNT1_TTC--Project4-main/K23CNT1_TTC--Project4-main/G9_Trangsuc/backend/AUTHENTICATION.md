# 🔐 Authentication & Authorization Middleware

## Overview

Hệ thống xác thực toàn diện sử dụng JWT tokens và Role-Based Access Control (RBAC).

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Flask Request                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
      ┌─────────────────────────────┐
      │  Middleware Decorators      │
      │  - require_auth             │
      │  - require_admin            │
      │  - require_user             │
      │  - optional_auth            │
      └────────────────┬────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
    ✅ Request Allowed      ❌ Request Denied
    Execute Handler         Return 401/403
```

## Decorators

### 1. `@require_auth`
**Chức năng:** Bắt buộc xác thực JWT token

**Yêu cầu:**
- Authorization header với format: `Bearer <token>`

**Trả về:**
- ✅ 200: User được xác thực, handler được thực thi
- ❌ 401: Token không hợp lệ, hết hạn hoặc không có

**Ví dụ:**
```python
@admin_bp.route("/users", methods=["GET"])
@require_auth
def get_users():
    user = get_current_user()  # {'id': 1, 'username': 'admin', 'role': 'Admin'}
    ...
```

---

### 2. `@require_admin`
**Chức năng:** Bắt buộc user có role = "Admin"

**Lưu ý:**
- Phải dùng **sau** `@require_auth`
- Kiểm tra `request.current_user['role'] == 'admin'`

**Trả về:**
- ✅ 200: User là admin, handler được thực thi
- ❌ 403: User không phải admin

**Ví dụ:**
```python
@admin_bp.route("/users", methods=["GET"])
@require_auth
@require_admin  # Phải ở vị trí này
def get_users():
    ...
```

---

### 3. `@require_user`
**Chức năng:** Bắt buộc user có role = "User" hoặc "Admin"

**Lưu ý:**
- Phải dùng **sau** `@require_auth`
- Admin được phép access vì có quyền cao hơn

**Ví dụ:**
```python
@review_bp.route("/", methods=["POST"])
@require_auth
@require_user
def create_review():
    ...
```

---

### 4. `@optional_auth`
**Chức năng:** Token không bắt buộc nhưng nếu có phải valid

**Sử dụng:** Endpoints công khai có thể fetch thêm info nếu user đã login

**Ví dụ:**
```python
@product_bp.route("/<int:id>", methods=["GET"])
@optional_auth
def get_product(id):
    user = get_current_user()
    if user:
        # Thêm dữ liệu tùy user nếu có
        pass
    ...
```

---

## Utility Functions

### `get_current_user()`
Lấy user data từ request context

```python
from middleware import get_current_user

@require_auth
def handler():
    user = get_current_user()
    # user = {'id': 1, 'username': 'admin', 'role': 'Admin', 'exp': ...}
```

### `get_current_user_id()`
Lấy user ID

```python
from middleware import get_current_user_id

@require_auth
def handler():
    user_id = get_current_user_id()  # 1
```

### `is_admin()`
Kiểm tra user là admin

```python
from middleware import is_admin

@require_auth
def handler():
    if is_admin():
        # Admin only logic
        pass
```

### `is_current_user(user_id)`
Kiểm tra user_id = current_user.id hoặc user là admin

```python
from middleware import is_current_user

@require_auth
def update_profile(user_id):
    if not is_current_user(user_id):
        return {"error": "Unauthorized"}, 403
    # Cập nhật profile
```

---

## Current Route Protection Status

| Route | Method | Auth | Role | Status |
|-------|--------|------|------|--------|
| **Auth** |
| /api/auth/login | POST | ❌ | - | Public |
| **Products** |
| /api/products | GET | ❌ | - | Public |
| /api/products | POST | ✅ | Admin | Protected |
| /api/products/<id> | PUT | ✅ | Admin | Protected |
| /api/products/<id> | DELETE | ✅ | Admin | Protected |
| **Categories** |
| /api/categories | GET | ❌ | - | Public |
| /api/categories | POST | ✅ | Admin | Protected |
| /api/categories/<id> | PUT | ✅ | Admin | Protected |
| /api/categories/<id> | DELETE | ✅ | Admin | Protected |
| **Reviews** |
| /api/reviews/product/<id> | GET | ❌ | - | Public |
| /api/reviews | POST | ✅ | User | Protected |
| **Cart** |
| /api/cart/<user_id> | GET | ✅ | User | Protected |
| /api/cart/add | POST | ✅ | User | Protected |
| /api/cart/update/<id> | PUT | ✅ | User | Protected |
| /api/cart/delete/<id> | DELETE | ✅ | User | Protected |
| **Orders** |
| /api/orders | GET | ✅ | Admin | Protected |
| /api/orders/user/<id> | GET | ✅ | User | Protected |
| /api/orders/detail/<id> | GET | ✅ | User | Protected |
| /api/orders/checkout | POST | ✅ | User | Protected |
| /api/orders/status/<id> | PUT | ✅ | Admin | Protected |
| **Users** |
| /api/user | GET | ✅ | Admin | Protected |
| /api/user/status/<id> | PUT | ✅ | Admin | Protected |
| **Admin** |
| /api/admin/users | GET | ✅ | Admin | Protected |
| /api/admin/users/status/<id> | PUT | ✅ | Admin | Protected |
| **Dashboard** |
| /api/dashboard | GET | ✅ | Admin | Protected |
| **News** |
| /api/news | GET | ❌ | - | Public |
| /api/news | POST | ✅ | Admin | Protected |
| /api/news/<id> | PUT | ✅ | Admin | Protected |
| /api/news/<id> | DELETE | ✅ | Admin | Protected |
| **Gold** |
| /api/gold | GET | ❌ | - | Public |
| /api/gold | POST | ✅ | Admin | Protected |
| /api/gold/<id> | PUT | ✅ | Admin | Protected |
| **Promotions** |
| /api/promotions | GET | ❌ | - | Public |
| /api/promotions/<id> | GET | ❌ | - | Public |
| /api/promotions/code/<code> | GET | ❌ | - | Public |
| /api/promotions/category/<id> | GET | ❌ | - | Public |
| /api/promotions | POST | ✅ | Admin | Protected |
| /api/promotions/<id> | PUT | ✅ | Admin | Protected |
| /api/promotions/<id> | DELETE | ✅ | Admin | Protected |
| /api/promotions/validate/<code> | GET | ❌ | - | Public |
| **Upload** |
| /api/upload | POST | ✅ | User | Protected |

---

## How to Use

### Frontend - Login & Get Token

```javascript
// POST /api/auth/login
const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        username: 'admin',
        password: 'password'
    })
});

const data = await response.json();
const token = data.token;  // Save this token!

// Store token in localStorage
localStorage.setItem('token', token);
```

### Frontend - Use Token in Requests

```javascript
// GET /api/admin/users
const response = await fetch('/api/admin/users', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`  // Add token here
    }
});

const data = await response.json();
```

### Frontend - Handle Errors

```javascript
const response = await fetch('/api/admin/users', {
    headers: { 'Authorization': `Bearer ${token}` }
});

if (response.status === 401) {
    // Token không hợp lệ hoặc hết hạn - Redirect to login
    window.location.href = '/login';
}

if (response.status === 403) {
    // User không có quyền
    alert('Bạn không có quyền truy cập tài nguyên này');
}
```

---

## Token Structure

JWT Token chứa 3 phần: `header.payload.signature`

**Payload:**
```json
{
    "id": 1,
    "username": "admin",
    "role": "Admin",
    "exp": 1234567890  // Expiration time (24 hours)
}
```

**Decode Token (Python):**
```python
from utils.jwt_helper import decode_token

token = "eyJhbGc..."
user_data = decode_token(token)
# user_data = {'id': 1, 'username': 'admin', 'role': 'Admin', 'exp': ...}
```

---

## Decorator Order (IMPORTANT!)

**Correct Order (do this):**
```python
@route.route("/admin-endpoint", methods=["POST"])
@require_auth      # 1️⃣ First: Check token
@require_admin     # 2️⃣ Second: Check role
def handler():
    pass
```

**Wrong Order (don't do this):**
```python
@route.route("/admin-endpoint", methods=["POST"])
@require_admin     # ❌ First: Check role (but user not authenticated yet!)
@require_auth      # ❌ Second: Check token
def handler():
    pass
```

---

## Error Responses

### 401 Unauthorized
```json
{
    "success": false,
    "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
    "success": false,
    "message": "Admin access required"
}
```

---

## Best Practices

✅ **DO:**
- Luôn sử dụng `@require_auth` trước `@require_admin`
- Validate user ownership khi edit/delete: `is_current_user(user_id)`
- Store token securely: `localStorage` (web) hoặc `AsyncStorage` (mobile)
- Refresh token trước khi hết hạn
- Log audit khi admin perform sensitive operations

❌ **DON'T:**
- Store token in plain text
- Send token in URL: `GET /api/data?token=xyz` ❌
- Use `Bearer token` in cookies without HttpOnly flag
- Trust client-side role checks alone
- Hardcode role names

---

