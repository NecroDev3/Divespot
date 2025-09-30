import uuid
from datetime import datetime
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy import CheckConstraint, func
from .db import db
from werkzeug.security import generate_password_hash, check_password_hash

def gen_uuid():
    return str(uuid.uuid4())

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    display_name = db.Column(db.String(100), nullable=False)
    bio = db.Column(db.Text)
    profile_image_url = db.Column(db.Text)
    location = db.Column(db.String(100))

    total_dives = db.Column(db.Integer, default=0)
    max_depth_achieved = db.Column(db.Integer, default=0)  # meters
    total_bottom_time = db.Column(db.Integer, default=0)   # minutes
    certification_level = db.Column(db.String(50), default="Open Water")
    favorite_spot_id = db.Column(db.String(36), db.ForeignKey("dive_spots.id"), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_active_at = db.Column(db.DateTime, default=datetime.utcnow)

    password_hash = db.Column(db.Text)
    email_verified = db.Column(db.Boolean, default=False)

    posts = db.relationship("DivePost", backref="user", cascade="all, delete-orphan")
    likes = db.relationship("PostLike", backref="user", cascade="all, delete-orphan")
    comments = db.relationship("PostComment", backref="user", cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class DiveSpot(db.Model):
    __tablename__ = "dive_spots"
    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    name = db.Column(db.String(100), nullable=False, index=True)
    description = db.Column(db.Text)

    latitude = db.Column(db.Float, nullable=False, index=True)
    longitude = db.Column(db.Float, nullable=False, index=True)
    address = db.Column(db.Text)

    max_depth = db.Column(db.Integer)  # meters

    difficulty = db.Column(db.String(15), nullable=False)  # CHECK below
    water_type = db.Column(db.String(15), nullable=False, default="Salt")  # CHECK below
    avg_visibility = db.Column(db.Integer)  # meters
    avg_temperature = db.Column(db.Integer)  # celsius

    created_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    total_dives_logged = db.Column(db.Integer, default=0)
    avg_rating = db.Column(db.Float, default=0.0)

    posts = db.relationship("DivePost", backref="spot", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("difficulty in ('Beginner','Intermediate','Advanced','Expert')", name="ck_spot_difficulty"),
        CheckConstraint("water_type in ('Salt','Fresh','Brackish')", name="ck_spot_watertype"),
    )

class DivePost(db.Model):
    __tablename__ = "dive_posts"
    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    dive_spot_id = db.Column(db.String(36), db.ForeignKey("dive_spots.id"), nullable=False, index=True)

    caption = db.Column(db.Text)
    image_urls = db.Column(JSON)  # list[str]

    dive_date = db.Column(db.Date, nullable=False, index=True)
    max_depth = db.Column(db.Integer, nullable=False, index=True)
    dive_duration = db.Column(db.Integer, nullable=False)
    visibility_quality = db.Column(db.String(15), nullable=False)  # CHECK below
    water_temp = db.Column(db.Integer)
    wind_conditions = db.Column(db.String(15), nullable=False)
    current_conditions = db.Column(db.String(15), nullable=False)

    sea_life = db.Column(JSON)     # list[str]
    buddy_names = db.Column(JSON)  # list[str]
    equipment = db.Column(JSON)    # list[str]
    notes = db.Column(db.Text)

    likes_count = db.Column(db.Integer, default=0)
    comments_count = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    dive_timestamp = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    likes = db.relationship("PostLike", backref="post", cascade="all, delete-orphan")
    comments = db.relationship("PostComment", backref="post", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("visibility_quality in ('Excellent','Good','Fair','Poor','Very Poor')", name="ck_post_visibility"),
        CheckConstraint("wind_conditions in ('Calm','Light','Moderate','Strong','Very Strong')", name="ck_post_wind"),
        CheckConstraint("current_conditions in ('None','Light','Moderate','Strong','Very Strong')", name="ck_post_current"),
    )

class PostLike(db.Model):
    __tablename__ = "post_likes"
    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id = db.Column(db.String(36), db.ForeignKey("dive_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    __table_args__ = (
        db.UniqueConstraint("user_id", "post_id", name="uq_like_user_post"),
    )

class PostComment(db.Model):
    __tablename__ = "post_comments"
    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id = db.Column(db.String(36), db.ForeignKey("dive_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Helper queries for counts (aggregations if needed)
def recalc_post_counts(post_id: str):
    """Recalculate likes_count and comments_count for a post."""
    like_count = db.session.query(db.func.count(PostLike.id)).filter_by(post_id=post_id).scalar()
    comment_count = db.session.query(db.func.count(PostComment.id)).filter_by(post_id=post_id).scalar()
    db.session.query(DivePost).filter_by(id=post_id).update({
        DivePost.likes_count: like_count,
        DivePost.comments_count: comment_count
    })
    db.session.commit()
