from flask import Blueprint, request, jsonify
import os

upload_bp = Blueprint(
    "upload_bp",
    __name__
)

UPLOAD_FOLDER = "uploads"

@upload_bp.route("/", methods=["POST"])
def upload_image():

    if "image" not in request.files:

        return jsonify({
            "success": False,
            "message": "Không tìm thấy ảnh"
        })

    image = request.files["image"]

    filepath = os.path.join(
        UPLOAD_FOLDER,
        image.filename
    )

    image.save(filepath)

    return jsonify({

        "success": True,
        "filename": image.filename

    })