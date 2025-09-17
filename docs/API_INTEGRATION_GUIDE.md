# API Integration Guide

This document explains how the frontend (`userService.ts`) integrates with the backend API (`routes.py`).

## Integration Architecture

```
Frontend (React Native)          Backend (Flask)
┌─────────────────────┐         ┌─────────────────────┐
│   Components        │         │   API Routes        │
│   ↓                 │         │   ↑                 │
│   UserContext       │         │   Models            │
│   ↓                 │         │   ↑                 │
│   userService.ts    │ ←HTTP→  │   routes.py         │
│   ↓                 │         │   ↑                 │
│   apiService.ts     │         │   Database          │
│   ↓                 │         │                     │
│   AsyncStorage      │         │   SQLite            │
│   (Cache)           │         │                     │
└─────────────────────┘         └─────────────────────┘
```

## Key Features

### 1. **Hybrid Offline-First Architecture**
- Primary: API calls when online
- Fallback: Local storage when offline
- Caching: Intelligent data caching for performance

### 2. **Data Transformation Layer**
- Automatically converts between frontend and backend data models
- Handles date serialization/deserialization
- Maps field naming differences (e.g., `profileImageUri` ↔ `profile_image_url`)

### 3. **Error Handling & Resilience**
- Automatic health checks
- Graceful degradation when API is unavailable
- User-friendly error messages

## Usage Examples

### Creating a User

```typescript
// Frontend usage (unchanged for components)
const user = await userService.createUser({
  username: 'newdiver',
  email: 'diver@example.com',
  displayName: 'New Diver'
});

// Internally calls:
// POST /api/users with transformed data
// Caches result locally
```

### Fetching User Posts

```typescript
// Frontend usage
const posts = await userService.getUserPosts(userId);

// Internally:
// 1. Checks API availability
// 2. Fetches from GET /api/posts?user_id=<id>
// 3. Transforms backend posts to frontend format
// 4. Caches results
// 5. Falls back to cache if API unavailable
```

### Creating a Post

```typescript
// Frontend usage
const savedPost = await userService.saveUserPost(newPost);

// Internally:
// 1. Transforms frontend post to backend format
// 2. Calls POST /api/posts
// 3. Updates user stats on backend
// 4. Transforms response back to frontend format
// 5. Updates local cache
```

## Configuration

All API configuration is centralized in `constants/Api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://127.0.0.1:5000/api'  // Development
    : 'https://your-api.com/api',  // Production
  REQUEST_TIMEOUT: 10000,
  CACHE_DURATION: 1000 * 60 * 5, // 5 minutes
  // ...
};
```

## Error Handling

### API Errors
```typescript
try {
  const user = await userService.getCurrentUser();
} catch (error) {
  // User-friendly error message shown automatically
  // Graceful fallback to cached data
}
```

### Network States
- **Online**: Direct API calls
- **Offline**: Local cache operations
- **Intermittent**: Retry with exponential backoff

## Data Model Mapping

| Frontend | Backend | Notes |
|----------|---------|-------|
| `User.displayName` | `display_name` | Snake case conversion |
| `User.profileImageUri` | `profile_image_url` | Field name difference |
| `User.stats.totalDives` | `total_dives` | Flattened structure |
| `DivePost.diveDetails.depth` | `max_depth` | Nested vs flat |
| `DivePost.imageUris` | `image_urls` | Pluralization |

## Health Monitoring

The service automatically monitors API health:

```typescript
// Check if API is available
const isApiOnline = userService.isApiAvailable();

// Health checks run every 2 minutes automatically
// Results cached to avoid excessive requests
```

## Migration Strategy

### Phase 1: Core Features ✅
- [x] User management
- [x] Post CRUD operations
- [x] Data transformation layer
- [x] Health monitoring
- [x] Caching system

### Phase 2: Enhanced Features (In Progress)
- [ ] Likes/unlikes with real-time updates
- [ ] Comments system
- [ ] Global feed integration
- [ ] Search functionality

### Phase 3: Advanced Features (Planned)
- [ ] Background synchronization
- [ ] Conflict resolution
- [ ] Push notifications
- [ ] Image upload to cloud storage

## Testing the Integration

### 1. Start the Backend
```bash
cd divespot_backend
python manage.py migrate
flask run
```

### 2. Configure Frontend
Update `constants/Api.ts` with your backend URL if different from default.

### 3. Test API Health
The app will automatically check API health on startup and show the status in debug logs.

### 4. Monitor Logs
- API requests/responses logged in development mode
- Cache operations logged for debugging
- Graceful fallbacks logged when API unavailable

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure backend is running on http://127.0.0.1:5000
   - Check firewall/network settings

2. **CORS Errors**
   - Backend includes CORS headers for development
   - Production needs proper CORS configuration

3. **Data Format Errors**
   - Check data transformation logs
   - Verify backend model changes are reflected in transformers

4. **Cache Issues**
   - Clear app storage: `userService.clearUser()`
   - Check AsyncStorage in React Native debugger

### Debug Mode

Enable detailed logging in development:
```typescript
// In constants/Api.ts
export const DEV_CONFIG = {
  LOG_API_REQUESTS: true,
  LOG_API_RESPONSES: true,
  LOG_CACHE_OPERATIONS: true,
};
```

## Production Considerations

1. **API URL**: Update production API endpoint
2. **Authentication**: Implement JWT/session tokens
3. **Error Tracking**: Add Sentry or similar service
4. **Performance**: Monitor API response times
5. **Caching**: Implement cache invalidation strategies
6. **Security**: Add request/response encryption for sensitive data
