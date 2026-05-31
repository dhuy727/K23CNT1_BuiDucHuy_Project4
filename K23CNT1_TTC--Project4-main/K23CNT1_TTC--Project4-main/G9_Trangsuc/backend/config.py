# ==============================
# IMPORT THƯ VIỆN
# ==============================
from dotenv import load_dotenv
import os

# ==============================
# LOAD FILE .env
# ==============================
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_BASE_DIR, ".env"), override=True)

# ==============================
# CLASS CẤU HÌNH CHUNG
# ==============================
class Config:
    # Cấu hình Flask
    SECRET_KEY = os.getenv("SECRET_KEY")

    # Cấu hình Database
    DB_HOST = os.getenv("DB_HOST")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_NAME = os.getenv("DB_NAME")

    # Cấu hình JWT
    JWT_SECRET = os.getenv("JWT_SECRET")

    # Cấu hình PayPal
    PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
    PAYPAL_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")
    PAYPAL_BASE_URL = os.getenv("PAYPAL_BASE_URL")

    # Google OAuth
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://127.0.0.1:5000")