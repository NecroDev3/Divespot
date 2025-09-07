-- DiveSpot MVP Database Schema
-- Cape Town Diving Community Platform

-- ================================
-- USERS / PROFILES TABLE
-- ================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    profile_image_url TEXT,
    location VARCHAR(100),
    
    -- User diving statistics
    total_dives INTEGER DEFAULT 0,
    max_depth_achieved INTEGER DEFAULT 0, -- in meters
    total_bottom_time INTEGER DEFAULT 0, -- in minutes
    certification_level VARCHAR(50) DEFAULT 'Open Water',
    favorite_spot_id UUID, -- FK to dive_spots
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Authentication (if handling auth in-app)
    password_hash TEXT, -- Only if not using external auth (Firebase, etc.)
    email_verified BOOLEAN DEFAULT FALSE,
    
    -- Indexes for performance
    INDEX idx_users_username (username),
    INDEX idx_users_email (email),
    INDEX idx_users_created_at (created_at)
);

-- ================================
-- DIVE SPOTS / PLACES TABLE  
-- ================================
CREATE TABLE dive_spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Location data
    latitude DECIMAL(10, 8) NOT NULL, -- Cape Town coordinates
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    
    -- Dive site characteristics
    max_depth INTEGER, -- in meters
    difficulty ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') NOT NULL,
    water_type ENUM('Salt', 'Fresh', 'Brackish') NOT NULL DEFAULT 'Salt',
    avg_visibility INTEGER, -- in meters
    avg_temperature INTEGER, -- in celsius
    
    -- Meta data
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Popular spots tracking
    total_dives_logged INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0.0,
    
    -- Indexes for performance
    INDEX idx_dive_spots_location (latitude, longitude),
    INDEX idx_dive_spots_difficulty (difficulty),
    INDEX idx_dive_spots_created_by (created_by),
    INDEX idx_dive_spots_name (name)
);

-- ================================
-- DIVE POSTS TABLE
-- ================================
CREATE TABLE dive_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dive_spot_id UUID NOT NULL REFERENCES dive_spots(id),
    
    -- Post content
    caption TEXT,
    image_urls TEXT[], -- Array of image URLs
    
    -- Dive details (Cape Town specific conditions)
    dive_date DATE NOT NULL,
    max_depth INTEGER NOT NULL, -- in meters
    dive_duration INTEGER NOT NULL, -- in minutes
    visibility_quality ENUM('Excellent', 'Good', 'Fair', 'Poor', 'Very Poor') NOT NULL,
    water_temp INTEGER, -- in celsius
    wind_conditions ENUM('Calm', 'Light', 'Moderate', 'Strong', 'Very Strong') NOT NULL,
    current_conditions ENUM('None', 'Light', 'Moderate', 'Strong', 'Very Strong') NOT NULL,
    
    -- Marine life and companions
    sea_life TEXT[], -- Array of marine species observed
    buddy_names TEXT[], -- Array of dive buddy names
    equipment TEXT[], -- Array of equipment used
    notes TEXT,
    
    -- Social metrics
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When post was created
    dive_timestamp TIMESTAMP WITH TIME ZONE NOT NULL, -- When dive was recorded/logged
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_dive_posts_user_id (user_id),
    INDEX idx_dive_posts_spot_id (dive_spot_id),
    INDEX idx_dive_posts_created_at (created_at),
    INDEX idx_dive_posts_dive_date (dive_date),
    INDEX idx_dive_posts_visibility (visibility_quality),
    INDEX idx_dive_posts_depth (max_depth)
);

-- ================================
-- LIKES TABLE (Social Feature)
-- ================================
CREATE TABLE post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES dive_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate likes
    UNIQUE(user_id, post_id),
    
    -- Indexes for performance
    INDEX idx_post_likes_user_id (user_id),
    INDEX idx_post_likes_post_id (post_id),
    INDEX idx_post_likes_created_at (created_at)
);

-- ================================
-- COMMENTS TABLE (Social Feature)
-- ================================
CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES dive_posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_post_comments_user_id (user_id),
    INDEX idx_post_comments_post_id (post_id),
    INDEX idx_post_comments_created_at (created_at)
);

-- ================================
-- TRIGGERS FOR COUNTER UPDATES
-- ================================

-- Update likes count on dive_posts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE dive_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE dive_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_likes_count
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_likes_count();

-- Update comments count on dive_posts
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE dive_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE dive_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_comments_count
    AFTER INSERT OR DELETE ON post_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_comments_count();

-- Update user diving stats when posts are added
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users SET 
            total_dives = total_dives + 1,
            total_bottom_time = total_bottom_time + NEW.dive_duration,
            max_depth_achieved = GREATEST(max_depth_achieved, NEW.max_depth)
        WHERE id = NEW.user_id;
        
        -- Update dive spot stats
        UPDATE dive_spots SET 
            total_dives_logged = total_dives_logged + 1
        WHERE id = NEW.dive_spot_id;
        
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT ON dive_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- ================================
-- SEED DATA: Cape Town Dive Spots
-- ================================

-- Insert popular Cape Town dive spots
INSERT INTO dive_spots (name, description, latitude, longitude, address, max_depth, difficulty, water_type, avg_visibility, avg_temperature, created_by) VALUES
-- Note: You'll need to replace 'system-user-id' with an actual system user ID
('Two Oceans Aquarium', 'Perfect for beginners with excellent visibility and diverse marine life', -33.9028, 18.4201, 'V&A Waterfront, Cape Town', 12, 'Beginner', 'Salt', 15, 16, 'system-user-id'),
('Seal Island', 'Famous for Great White shark cage diving and seal colonies', -34.1369, 18.5819, 'False Bay, Cape Town', 25, 'Intermediate', 'Salt', 10, 18, 'system-user-id'),
('Atlantis Reef', 'Pristine reef system with incredible kelp forests', -33.8567, 18.3026, 'Atlantic Seaboard, Cape Town', 20, 'Intermediate', 'Salt', 12, 15, 'system-user-id'),
('Castle Rock', 'Dramatic underwater topography with caves and swim-throughs', -34.3578, 18.4678, 'Cape Peninsula, Cape Town', 30, 'Advanced', 'Salt', 8, 14, 'system-user-id'),
('Windmill Beach', 'Shore diving with beautiful reefs and easy entry', -34.1950, 18.4503, 'Simon\'s Town, Cape Town', 15, 'Beginner', 'Salt', 12, 17, 'system-user-id'),
('Pyramid Rock', 'Advanced dive site with strong currents and pelagic fish', -34.2156, 18.4789, 'Miller\'s Point, Cape Town', 35, 'Advanced', 'Salt', 6, 13, 'system-user-id');

-- ================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- ================================

-- Composite indexes for common queries
CREATE INDEX idx_dive_posts_user_created ON dive_posts(user_id, created_at DESC);
CREATE INDEX idx_dive_posts_spot_created ON dive_posts(dive_spot_id, created_at DESC);
CREATE INDEX idx_dive_posts_feed ON dive_posts(created_at DESC) WHERE created_at > CURRENT_DATE - INTERVAL '30 days';

-- Full-text search indexes (for searching spots by name/description)
CREATE INDEX idx_dive_spots_search ON dive_spots USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_users_search ON users USING GIN(to_tsvector('english', display_name || ' ' || username));
