import os
import uuid
from flask import Flask, request, jsonify, send_from_directory, abort
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge
from flask_cors import CORS

# Flask app setup
app = Flask(__name__)
CORS(app=app)

# Configuration
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 10 * 1024 * 1024))  # 10 MB
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(e):
    return jsonify({"error": "File too large"}), 413


@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        # Generate a unique filename
        ext = file.filename.rsplit(".", 1)[1].lower()
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        safe_name = secure_filename(unique_name)

        filepath = os.path.join(app.config["UPLOAD_FOLDER"], safe_name)
        file.save(filepath)

        file_url = f"/files/{safe_name}"
        return jsonify({
            "message": "File uploaded successfully",
            "file_url": file_url
        }), 201

    return jsonify({"error": "Invalid file type"}), 400


@app.route("/files/<path:filename>")
def uploaded_file(filename):
    try:
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)
    except FileNotFoundError:
        abort(404, description="File not found")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5010)
