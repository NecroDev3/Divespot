# DiveSpot MVP API (Flask + SQLite)

A minimal REST API for Cape Town diving community features: users, dive spots, posts, likes, and comments.

## Quick start

```bash
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# run migrations (creates DB and seeds system user + popular spots)
python manage.py migrate

# start the API
export FLASK_APP=app:create_app
flask run  # defaults to http://127.0.0.1:5000
Health
GET / → {"ok": true, "service": "DiveSpot API", "version": "mvp-1"}

Endpoints
Users
POST /api/users → create user

GET /api/users?limit=&offset= → list users

GET /api/users/<id> → get user

PUT/PATCH /api/users/<id> → update user

DELETE /api/users/<id> → delete user

Dive Spots
POST /api/spots → create spot

GET /api/spots?name=&difficulty=&limit=&offset= → list/filter spots

GET /api/spots/search?q=&limit=&offset= → text search (name/description)

GET /api/spots/<id> → get spot

PUT/PATCH /api/spots/<id> → update spot

DELETE /api/spots/<id> → delete spot

Posts
POST /api/posts → create post (also updates user stats & spot total_dives_logged)

GET /api/posts?user_id=&spot_id=&limit=&offset= → list posts

GET /api/posts/<id> → get post

PUT/PATCH /api/posts/<id> → update post

DELETE /api/posts/<id> → delete post

Feed
GET /api/feed?limit=&offset= → recent posts

Likes
POST /api/posts/<post_id>/like { "user_id": "<uuid>" } → like (idempotent)

POST /api/posts/<post_id>/unlike { "user_id": "<uuid>" } → unlike

GET /api/posts/<post_id>/likes?limit=&offset= → list likes

Comments
POST /api/posts/<post_id>/comments → create comment

GET /api/posts/<post_id>/comments?limit=&offset= → list comments

PUT/PATCH /api/comments/<id> → update comment

DELETE /api/comments/<id> → delete comment

JSON examples
Create user

json
Copy code
POST /api/users
{
  "username": "diver1",
  "email": "diver1@example.com",
  "display_name": "Diver One",
  "certification_level": "Advanced Open Water"
}
Create post

json
Copy code
POST /api/posts
{
  "user_id": "00000000-0000-0000-0000-000000000001",
  "dive_spot_id": "11111111-1111-1111-1111-111111111111",
  "caption": "Great viz today!",
  "image_urls": ["https://example.com/img1.jpg"],
  "dive_date": "2025-08-30",
  "max_depth": 18,
  "dive_duration": 42,
  "visibility_quality": "Good",
  "water_temp": 15,
  "wind_conditions": "Light",
  "current_conditions": "Moderate",
  "sea_life": ["pyjama shark","seal"],
  "buddy_names": ["Alex","Sam"],
  "equipment": ["5mm wetsuit","GoPro"],
  "notes": "Kelp nice and calm"
}