# ==============================
# FILE: services/news_service.py
# CHỨC NĂNG:
# - Quản lý tin tức
# - Lọc tin tức
# - Highlight tin tức nổi bật
# ==============================

from models.news_model import NewsModel
from datetime import datetime, timedelta


class NewsService:
    # ==============================
    # VALIDATE TIÊUCÍ TIN
    # ==============================
    @staticmethod
    def validate_news_title(title):
        """Kiểm tra tiêu đề tin tức"""
        if not title or len(title.strip()) == 0:
            raise ValueError("Tiêu đề tin tức không được trống")

        if len(title) > 255:
            raise ValueError("Tiêu đề tin tức tối đa 255 ký tự")

        return True

    # ==============================
    # VALIDATE NỘI DUNG TIN
    # ==============================
    @staticmethod
    def validate_news_content(content):
        """Kiểm tra nội dung tin tức"""
        if not content or len(content.strip()) == 0:
            raise ValueError("Nội dung tin tức không được trống")

        if len(content) < 50:
            raise ValueError("Nội dung tin tức tối thiểu 50 ký tự")

        return True

    # ==============================
    # VALIDATE MÔ TẢ NGẮN
    # ==============================
    @staticmethod
    def validate_news_description(description):
        """Kiểm tra mô tả ngắn"""
        if not description or len(description.strip()) == 0:
            raise ValueError("Mô tả ngắn không được trống")

        if len(description) > 500:
            raise ValueError("Mô tả ngắn tối đa 500 ký tự")

        return True

    # ==============================
    # KIỂM TRA TIN TỨC HOẠT ĐỘNG
    # ==============================
    @staticmethod
    def is_news_published(news_status):
        """Kiểm tra tin tức có được hiển thị"""
        return news_status == "Hiển thị"

    # ==============================
    # LẤY TIN TỨC MỚI NHẤT
    # ==============================
    @staticmethod
    def get_latest_news(limit=5):
        """Lấy tin tức mới nhất"""
        news = NewsModel.get_all_news()

        # Lọc tin tức hiển thị
        published = [n for n in news if NewsService.is_news_published(n.get("status"))]

        # Sắp xếp theo ngày đăng (mới nhất trước)
        published.sort(key=lambda x: x.get("created_at", ""), reverse=True)

        return published[:limit]

    # ==============================
    # LẤY TIN TỨC NỔI BẬT
    # ==============================
    @staticmethod
    def get_featured_news(limit=3):
        """Lấy tin tức nổi bật (nổi bật nhất = mới nhất)"""
        return NewsService.get_latest_news(limit=limit)

    # ==============================
    # LẤY TIN TỨC THEO DANH MỤC
    # ==============================
    @staticmethod
    def get_news_by_category(category_id, limit=10):
        """Lấy tin tức theo danh mục"""
        news = NewsModel.get_all_news()

        # Lọc theo danh mục và trạng thái
        filtered = [n for n in news
                    if n.get("category_id") == category_id
                    and NewsService.is_news_published(n.get("status"))]

        # Sắp xếp theo ngày đăng
        filtered.sort(key=lambda x: x.get("created_at", ""), reverse=True)

        return filtered[:limit]

    # ==============================
    # TÌM KIẾM TIN TỨC
    # ==============================
    @staticmethod
    def search_news(keyword, limit=20):
        """Tìm kiếm tin tức theo từ khóa"""
        news = NewsModel.get_all_news()
        keyword_lower = keyword.lower()

        # Tìm kiếm trong tiêu đề và mô tả
        results = [n for n in news
                   if NewsService.is_news_published(n.get("status"))
                   and (keyword_lower in n.get("title", "").lower()
                        or keyword_lower in n.get("description", "").lower())]

        # Sắp xếp theo mức độ liên quan (tiêu đề trước)
        title_matches = [n for n in results if keyword_lower in n.get("title", "").lower()]
        other_matches = [n for n in results if n not in title_matches]

        return (title_matches + other_matches)[:limit]

    # ==============================
    # TẠO EXCERPT TỪ NỘI DUNG
    # ==============================
    @staticmethod
    def generate_excerpt(content, length=150):
        """Tạo excerpt (trích đoạn) từ nội dung"""
        if len(content) <= length:
            return content

        excerpt = content[:length].rsplit(" ", 1)[0] + "..."
        return excerpt

    # ==============================
    # KIỂM TRA TIN MỚI
    # ==============================
    @staticmethod
    def is_news_new(created_date, days=7):
        """Kiểm tra tin tức có phải tin mới (trong vòng N ngày)"""
        if isinstance(created_date, str):
            created_date = datetime.strptime(created_date, "%Y-%m-%d").date()
        elif isinstance(created_date, datetime):
            created_date = created_date.date()

        threshold = datetime.now().date() - timedelta(days=days)
        return created_date >= threshold

    # ==============================
    # LẤY SỐ LƯỢT XEM
    # ==============================
    @staticmethod
    def increment_news_views(news_id):
        """Tăng số lượt xem của tin tức"""
        # Cần có cơ chế lưu lượt xem trong database
        pass

    # ==============================
    # GET POPULAR NEWS
    # ==============================
    @staticmethod
    def get_popular_news(limit=5):
        """Lấy tin tức phổ biến nhất (lượt xem nhiều)"""
        news = NewsModel.get_all_news()

        # Lọc tin tức hiển thị
        published = [n for n in news if NewsService.is_news_published(n.get("status"))]

        # Sắp xếp theo lượt xem (nếu có)
        # published.sort(key=lambda x: x.get("views", 0), reverse=True)

        return published[:limit]
