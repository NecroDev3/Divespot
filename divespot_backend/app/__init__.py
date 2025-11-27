from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from datetime import timedelta
import os

from .db import db, init_sqlite_pragma
from .routes import api_bp


def create_app():
    app = Flask(__name__)
    
    # Load environment variables
    flask_env = os.getenv('FLASK_ENV', 'development')
    
    # Database Configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        'DATABASE_URI', 
        'sqlite:///dive_spot.db'
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JSON_SORT_KEYS"] = False
    
    # JWT Configuration - Use environment variable or fallback to default
    jwt_secret = os.getenv('JWT_SECRET_KEY')
    if not jwt_secret:
        if flask_env == 'production':
            raise ValueError("JWT_SECRET_KEY must be set in production!")
        jwt_secret = "dev-secret-key-change-in-production"
        print("⚠️  WARNING: Using default JWT secret key. Set JWT_SECRET_KEY environment variable!")
    
    app.config["JWT_SECRET_KEY"] = jwt_secret
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(
        hours=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES_HOURS', 1))
    )
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(
        days=int(os.getenv('JWT_REFRESH_TOKEN_EXPIRES_DAYS', 30))
    )

    # CORS Configuration
    cors_origins = os.getenv('CORS_ORIGINS', '*')
    CORS(app, origins=cors_origins, supports_credentials=True)

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