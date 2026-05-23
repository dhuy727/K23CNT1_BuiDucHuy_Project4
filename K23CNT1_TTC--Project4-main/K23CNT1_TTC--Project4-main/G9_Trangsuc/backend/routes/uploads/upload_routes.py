from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename
from middleware import require_auth

upload_bp = Blueprint(
    "upload_bp",
    __name__
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@upload_bp.route("/", methods=["POST"])
@require_auth
def upload_image():

    if "image" not in request.files:

        return jsonify({
            "success": False,
            "message": "Không tìm thấy ảnh"
        })

    image = request.files["image"]

    filepath = os.path.join(
        UPLOAD_FOLDER,
        secure_filename(image.filename)
    )

    image.save(filepath)

    return jsonify({

        "success": True,
        "filename": secure_filename(image.filename)

    })
