# ==============================
# FILE: services/review_service.py
# CHỨC NĂNG:
# - Quản lý đánh giá sản phẩm
# - Tính rating trung bình
# - Validate đánh giá
# ==============================

from models.review_model import ReviewModel


class ReviewService:
    # ==============================
    # VALIDATE SỐ SAO
    # ==============================
    @staticmethod
    def validate_rating(rating):
        """Kiểm tra số sao có hợp lệ (1-5)"""
        if not isinstance(rating, (int, float)):
            raise ValueError("Số sao phải là số")

        if rating < 1 or rating > 5:
            raise ValueError("Số sao phải từ 1 đến 5")

        return True

    # ==============================
    # VALIDATE NỘILEVEL ĐÁNH GIÁ
    # ==============================
    @staticmethod
    def validate_review_content(content):
        """Kiểm tra nội dung đánh giá"""
        if not content or len(content.strip()) == 0:
            raise ValueError("Nội dung đánh giá không được trống")

        if len(content) < 10:
            raise ValueError("Nội dung đánh giá tối thiểu 10 ký tự")

        if len(content) > 1000:
            raise ValueError("Nội dung đánh giá tối đa 1000 ký tự")

        return True

    # ==============================
    # TÍNH RATING TRUNG BÌNH
    # ==============================
    @staticmethod
    def calculate_average_rating(reviews):
        """Tính rating trung bình từ danh sách đánh giá"""
        if not reviews or len(reviews) == 0:
            return 0

        total_rating = sum([r.get("rating", 0) for r in reviews])
        avg = total_rating / len(reviews)

        return round(avg, 1)

    # ==============================
    # PHÂN LOẠI ĐÁNH GIÁ THEO SAO
    # ==============================
    @staticmethod
    def categorize_reviews_by_rating(reviews):
        """Phân loại đánh giá theo số sao"""
        categories = {1: [], 2: [], 3: [], 4: [], 5: []}

        for review in reviews:
            rating = review.get("rating", 0)
            if rating in categories:
                categories[rating].append(review)

        return categories

    # ==============================
    # TÍNH PHẦN TRĂM ĐÁNH GIÁ
    # ==============================
    @staticmethod
    def get_rating_statistics(reviews):
        """
        Lấy thống kê đánh giá
        Trả về: % đánh giá từ 1 sao đến 5 sao
        """
        if not reviews or len(reviews) == 0:
            return {}

        total = len(reviews)
        categories = ReviewService.categorize_reviews_by_rating(reviews)

        stats = {}
        for rating, items in categories.items():
            percent = (len(items) / total) * 100
            stats[f"{rating}_star"] = {
                "count": len(items),
                "percent": round(percent, 1)
            }

        stats["average"] = ReviewService.calculate_average_rating(reviews)
        stats["total"] = total

        return stats

    # ==============================
    # LỌC ĐÁNH GIÁ THEO SAO
    # ==============================
    @staticmethod
    def filter_reviews_by_rating(reviews, rating):
        """Lọc đánh giá theo số sao"""
        return [r for r in reviews if r.get("rating") == rating]

    # ==============================
    # SẮP XẾP ĐÁNH GIÁ
    # ==============================
    @staticmethod
    def sort_reviews(reviews, sort_by="newest"):
        """
        Sắp xếp đánh giá
        sort_by: "newest", "oldest", "highest", "lowest"
        """
        if sort_by == "newest":
            return sorted(reviews, key=lambda x: x.get("created_at", ""), reverse=True)

        elif sort_by == "oldest":
            return sorted(reviews, key=lambda x: x.get("created_at", ""))

        elif sort_by == "highest":
            return sorted(reviews, key=lambda x: x.get("rating", 0), reverse=True)

        elif sort_by == "lowest":
            return sorted(reviews, key=lambda x: x.get("rating", 0))

        return reviews

    # ==============================
    # KIỂM TRA REVIEW CÓ HỮUICH KHÔNG
    # ==============================
    @staticmethod
    def is_review_helpful(helpful_count, total_views):
        """Kiểm tra đánh giá có hữu ích dựa trên % lượt thích"""
        if total_views == 0:
            return False

        helpful_percent = (helpful_count / total_views) * 100
        return helpful_percent >= 50
