# 🌊 DiveSpot

**Discover, document, and share your diving adventures.**

DiveSpot is a social platform for divers to connect, find the best dive spots, log their underwater experiences, and share their diving adventures with the community.

## ✨ Features

- 🔐 **Secure Authentication** - Email/password and Google OAuth sign-in
- 📍 **Dive Spot Discovery** - Find and explore dive spots worldwide
- 📝 **Dive Logging** - Document your dives with photos, conditions, and notes
- 🗺️ **Interactive Maps** - Browse dive locations on an interactive map
- 📱 **Cross-Platform** - Works on iOS, Android, and Web
- 🔄 **Real-time Feed** - Share and discover dive experiences
- 📊 **Dive Statistics** - Track your total dives, max depth, and bottom time

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- iOS Simulator (Mac only) or Android Emulator
- Expo CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/divespot.git
   cd Divespot
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd divespot_backend
   pip install -r requirements.txt
   cd ..
   ```

4. **Install image service dependencies**
   ```bash
   cd divespot_backend_image_service
   pip install -r requirements.txt
   cd ..
   ```

### Running the App

1. **Start the Backend API** (Terminal 1)
   ```bash
   cd divespot_backend
   python run_server.py
   ```
   Backend runs on `http://localhost:8000`

2. **Start the Image Service** (Terminal 2)
   ```bash
   cd divespot_backend_image_service
   python app.py
   ```
   Image service runs on `http://localhost:5010`

3. **Start the Expo App** (Terminal 3)
   ```bash
   npx expo start
   ```

4. **Run on your preferred platform:**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Press `w` for Web browser
   - Scan QR code with Expo Go app on your device

## 🏗️ Project Structure

```
Divespot/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   ├── _layout.tsx        # Root layout with auth flow
│   └── +not-found.tsx     # 404 page
├── components/            # Reusable React components
├── services/              # API client and service layer
├── contexts/              # React Context providers
├── constants/             # App constants and config
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
├── assets/                # Images, fonts, and static assets
├── divespot_backend/      # Flask REST API
└── divespot_backend_image_service/  # Image upload service
```

## 📱 Building for Production

### iOS

```bash
eas build --platform ios --profile production
```

### Android

```bash
eas build --platform android --profile production
```

See [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) for complete production deployment guide.

## 🔑 Environment Configuration

### Backend

Create `.env` file in `divespot_backend/`:

```env
JWT_SECRET_KEY=your-secret-key-here
DATABASE_URI=sqlite:///dive_spot.db
FLASK_ENV=development
```

### Frontend

Update `constants/Api.ts` with your API URLs for production.

## 🛠️ Tech Stack

**Frontend:**
- React Native with Expo
- TypeScript
- Expo Router for navigation
- React Native Maps
- AsyncStorage for local data

**Backend:**
- Flask (Python)
- SQLAlchemy ORM
- Flask-JWT-Extended for authentication
- SQLite (development) / PostgreSQL (production recommended)

## 📚 API Documentation

See [docs/API_INTEGRATION_GUIDE.md](./docs/API_INTEGRATION_GUIDE.md) for detailed API documentation.

## 🔐 Google OAuth Setup

See [docs/GOOGLE_SIGNIN_SETUP.md](./docs/GOOGLE_SIGNIN_SETUP.md) for Google OAuth configuration.

## 🧪 Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Backend won't start
- Ensure Python 3.8+ is installed
- Install all dependencies: `pip install -r requirements.txt`
- Check if port 8000 is already in use

### iOS build issues
- Run `npx expo prebuild --clean`
- Run `pod install` in the `ios/` directory

### Android build issues
- Clean build: `cd android && ./gradlew clean`
- Rebuild: `npx expo run:android`

### Google OAuth not working
- Verify redirect URIs in Google Cloud Console
- Check bundle identifier matches your Google OAuth configuration
- See [docs/GOOGLE_SIGNIN_SETUP.md](./docs/GOOGLE_SIGNIN_SETUP.md)

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Made with ❤️ for the diving community 🤿
