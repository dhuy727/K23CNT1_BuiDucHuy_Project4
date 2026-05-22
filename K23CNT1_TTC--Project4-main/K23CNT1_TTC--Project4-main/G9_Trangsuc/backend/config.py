# ==============================
# IMPORT THƯ VIỆN
# ==============================
from dotenv import load_dotenv
import os

# ==============================
# LOAD FILE .env
# ==============================
load_dotenv()

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