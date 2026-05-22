# ==============================
# FILE: database/db.py
# CHỨC NĂNG:
# - Kết nối SQL Server
# - Chuyển dữ liệu SQL sang dạng dict/json
# ==============================

import pyodbc
import os
from dotenv import load_dotenv

# Load biến môi trường trong file .env
load_dotenv()


# ==============================
# HÀM KẾT NỐI DATABASE
# ==============================
def get_connection():
    conn = pyodbc.connect(
        r"DRIVER={ODBC Driver 17 for SQL Server};"
        r"SERVER=DESKTOP-OBG50HB\SQLEXPRESS;"
        r"DATABASE=G9_TrangSucDB;"
        r"Trusted_Connection=yes;"
        r"TrustServerCertificate=yes;"
    )

    return conn


# ==============================
# CHUYỂN NHIỀU DÒNG -> LIST DICT
# ==============================
def rows_to_dict(cursor):
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


# ==============================
# CHUYỂN 1 DÒNG -> DICT
# ==============================
def row_to_dict(cursor):
    columns = [col[0] for col in cursor.description]
    row = cursor.fetchone()

    if row:
        return dict(zip(columns, row))

    return None
