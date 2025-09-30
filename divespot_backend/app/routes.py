from flask import Blueprint, request, jsonify, abort
from sqlalchemy.exc import IntegrityError
from datetime import datetime, date
from .db import db
from .models import User, DiveSpot, DivePost, PostLike, PostComment, recalc_post_counts
from .utils import parse_date, parse_datetime, paginated_query
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import re
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

api_bp = Blueprint("api", __name__)

# ----------- Auth -----------

@api_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    username = data.get("username", None)
    password = data.get("password", None)

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token)

    return jsonify({"msg": "Bad username or password"}), 401

# ----------- helpers -----------

def normalize_image_url(url):
    """
    Convert image URLs to use the proxy endpoint for cross-network compatibility.
    This allows all clients to access images regardless of the original upload network.
    """
    if not url:
        return url
    
    # Extract filename from various image service URL formats
    pattern = r'http://[^/]+:5010/files/(.+)'
    match = re.search(pattern, url)
    
    if match:
        filename = match.group(1)
        # Return proxy URL that works for all clients
        return f"/api/images/{filename}"
    
    return url

def normalize_image_urls_in_list(urls):
    """Normalize a list of image URLs"""
    if not urls:
        return urls
    return [normalize_image_url(url) for url in urls]

def model_to_dict_user(u: User):
    return {
        "id": u.id,
        "username": u.username,
        "email": u.email,
        "display_name": u.display_name,
        "bio": u.bio,
        "profile_image_url": u.profile_image_url,
        "location": u.location,
        "total_dives": u.total_dives,
        "max_depth_achieved": u.max_depth_achieved,
        "total_bottom_time": u.total_bottom_time,
        "certification_level": u.certification_level,
        "favorite_spot_id": u.favorite_spot_id,
        "created_at": u.created_at.isoformat() if u.created_at else None,
        "updated_at": u.updated_at.isoformat() if u.updated_at else None,
        "last_active_at": u.last_active_at.isoformat() if u.last_active_at else None,
        "email_verified": u.email_verified,
    }

def model_to_dict_spot(s: DiveSpot):
    return {
        "id": s.id,
        "name": s.name,
        "description": s.description,
        "latitude": s.latitude,
        "longitude": s.longitude,
        "address": s.address,
        "max_depth": s.max_depth,
        "difficulty": s.difficulty,
        "water_type": s.water_type,
        "avg_visibility": s.avg_visibility,
        "avg_temperature": s.avg_temperature,
        "created_by": s.created_by,
        "created_at": s.created_at.isoformat() if s.created_at else None,
        "updated_at": s.updated_at.isoformat() if s.updated_at else None,
        "total_dives_logged": s.total_dives_logged,
        "avg_rating": s.avg_rating,
    }

def model_to_dict_post(p: DivePost):
    return {
        "id": p.id,
        "user_id": p.user_id,
        "dive_spot_id": p.dive_spot_id,
        "caption": p.caption,
        "image_urls": normalize_image_urls_in_list(p.image_urls or []),
        "dive_date": p.dive_date.isoformat() if p.dive_date else None,
        "max_depth": p.max_depth,
        "dive_duration": p.dive_duration,
        "visibility_quality": p.visibility_quality,
        "water_temp": p.water_temp,
        "wind_conditions": p.wind_conditions,
        "current_conditions": p.current_conditions,
        "sea_life": p.sea_life or [],
        "buddy_names": p.buddy_names or [],
        "equipment": p.equipment or [],
        "notes": p.notes,
        "likes_count": p.likes_count,
        "comments_count": p.comments_count,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "dive_timestamp": p.dive_timestamp.isoformat() if p.dive_timestamp else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }

def model_to_dict_comment(c: PostComment):
    return {
        "id": c.id,
        "user_id": c.user_id,
        "post_id": c.post_id,
        "content": c.content,
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "updated_at": c.updated_at.isoformat() if c.updated_at else None,
    }

# ----------- Authentication -----------

@api_bp.route("/auth/login", methods=["POST"])
def login_user():
    data = request.get_json(force=True)
    
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return {"error": "Email and password are required"}, 400
    
    # Find user by email
    user = User.query.filter_by(email=email).first()
    if not user:
        return {"error": "Invalid email or password"}, 401
    
    # For MVP, we'll do simple password check (in production, use proper password hashing)
    if user.password_hash != password:
        return {"error": "Invalid email or password"}, 401
    
    # Update last active time
    user.last_active_at = datetime.utcnow()
    db.session.commit()
    
    return model_to_dict_user(user), 200

# ----------- Users -----------

@api_bp.route("/users", methods=["POST"])
def create_user():
    data = request.get_json(force=True)
    try:
        user = User(
            username=data["username"],
            email=data["email"],
            display_name=data.get("display_name") or data["username"],
            bio=data.get("bio"),
            profile_image_url=data.get("profile_image_url"),
            location=data.get("location"),
            certification_level=data.get("certification_level", "Open Water"),
            favorite_spot_id=data.get("favorite_spot_id"),
            email_verified=bool(data.get("email_verified", False)),
        )
        user.set_password(data["password"])
        db.session.add(user)
        db.session.commit()
        return model_to_dict_user(user), 201
    except IntegrityError:
        db.session.rollback()
        return {"error": "username or email already exists"}, 400

@api_bp.route("/users", methods=["GET"])
@jwt_required()
def list_users():
    q = User.query.order_by(User.created_at.desc())
    items, meta = paginated_query(q)
    return {"data": [model_to_dict_user(u) for u in items], "meta": meta}

@api_bp.route("/users/<user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    u = User.query.get_or_404(user_id)
    return model_to_dict_user(u)

@api_bp.route("/users/<user_id>", methods=["PUT", "PATCH"])
@jwt_required()
def update_user(user_id):
    u = User.query.get(user_id)
    data = request.get_json(force=True)
    
    # If user doesn't exist, create a new one (upsert behavior)
    if u is None:
        try:
            # Generate default values for required fields if not provided
            username = data.get("username", f"user_{user_id[:8]}")
            email = data.get("email", f"{user_id}@local.user")
            display_name = data.get("display_name", username)
            
            u = User(
                id=user_id,
                username=username,
                email=email,
                display_name=display_name,
                bio=data.get("bio"),
                profile_image_url=data.get("profile_image_url"),
                location=data.get("location"),
                certification_level=data.get("certification_level", "Open Water"),
                favorite_spot_id=data.get("favorite_spot_id"),
                email_verified=bool(data.get("email_verified", False)),
            )
            db.session.add(u)
        except IntegrityError:
            db.session.rollback()
            return {"error": "Failed to create user - username or email conflict"}, 400
    else:
        # Update existing user
        for field in [
            "username","email","display_name","bio","profile_image_url","location",
            "certification_level","favorite_spot_id","email_verified"
        ]:
            if field in data:
                setattr(u, field, data[field])
    
    u.updated_at = datetime.utcnow()
    db.session.commit()
    return model_to_dict_user(u)

@api_bp.route("/users/<user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    u = User.query.get_or_404(user_id)
    db.session.delete(u)
    db.session.commit()
    return {"deleted": True}

# ----------- Dive Spots -----------

@api_bp.route("/spots", methods=["POST"])
@jwt_required()
def create_spot():
    data = request.get_json(force=True)
    
    # Check if the user exists, if not create a system user or use fallback
    created_by_user_id = data.get("created_by", "system")
    user_exists = User.query.filter_by(id=created_by_user_id).first()
    
    if not user_exists and created_by_user_id != "system":
        # Create a basic user record for Google OAuth users
        try:
            new_user = User(
                id=created_by_user_id,
                username=f"user_{created_by_user_id[:8]}",
                email=f"{created_by_user_id}@google.oauth",
                display_name="Google User",
                location="Unknown",
                certification_level="Open Water"
            )
            db.session.add(new_user)
            db.session.flush()  # Flush to get the user created before creating the spot
        except Exception as e:
            print(f"Failed to create user, using system fallback: {e}")
            created_by_user_id = "system"
    
    # Create a system user if it doesn't exist
    if created_by_user_id == "system":
        system_user = User.query.filter_by(id="system").first()
        if not system_user:
            system_user = User(
                id="system",
                username="system",
                email="system@divespot.app",
                display_name="System",
                location="System",
                certification_level="Instructor"
            )
            db.session.add(system_user)
            db.session.flush()
    
    spot = DiveSpot(
        name=data["name"],
        description=data.get("description"),
        latitude=float(data["latitude"]),
        longitude=float(data["longitude"]),
        address=data.get("address"),
        max_depth=data.get("max_depth"),
        difficulty=data["difficulty"],
        water_type=data.get("water_type", "Salt"),
        avg_visibility=data.get("avg_visibility"),
        avg_temperature=data.get("avg_temperature"),
        created_by=created_by_user_id,
    )
    db.session.add(spot)
    db.session.commit()
    return model_to_dict_spot(spot), 201

@api_bp.route("/spots", methods=["GET"])
@jwt_required()
def list_spots():
    q = DiveSpot.query
    # optional filters
    name = request.args.get("name")
    difficulty = request.args.get("difficulty")
    if name:
        q = q.filter(DiveSpot.name.ilike(f"%{name}%"))
    if difficulty:
        q = q.filter(DiveSpot.difficulty == difficulty)
    q = q.order_by(DiveSpot.created_at.desc())
    items, meta = paginated_query(q)
    return {"data": [model_to_dict_spot(s) for s in items], "meta": meta}

@api_bp.route("/spots/search", methods=["GET"])
@jwt_required()
def search_spots():
    qstr = request.args.get("q", "")
    q = DiveSpot.query.filter(
        (DiveSpot.name.ilike(f"%{qstr}%")) | (DiveSpot.description.ilike(f"%{qstr}%"))
    ).order_by(DiveSpot.name.asc())
    items, meta = paginated_query(q)
    return {"data": [model_to_dict_spot(s) for s in items], "meta": meta}

@api_bp.route("/spots/<spot_id>", methods=["GET"])
@jwt_required()
def get_spot(spot_id):
    s = DiveSpot.query.get_or_404(spot_id)
    return model_to_dict_spot(s)

@api_bp.route("/spots/<spot_id>", methods=["PUT", "PATCH"])
@jwt_required()
def update_spot(spot_id):
    s = DiveSpot.query.get_or_404(spot_id)
    data = request.get_json(force=True)

    for field in ["name","description","address","max_depth","difficulty","water_type","avg_visibility","avg_temperature","created_by"]:
        if field in data:
            setattr(s, field, data[field])

    for field in ["latitude","longitude"]:
        if field in data and data[field] is not None:
            setattr(s, field, float(data[field]))

    s.updated_at = datetime.utcnow()
    db.session.commit()
    return model_to_dict_spot(s)

@api_bp.route("/spots/<spot_id>", methods=["DELETE"])
@jwt_required()
def delete_spot(spot_id):
    s = DiveSpot.query.get_or_404(spot_id)
    db.session.delete(s)
    db.session.commit()
    return {"deleted": True}

# ----------- Posts -----------

@api_bp.route("/posts", methods=["POST"])
@jwt_required()
def create_post():
    data = request.get_json(force=True)
    post = DivePost(
        user_id=data["user_id"],
        dive_spot_id=data["dive_spot_id"],
        caption=data.get("caption"),
        image_urls=data.get("image_urls") or [],
        dive_date=parse_date(data["dive_date"]),
        max_depth=int(data["max_depth"]),
        dive_duration=int(data["dive_duration"]),
        visibility_quality=data["visibility_quality"],
        water_temp=data.get("water_temp"),
        wind_conditions=data["wind_conditions"],
        current_conditions=data["current_conditions"],
        sea_life=data.get("sea_life") or [],
        buddy_names=data.get("buddy_names") or [],
        equipment=data.get("equipment") or [],
        notes=data.get("notes"),
        dive_timestamp=parse_datetime(data.get("dive_timestamp") or datetime.utcnow().isoformat())
    )
    db.session.add(post)

    # Update user stats and spot total_dives_logged
    user = User.query.get(post.user_id)
    if user:
        user.total_dives = (user.total_dives or 0) + 1
        user.total_bottom_time = (user.total_bottom_time or 0) + post.dive_duration
        user.max_depth_achieved = max(user.max_depth_achieved or 0, post.max_depth or 0)
        user.last_active_at = datetime.utcnow()

    spot = DiveSpot.query.get(post.dive_spot_id)
    if spot:
        spot.total_dives_logged = (spot.total_dives_logged or 0) + 1
        spot.updated_at = datetime.utcnow()

    db.session.commit()
    return model_to_dict_post(post), 201

@api_bp.route("/posts", methods=["GET"])
@jwt_required()
def list_posts():
    q = DivePost.query
    # filters
    user_id = request.args.get("user_id")
    spot_id = request.args.get("spot_id")
    if user_id:
        q = q.filter(DivePost.user_id == user_id)
    if spot_id:
        q = q.filter(DivePost.dive_spot_id == spot_id)
    q = q.order_by(DivePost.created_at.desc())
    items, meta = paginated_query(q)
    return {"data": [model_to_dict_post(p) for p in items], "meta": meta}

@api_bp.route("/posts/<post_id>", methods=["GET"])
@jwt_required()
def get_post(post_id):
    p = DivePost.query.get_or_404(post_id)
    return model_to_dict_post(p)

@api_bp.route("/posts/<post_id>", methods=["PUT", "PATCH"])
@jwt_required()
def update_post(post_id):
    p = DivePost.query.get_or_404(post_id)
    data = request.get_json(force=True)
    for field in ["caption","visibility_quality","water_temp","wind_conditions","current_conditions","sea_life","buddy_names","equipment","notes","image_urls","dive_duration","max_depth"]:
        if field in data:
            setattr(p, field, data[field])
    if "dive_date" in data and data["dive_date"]:
        p.dive_date = parse_date(data["dive_date"])
    if "dive_timestamp" in data and data["dive_timestamp"]:
        p.dive_timestamp = parse_datetime(data["dive_timestamp"])
    p.updated_at = datetime.utcnow()
    db.session.commit()
    return model_to_dict_post(p)

@api_bp.route("/posts/<post_id>", methods=["DELETE"])
@jwt_required()
def delete_post(post_id):
    p = DivePost.query.get_or_404(post_id)
    db.session.delete(p)
    db.session.commit()
    return {"deleted": True}

# Feed (recent 30 days default order by created_at desc)
@api_bp.route("/feed", methods=["GET"])
@jwt_required()
def feed():
    q = DivePost.query.order_by(DivePost.created_at.desc())
    items, meta = paginated_query(q, default_limit=20)
    
    # Enrich posts with user and dive spot information
    enriched_posts = []
    for post in items:
        post_dict = model_to_dict_post(post)
        
        # Add user information
        user = User.query.get(post.user_id)
        if user:
            post_dict["user"] = model_to_dict_user(user)
        
        # Add dive spot information
        spot = DiveSpot.query.get(post.dive_spot_id)
        if spot:
            post_dict["dive_spot"] = model_to_dict_spot(spot)
        
        enriched_posts.append(post_dict)
    
    return {"data": enriched_posts, "meta": meta}

# ----------- Likes -----------

@api_bp.route("/posts/<post_id>/like", methods=["POST"])
@jwt_required()
def like_post(post_id):
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")
    if not user_id:
        return {"error": "user_id required"}, 400
    # idempotent-ish: catch duplicate unique constraint
    like = PostLike(user_id=user_id, post_id=post_id)
    db.session.add(like)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        # already liked — treat as success
    # update counts
    recalc_post_counts(post_id)
    return {"liked": True, "post_id": post_id}

@api_bp.route("/posts/<post_id>/unlike", methods=["POST"])
@jwt_required()
def unlike_post(post_id):
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")
    if not user_id:
        return {"error": "user_id required"}, 400
    PostLike.query.filter_by(user_id=user_id, post_id=post_id).delete()
    db.session.commit()
    recalc_post_counts(post_id)
    return {"unliked": True, "post_id": post_id}

@api_bp.route("/posts/<post_id>/likes", methods=["GET"])
@jwt_required()
def list_likes(post_id):
    q = PostLike.query.filter_by(post_id=post_id).order_by(PostLike.created_at.desc())
    items, meta = paginated_query(q)
    return {
        "data": [{"id": l.id, "user_id": l.user_id, "post_id": l.post_id, "created_at": l.created_at.isoformat()} for l in items],
        "meta": meta
    }

# ----------- Comments -----------

@api_bp.route("/posts/<post_id>/comments", methods=["POST"])
@jwt_required()
def create_comment(post_id):
    data = request.get_json(force=True)
    if not data.get("user_id") or not data.get("content"):
        return {"error": "user_id and content are required"}, 400
    c = PostComment(user_id=data["user_id"], post_id=post_id, content=data["content"])
    db.session.add(c)
    db.session.commit()
    recalc_post_counts(post_id)
    return model_to_dict_comment(c), 201

@api_bp.route("/posts/<post_id>/comments", methods=["GET"])
@jwt_required()
def list_comments(post_id):
    q = PostComment.query.filter_by(post_id=post_id).order_by(PostComment.created_at.asc())
    items, meta = paginated_query(q, default_limit=50)
    return {"data": [model_to_dict_comment(c) for c in items], "meta": meta}

@api_bp.route("/comments/<comment_id>", methods=["PUT", "PATCH"])
@jwt_required()
def update_comment(comment_id):
    c = PostComment.query.get_or_404(comment_id)
    data = request.get_json(force=True)
    if "content" in data:
        c.content = data["content"]
        c.updated_at = datetime.utcnow()
        db.session.commit()
    return model_to_dict_comment(c)

@api_bp.route("/comments/<comment_id>", methods=["DELETE"])
@jwt_required()
def delete_comment(comment_id):
    c = PostComment.query.get_or_404(comment_id)
    post_id = c.post_id
    db.session.delete(c)
    db.session.commit()
    recalc_post_counts(post_id)
    return {"deleted": True}

# ----------- Image Proxy -----------

@api_bp.route("/images/<path:image_path>", methods=["GET"])
def proxy_image(image_path):
    """
    Proxy images from the image service to handle cross-network access.
    This allows iOS simulator to access images uploaded from different networks.
    """
    import requests
    from flask import Response
    
    # Try different possible image service URLs
    possible_urls = [
        f"http://localhost:5010/files/{image_path}",
        f"http://192.168.50.210:5010/files/{image_path}",
        f"http://192.168.50.79:5010/files/{image_path}",
        f"http://127.0.0.1:5010/files/{image_path}"
    ]
    
    for url in possible_urls:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                return Response(
                    response.content,
                    content_type=response.headers.get('content-type', 'image/jpeg'),
                    headers={
                        'Cache-Control': 'public, max-age=31536000',  # Cache for 1 year
                        'Access-Control-Allow-Origin': '*'
                    }
                )
        except requests.RequestException:
            continue
    
    # If no URL worked, return 404
    abort(404, description="Image not found")
