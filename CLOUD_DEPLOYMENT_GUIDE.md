# 🚀 DiveSpot Cloud Deployment Guide

## Prerequisites

- [ ] Cloud hosting account (AWS, Google Cloud, DigitalOcean, Render, etc.)
- [ ] Domain name (optional but recommended)
- [ ] PostgreSQL database (for production)
- [ ] Git repository access

---

## 📦 What You're Deploying

### 1. **Backend API** (`divespot_backend/`)
- Flask REST API
- JWT authentication
- User & dive data management
- Port: 8000

### 2. **Image Service** (`divespot_backend_image_service/`)
- Image upload/storage service
- Handles dive photos
- Port: 5010

### 3. **Frontend** (React Native/Expo app)
- Mobile app (iOS & Android)
- Web app
- Connects to both backend services

---

## 🔧 Deployment Steps

### Step 1: Push Your Code

```bash
# You're on branch: SignInAuthUpdate
# Commit any remaining changes
git add .
git commit -m "Ready for deployment"

# Push to your repository
git push origin SignInAuthUpdate
```

### Step 2: Set Up PostgreSQL Database

**Why PostgreSQL?**
- SQLite (current) is not suitable for production
- PostgreSQL handles concurrent connections better
- Required for most cloud platforms

**Options:**
- **Managed PostgreSQL**: AWS RDS, Google Cloud SQL, Supabase (easiest)
- **Self-hosted**: On your cloud VM

**Get your connection string:**
```
postgresql://username:password@hostname:5432/divespot_db
```

### Step 3: Deploy Backend API

#### Option A: Render.com (Recommended - Free tier available)

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: divespot-backend
   - **Region**: Choose closest to users
   - **Branch**: SignInAuthUpdate
   - **Root Directory**: `divespot_backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python run_server.py`

5. Add Environment Variables:
   ```
   JWT_SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_hex(32))">
   DATABASE_URI=postgresql://user:pass@host:5432/dbname
   FLASK_ENV=production
   CORS_ORIGINS=https://yourdomain.com
   PORT=8000
   ```

6. Click "Create Web Service"

#### Option B: Railway.app

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add service → Select `divespot_backend`
5. Add environment variables (same as above)
6. Deploy

#### Option C: AWS/Google Cloud/DigitalOcean

Deploy as a Docker container or use their app platform services.

### Step 4: Deploy Image Service

**Same process as Backend API**, but:
- **Root Directory**: `divespot_backend_image_service`
- **Start Command**: `python app.py`
- **Port**: 5010
- **Environment Variables**: (see `.env.example`)

⚠️ **Important**: For production, consider using:
- **AWS S3** for image storage
- **Cloudinary** for image hosting
- This avoids storing images on your server

### Step 5: Update Frontend Configuration

Edit `constants/Api.ts`:

```typescript
// Line 10 - Replace with your backend URL
return 'https://divespot-backend.onrender.com';

// Line 20 - Replace with your image service URL  
return 'https://divespot-images.onrender.com';
```

### Step 6: Set Up Database Schema

On your cloud backend:

```bash
# SSH into your server or use the platform's console
cd divespot_backend
python manage.py
```

Run the migration scripts to create tables.

### Step 7: Configure CORS

Update your backend environment variable:
```
CORS_ORIGINS=https://yourdomain.com,https://exp.host
```

Include `https://exp.host` if using Expo Go app.

---

## ✅ Post-Deployment Checklist

- [ ] Backend API is accessible at your URL
- [ ] Image service is accessible
- [ ] Database tables created successfully
- [ ] Can create a new user via API
- [ ] Can login and receive JWT tokens
- [ ] Can upload images
- [ ] Frontend connects to backend
- [ ] Google OAuth configured with production redirect URIs
- [ ] SSL/HTTPS enabled (most platforms do this automatically)

---

## 🔒 Security Checklist

- [ ] JWT_SECRET_KEY is strong and random (64+ characters)
- [ ] Database password is strong
- [ ] CORS restricted to your domain only (not `*`)
- [ ] .env files are in .gitignore (never commit secrets!)
- [ ] Database file (.db) is NOT in git
- [ ] API rate limiting configured (optional but recommended)
- [ ] HTTPS enabled on all endpoints

---

## 📊 Monitoring & Maintenance

### Health Checks
Test your endpoints:
```bash
# Backend health
curl https://your-backend.onrender.com/

# Login test
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

### Logs
- Check your platform's dashboard for error logs
- Monitor API response times
- Set up alerts for downtime

---

## 🐛 Troubleshooting

### "Missing Authorization Header" errors
- Frontend is not sending JWT token
- Check token storage in frontend
- Verify Authorization header: `Bearer <token>`

### Database connection errors
- Check DATABASE_URI format
- Verify database credentials
- Ensure database allows remote connections

### CORS errors
- Add your frontend domain to CORS_ORIGINS
- Include protocol (https://)
- Clear browser cache

### Image upload fails
- Check MAX_CONTENT_LENGTH setting
- Verify image service is running
- Check file permissions on uploads/ folder

---

## 💰 Cost Estimates

### Free Tier Options:
- **Render**: 750 hours/month free (1 service always on)
- **Railway**: $5 credit/month free
- **Supabase**: PostgreSQL free tier (500MB)
- **Cloudinary**: 25GB free storage

### Paid (Recommended for production):
- Backend: $7-20/month
- Image Service: $7-20/month
- PostgreSQL: $5-15/month
- **Total**: ~$20-55/month

---

## 📚 Additional Resources

- [Flask Deployment Guide](https://flask.palletsprojects.com/en/latest/deploying/)
- [PostgreSQL Migration Guide](https://www.postgresql.org/docs/)
- [Expo Build & Deploy](https://docs.expo.dev/build/introduction/)

---

## 🆘 Need Help?

Common issues and solutions in `PRODUCTION_SETUP.md`

