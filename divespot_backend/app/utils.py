from datetime import datetime, date
from flask import request

def parse_date(s):
    if not s:
        return None
    # Accept YYYY-MM-DD
    return datetime.strptime(s, "%Y-%m-%d").date()

def parse_datetime(s):
    if not s:
        return None
    # Accept ISO8601 or "YYYY-MM-DD HH:MM:SS"
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception:
        return datetime.strptime(s, "%Y-%m-%d %H:%M:%S")

def paginated_query(query, default_limit=20, max_limit=100):
    try:
        limit = int(request.args.get("limit", default_limit))
    except ValueError:
        limit = default_limit
    limit = max(1, min(limit, max_limit))

    try:
        offset = int(request.args.get("offset", 0))
    except ValueError:
        offset = 0
    offset = max(0, offset)

    items = query.limit(limit).offset(offset).all()
    return items, {"limit": limit, "offset": offset}
