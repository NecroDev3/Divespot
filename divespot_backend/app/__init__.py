from flask import Flask
from .db import db, init_sqlite_pragma
from .routes import api_bp

def create_app():
    app = Flask(__name__)
    # SQLite URL — file db in project root
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///dive_spot.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JSON_SORT_KEYS"] = False

    db.init_app(app)
    init_sqlite_pragma(app)

    # register blueprints
    app.register_blueprint(api_bp, url_prefix="/api")

    @app.route("/")
    def root():
        return {"ok": True, "service": "DiveSpot API", "version": "mvp-1"}

    return app
