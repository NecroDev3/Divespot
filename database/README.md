# DiveSpot Database Schema

## Overview
A comprehensive database schema designed for the DiveSpot Cape Town diving community MVP. This schema supports user profiles, dive locations, detailed dive logging, and social features.

## Core Tables

### 1. **USERS** (Profiles)
- **Purpose**: User authentication, profiles, and diving statistics
- **Key Features**:
  - Unique username and email
  - Diving statistics (total dives, max depth, bottom time)
  - Certification levels
  - Optional favorite dive spot
- **Social**: Links to all user-generated content

### 2. **DIVE_SPOTS** (Places)
- **Purpose**: Cape Town dive locations with detailed characteristics
- **Key Features**:
  - GPS coordinates for mapping
  - Difficulty ratings (Beginner → Expert)
  - Environmental data (depth, visibility, temperature)
  - User-generated content (created by community)
- **Includes**: 6 pre-seeded popular Cape Town spots

### 3. **DIVE_POSTS** (Posts)
- **Purpose**: Individual dive logs with comprehensive details
- **Key Features**:
  - Cape Town-specific conditions (wind, currents, visibility)
  - Marine life tracking
  - Dive buddy logging
  - Multiple image support
  - Social engagement metrics
- **Unique**: Separates `created_at` (post time) from `dive_timestamp` (actual dive time)

### 4. **POST_LIKES** & **POST_COMMENTS** (Social Features)
- **Purpose**: Community engagement and social interaction
- **Key Features**:
  - Prevents duplicate likes (unique constraint)
  - Automatic counter updates via triggers
  - Full comment threading support

## Key Design Decisions

### 🎯 **Cape Town Focus**
- Enum values tailored for local conditions
- Pre-seeded with 6 popular dive spots
- Wind/current conditions specific to Cape coastline

### 🚀 **Performance Optimized**
- Strategic indexing for common queries
- Composite indexes for feed generation
- Full-text search for spots and users
- Automatic statistics updates via triggers

### 📱 **Mobile App Ready**
- UUID primary keys (better for distributed systems)
- Array fields for images, sea life, buddies
- Optimized for social feed queries
- Image URL storage (works with CDN/cloud storage)

### 🔧 **MVP Focused**
- Essential features only
- Extensible design for future features
- No over-engineering

## Common Queries

```sql
-- Get user feed (recent posts from all users)
SELECT dp.*, u.display_name, u.profile_image_url, ds.name as spot_name
FROM dive_posts dp
JOIN users u ON dp.user_id = u.id
JOIN dive_spots ds ON dp.dive_spot_id = ds.id
ORDER BY dp.created_at DESC
LIMIT 20;

-- Get user's diving statistics
SELECT total_dives, max_depth_achieved, total_bottom_time, certification_level
FROM users WHERE id = ?;

-- Find nearby dive spots (Cape Town area)
SELECT * FROM dive_spots
WHERE latitude BETWEEN ? AND ? 
AND longitude BETWEEN ? AND ?
ORDER BY difficulty, avg_rating DESC;
```

## Next Steps for Implementation

1. **Authentication**: Integrate with Firebase Auth or implement JWT
2. **Image Storage**: Set up CloudFront/S3 or Firebase Storage
3. **Search**: Implement full-text search for dive spots
4. **Analytics**: Add user engagement tracking
5. **Notifications**: Push notifications for likes/comments

## Database Compatibility

This schema is written in PostgreSQL but easily adaptable to:
- **MySQL/MariaDB**: Change UUID to CHAR(36), adjust array syntax
- **SQLite**: Simplify triggers, use TEXT for arrays (JSON)
- **Firebase**: Convert to NoSQL document structure

## Scaling Considerations

- **Indexing**: All common query patterns are indexed
- **Partitioning**: `dive_posts` can be partitioned by `created_at`
- **Caching**: Feed queries are optimized for Redis caching
- **CDN**: Image URLs ready for global CDN deployment
