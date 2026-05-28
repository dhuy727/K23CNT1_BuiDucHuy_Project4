# ==============================
# FILE: utils/request_validator.py
# CHỨC NĂNG:
# - Hỗ trợ validate request payload
# - Trả về lỗi rõ ràng cho endpoint
# ==============================

import re
from datetime import datetime


class ValidationError(ValueError):
    pass


def _is_empty(value):
    return value is None or (isinstance(value, str) and len(value.strip()) == 0)


def validate_required_fields(data, required_fields):
    missing = []
    for field in required_fields:
        if _is_empty(data.get(field)):
            missing.append(field)

    if missing:
        raise ValidationError(f"Thiếu trường bắt buộc: {', '.join(missing)}")

    return True


def validate_string_field(name, value, min_length=1, max_length=None, required=True):
    if _is_empty(value):
        if required:
            raise ValidationError(f"{name} không được để trống")
        return True

    if not isinstance(value, str):
        raise ValidationError(f"{name} phải là chuỗi ký tự")

    text = value.strip()

    if len(text) < min_length:
        raise ValidationError(f"{name} phải có tối thiểu {min_length} ký tự")

    if max_length is not None and len(text) > max_length:
        raise ValidationError(f"{name} tối đa {max_length} ký tự")

    return True


def validate_email_field(name, value, required=True):
    if _is_empty(value):
        if required:
            raise ValidationError(f"{name} không được để trống")
        return True

    if not isinstance(value, str):
        raise ValidationError(f"{name} phải là chuỗi ký tự")

    email = value.strip()
    pattern = r"^[\w\.-]+@[\w\.-]+\.[A-Za-z]{2,}$"
    if not re.match(pattern, email):
        raise ValidationError(f"{name} không hợp lệ")

    if len(email) < 5 or len(email) > 100:
        raise ValidationError(f"{name} phải có từ 5 đến 100 ký tự")

    return True


def to_int(value, name, min_value=None, max_value=None, required=True):
    if value is None or value == "":
        if required:
            raise ValidationError(f"{name} không được để trống")
        return None

    try:
        result = int(value)
    except (ValueError, TypeError):
        raise ValidationError(f"{name} phải là số nguyên")

    if min_value is not None and result < min_value:
        raise ValidationError(f"{name} phải lớn hơn hoặc bằng {min_value}")

    if max_value is not None and result > max_value:
        raise ValidationError(f"{name} phải nhỏ hơn hoặc bằng {max_value}")

    return result


def to_float(value, name, min_value=None, max_value=None, required=True):
    if value is None or value == "":
        if required:
            raise ValidationError(f"{name} không được để trống")
        return None

    try:
        result = float(value)
    except (ValueError, TypeError):
        raise ValidationError(f"{name} phải là số")

    if min_value is not None and result < min_value:
        raise ValidationError(f"{name} phải lớn hơn hoặc bằng {min_value}")

    if max_value is not None and result > max_value:
        raise ValidationError(f"{name} phải nhỏ hơn hoặc bằng {max_value}")

    return result


def validate_date(value, name, date_format="%Y-%m-%d", required=True):
    if _is_empty(value):
        if required:
            raise ValidationError(f"{name} không được để trống")
        return None

    if isinstance(value, str):
        try:
            return datetime.strptime(value, date_format).date()
        except ValueError:
            raise ValidationError(f"{name} phải ở định dạng {date_format}")

    if isinstance(value, datetime):
        return value.date()

    raise ValidationError(f"{name} phải là ngày hợp lệ")


def validate_enum_field(name, value, allowed_values, required=True):
    if _is_empty(value):
        if required:
            raise ValidationError(f"{name} không được để trống")
        return True

    if value not in allowed_values:
        raise ValidationError(f"{name} phải là một trong các giá trị: {', '.join(allowed_values)}")

    return True


def validate_list_field(name, value, element_type=int, required=False):
    if value is None:
        if required:
            raise ValidationError(f"{name} không được để trống")
        return []

    if not isinstance(value, list):
        raise ValidationError(f"{name} phải là danh sách")

    for element in value:
        if not isinstance(element, element_type):
            raise ValidationError(f"Các phần tử trong {name} phải là {element_type.__name__}")

    return value


# ==============================
# DOMAIN VALIDATORS
# ==============================

def validate_product_payload(data, require_all=True):
    if require_all:
        validate_required_fields(data, ["name", "category_id", "price", "quantity"])

    validate_string_field("Tên sản phẩm", data.get("name"), min_length=3, max_length=200, required=require_all)
    if "category_id" in data:
        to_int(data.get("category_id"), "Danh mục", min_value=1, required=require_all)
    if "price" in data:
        to_float(data.get("price"), "Giá", min_value=0, required=require_all)
    if "quantity" in data:
        to_int(data.get("quantity"), "Số lượng", min_value=0, required=require_all)
    if "status" in data:
        validate_string_field("Trạng thái", data.get("status"), min_length=1, max_length=50, required=False)
    if "image" in data:
        validate_string_field("Hình ảnh", data.get("image"), min_length=1, max_length=255, required=False)
    if "description" in data:
        validate_string_field("Mô tả", data.get("description"), min_length=0, max_length=1000, required=False)
    return True


def validate_category_payload(data, require_all=True):
    if require_all:
        validate_required_fields(data, ["name"])

    validate_string_field("Tên danh mục", data.get("name"), min_length=3, max_length=100, required=require_all)
    if "description" in data:
        validate_string_field("Mô tả", data.get("description"), min_length=0, max_length=500, required=False)
    if "status" in data:
        validate_string_field("Trạng thái", data.get("status"), min_length=1, max_length=50, required=False)
    return True


def validate_review_payload(data):
    validate_required_fields(data, ["product_id", "rating", "content"])
    to_int(data.get("product_id"), "ID sản phẩm", min_value=1)
    rating = to_int(data.get("rating"), "Số sao", min_value=1, max_value=5)
    validate_string_field("Nội dung đánh giá", data.get("content"), min_length=10, max_length=1000)
    return True


def validate_cart_payload(data):
    validate_required_fields(data, ["user_id", "product_id", "quantity"])
    to_int(data.get("user_id"), "ID người dùng", min_value=1)
    to_int(data.get("product_id"), "ID sản phẩm", min_value=1)
    to_int(data.get("quantity"), "Số lượng", min_value=1)
    return True


def validate_checkout_payload(data):
    validate_required_fields(data, ["user_id", "receiver_name", "phone", "address"])
    to_int(data.get("user_id"), "ID người dùng", min_value=1)
    validate_string_field("Tên người nhận", data.get("receiver_name"), min_length=3, max_length=200)
    validate_string_field("Số điện thoại", data.get("phone"), min_length=10, max_length=15)
    validate_string_field("Địa chỉ", data.get("address"), min_length=5, max_length=500)
    if data.get("payment_method"):
        validate_string_field("Phương thức thanh toán", data.get("payment_method"), min_length=2, max_length=50, required=False)
    return True


def validate_promotion_payload(data, require_all=True):
    if require_all:
        validate_required_fields(data, ["code", "discount_value", "start_date", "end_date"])

    validate_string_field("Mã khuyến mãi", data.get("code"), min_length=3, max_length=50, required=require_all)
    if "discount_value" in data:
        to_float(data.get("discount_value"), "Giá trị giảm giá", min_value=0, required=require_all)
    if "start_date" in data:
        validate_date(data.get("start_date"), "Ngày bắt đầu", required=require_all)
    if "end_date" in data:
        validate_date(data.get("end_date"), "Ngày kết thúc", required=require_all)
    if data.get("start_date") and data.get("end_date"):
        start = validate_date(data.get("start_date"), "Ngày bắt đầu")
        end = validate_date(data.get("end_date"), "Ngày kết thúc")
        if start > end:
            raise ValidationError("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc")
    if "categories" in data:
        validate_list_field("Danh sách danh mục", data.get("categories"), element_type=int, required=False)
    if "status" in data:
        validate_string_field("Trạng thái", data.get("status"), min_length=1, max_length=50, required=False)
    return True


def validate_news_payload(data, require_all=True):
    if require_all:
        validate_required_fields(data, ["title", "short_description", "content"])

    validate_string_field("Tiêu đề", data.get("title"), min_length=5, max_length=200, required=require_all)
    validate_string_field("Mô tả ngắn", data.get("short_description"), min_length=10, max_length=300, required=require_all)
    validate_string_field("Nội dung", data.get("content"), min_length=20, max_length=5000, required=require_all)
    if "status" in data:
        validate_string_field("Trạng thái", data.get("status"), min_length=1, max_length=50, required=False)
    return True


def validate_gold_payload(data, require_all=True):
    if require_all:
        validate_required_fields(data, ["price"])

    if "price" in data:
        to_float(data.get("price"), "Giá vàng", min_value=0, required=require_all)
    if "status" in data:
        validate_string_field("Trạng thái", data.get("status"), min_length=1, max_length=50, required=False)
    return True


def validate_login_payload(data):
    validate_required_fields(data, ["username", "password"])
    validate_string_field("Tên đăng nhập", data.get("username"), min_length=3, max_length=100)
    validate_string_field("Mật khẩu", data.get("password"), min_length=6, max_length=100)
    return True


def validate_register_payload(data):
    validate_required_fields(data, ["fullname", "username", "email", "phone", "password"])
    validate_string_field("Họ tên", data.get("fullname"), min_length=3, max_length=150)
    validate_string_field("Tên đăng nhập", data.get("username"), min_length=3, max_length=50)
    validate_email_field("Email", data.get("email"))
    validate_string_field("Số điện thoại", data.get("phone"), min_length=10, max_length=15)
    validate_string_field("Mật khẩu", data.get("password"), min_length=6, max_length=100)
    return True


def validate_status_field(status, allowed_values=None):
    if _is_empty(status):
        raise ValidationError("Trạng thái không được để trống")
    if allowed_values:
        validate_enum_field("Trạng thái", status, allowed_values)
    return True
