-- Enable FK in SQLite
PRAGMA foreign_keys = ON;

-- Users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    bio TEXT,
    profile_image_url TEXT,
    location TEXT,
    total_dives INTEGER DEFAULT 0,
    max_depth_achieved INTEGER DEFAULT 0,
    total_bottom_time INTEGER DEFAULT 0,
    certification_level TEXT DEFAULT 'Open Water',
    favorite_spot_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    password_hash TEXT,
    email_verified INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Dive Spots
CREATE TABLE IF NOT EXISTS dive_spots (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT,
    max_depth INTEGER,
    difficulty TEXT NOT NULL CHECK (difficulty in ('Beginner','Intermediate','Advanced','Expert')),
    water_type TEXT NOT NULL DEFAULT 'Salt' CHECK (water_type in ('Salt','Fresh','Brackish')),
    avg_visibility INTEGER,
    avg_temperature INTEGER,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_dives_logged INTEGER DEFAULT 0,
    avg_rating REAL DEFAULT 0.0,
    FOREIGN KEY(created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_dive_spots_location ON dive_spots(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_dive_spots_difficulty ON dive_spots(difficulty);
CREATE INDEX IF NOT EXISTS idx_dive_spots_created_by ON dive_spots(created_by);
CREATE INDEX IF NOT EXISTS idx_dive_spots_name ON dive_spots(name);

-- Dive Posts
CREATE TABLE IF NOT EXISTS dive_posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    dive_spot_id TEXT NOT NULL,
    caption TEXT,
    image_urls JSON,
    dive_date DATE NOT NULL,
    max_depth INTEGER NOT NULL,
    dive_duration INTEGER NOT NULL,
    visibility_quality TEXT NOT NULL CHECK (visibility_quality in ('Excellent','Good','Fair','Poor','Very Poor')),
    water_temp INTEGER,
    wind_conditions TEXT NOT NULL CHECK (wind_conditions in ('Calm','Light','Moderate','Strong','Very Strong')),
    current_conditions TEXT NOT NULL CHECK (current_conditions in ('None','Light','Moderate','Strong','Very Strong')),
    sea_life JSON,
    buddy_names JSON,
    equipment JSON,
    notes TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    dive_timestamp DATETIME NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(dive_spot_id) REFERENCES dive_spots(id)
);

CREATE INDEX IF NOT EXISTS idx_dive_posts_user_id ON dive_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_dive_posts_spot_id ON dive_posts(dive_spot_id);
CREATE INDEX IF NOT EXISTS idx_dive_posts_created_at ON dive_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_dive_posts_dive_date ON dive_posts(dive_date);
CREATE INDEX IF NOT EXISTS idx_dive_posts_visibility ON dive_posts(visibility_quality);
CREATE INDEX IF NOT EXISTS idx_dive_posts_depth ON dive_posts(max_depth);

-- Likes
CREATE TABLE IF NOT EXISTS post_likes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(post_id) REFERENCES dive_posts(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_created_at ON post_likes(created_at);

-- Comments
CREATE TABLE IF NOT EXISTS post_comments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(post_id) REFERENCES dive_posts(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at);
