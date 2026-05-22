# ==============================
# HÀM TRẢ RESPONSE THÀNH CÔNG
# ==============================
def success_response(message, data=None):
    return {
        "success": True,
        "message": message,
        "data": data
    }

# ==============================
# HÀM TRẢ RESPONSE THẤT BẠI
# ==============================
def error_response(message):
    return {
        "success": False,
        "message": message
    }