from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from .db import db, init_sqlite_pragma
from .routes import api_bp


def create_app():
    app = Flask(__name__)
    # SQLite URL — file db in project root
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///dive_spot.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JSON_SORT_KEYS"] = False

    # Enable CORS for all routes - completely open for development
    CORS(app, origins="*", supports_credentials=True)
    app.config["JWT_SECRET_KEY"] = "super-secret"  # Change this in your production app!

    db.init_app(app)
    init_sqlite_pragma(app)

    # Setup the Flask-JWT-Extended extension
    jwt = JWTManager(app)

    # Ensure tables are created
    with app.app_context():
        db.create_all()

    # register blueprints
    app.register_blueprint(api_bp, url_prefix="/api")

    @app.route("/")
    def root():
        return {"ok": True, "service": "DiveSpot API", "version": "mvp-1"}

    return app

#/if __name__ == "__main__": app = create_app() app.run(debug=True, port=5000, host="0.0.0.0")