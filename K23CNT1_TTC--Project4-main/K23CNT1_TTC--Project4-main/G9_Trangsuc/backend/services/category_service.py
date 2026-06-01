# ==============================
# FILE: services/category_service.py
# CHỨC NĂNG:
# - Quản lý danh mục sản phẩm
# - Xây dựng cây danh mục
# - Tìm kiếm danh mục
# ==============================

from models.category_model import CategoryModel


class CategoryService:
    # ==============================
    # LẤY CÂY DANH MỤC
    # ==============================
    @staticmethod
    def build_category_tree(categories):
        """
        Xây dựng cây danh mục phân cấp
        categories: danh sách tất cả danh mục
        """
        # Tạo map id -> category
        cat_map = {c.get("id"): c for c in categories}

        # Tạo cây: danh mục cha -> danh sách danh mục con
        tree = {}

        for cat in categories:
            parent_id = cat.get("parent_id")

            if parent_id is None:
                tree[cat.get("id")] = {
                    "category": cat,
                    "children": []
                }
            else:
                # Danh mục cấp 2+
                if parent_id not in tree:
                    tree[parent_id] = {"category": cat_map.get(parent_id), "children": []}

                tree[parent_id]["children"].append(cat)

        return tree

    # ==============================
    # LẤY DANH MỤC CON
    # ==============================
    @staticmethod
    def get_subcategories(parent_id, categories):
        """Lấy danh sách danh mục con"""
        return [c for c in categories if c.get("parent_id") == parent_id]

    # ==============================
    # LẤY DANH MỤC CHA
    # ==============================
    @staticmethod
    def get_parent_category(category_id, categories):
        """Lấy danh mục cha"""
        cat = next((c for c in categories if c.get("id") == category_id), None)

        if not cat or not cat.get("parent_id"):
            return None

        return next((c for c in categories if c.get("id") == cat.get("parent_id")), None)

    # ==============================
    # TÌM DANH MỤC
    # ==============================
    @staticmethod
    def search_category(keyword, categories):
        """Tìm kiếm danh mục theo từ khóa"""
        keyword_lower = keyword.lower()
        return [c for c in categories
                if keyword_lower in c.get("name", "").lower()]

    # ==============================
    # LẤY ĐƯỜNG DẪN DANH MỤC
    # ==============================
    @staticmethod
    def get_category_breadcrumb(category_id, categories):
        """
        Lấy đường dẫn danh mục (breadcrumb)
        VD: Trang sức > Nhẫn > Nhẫn vàng
        """
        breadcrumb = []
        current_id = category_id

        while current_id is not None:
            cat = next((c for c in categories if c.get("id") == current_id), None)

            if not cat:
                break

            breadcrumb.insert(0, cat)
            current_id = cat.get("parent_id")

        return breadcrumb

    # ==============================
    # KIỂM TRA DANH MỤC HOẠT ĐỘNG
    # ==============================
    @staticmethod
    def is_category_active(category_status):
        """Kiểm tra danh mục có đang hoạt động"""
        return category_status == "Hoạt động"

    # ==============================
    # VALIDATE DANH MỤC
    # ==============================
    @staticmethod
    def validate_category_name(name):
        """Kiểm tra tên danh mục"""
        if not name or len(name.strip()) == 0:
            raise ValueError("Tên danh mục không được trống")

        if len(name) > 100:
            raise ValueError("Tên danh mục tối đa 100 ký tự")

        return True
