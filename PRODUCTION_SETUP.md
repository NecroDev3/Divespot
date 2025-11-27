# DiveSpot Production Setup Guide

## 🚀 Pre-Launch Checklist

### Backend Configuration

#### 1. Environment Variables
Create a `.env` file in `divespot_backend/` with these required variables:

```bash
# Flask
FLASK_ENV=production
FLASK_DEBUG=False

# JWT Secret (CRITICAL - Generate a strong secret!)
# Generate with: python -c "import secrets; print(secrets.token_hex(32))"
JWT_SECRET_KEY=your_64_character_random_hex_string_here

# Database (upgrade to PostgreSQL for production)
DATABASE_URI=postgresql://user:password@host/database

# CORS (restrict to your domain)
CORS_ORIGINS=https://yourdomain.com

# Image Service
IMAGE_SERVICE_URL=https://images.yourdomain.com
```

#### 2. Generate Secure JWT Secret
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Frontend Configuration

#### 1. Update API URLs in `constants/Api.ts`
Change the production URLs from placeholder to your actual API:
- Line 10: `https://your-production-api.com` → `https://api.yourdomain.com`
- Line 20: Same for image service
- Line 34: Same for base URL
- Line 40: Same for health endpoint

#### 2. Google OAuth Configuration
Update Google Cloud Console with production redirect URIs:
- Add your production domain to authorized redirect URIs
- Update `config/google-auth.ts` if needed

### Database

For production, migrate from SQLite to PostgreSQL:
1. Set up PostgreSQL database
2. Update `DATABASE_URI` in environment variables
3. Run migrations: `cd divespot_backend && python manage.py migrate`

### Security Checklist

- [ ] JWT_SECRET_KEY is randomly generated and secure
- [ ] CORS is restricted to your domains only
- [ ] HTTPS is enabled for all API endpoints
- [ ] Database credentials are secure
- [ ] Environment variables are not committed to git
- [ ] Debug mode is disabled in production

### Build & Deploy

#### Backend
```bash
cd divespot_backend
pip install -r requirements.txt
gunicorn -w 4 -b 0.0.0.0:8000 "app:create_app()"
```

#### Frontend (EAS Build)
```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

### Monitoring

- Set up error tracking (Sentry, Rollbar, etc.)
- Configure logging
- Set up database backups
- Monitor API response times

## Tuesday Launch Day Checklist

- [ ] All environment variables configured
- [ ] SSL certificates installed
- [ ] Database backed up
- [ ] App submitted to App Store / Play Store
- [ ] Backend deployed and tested
- [ ] Google OAuth working in production
- [ ] Test complete user flow (signup → login → post → logout)
- [ ] Monitor logs for errors





