# 🌱 PlantCare AI - Complete Setup Guide

A full-stack plant disease detection application with OTP authentication, MongoDB storage, and AI-powered analysis.

## 📋 Features Implemented

### Frontend
- ✅ **Navigation System**: Home, Plant Detection, About, Login/Register, Profile
- ✅ **Authentication**: OTP-based login and registration using phone numbers
- ✅ **User Profile**: View and edit profile information with statistics
- ✅ **Plant Detection**: AI-powered disease detection with professional formatting
- ✅ **Responsive Design**: Mobile-first design that works on all devices

### Backend
- ✅ **MongoDB Integration**: User data storage and management
- ✅ **OTP Authentication**: Phone number verification using Twilio (with mock for development)
- ✅ **JWT Tokens**: Secure authentication and session management
- ✅ **AI Integration**: GitHub AI for plant disease analysis
- ✅ **File Upload**: Image upload with validation and processing
- ✅ **RESTful API**: Complete API endpoints for all functionality

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd plant-disease-detection-app

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Create database: `plantcare-ai`

#### Option B: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in backend `.env`

### 3. Environment Configuration

#### Backend Environment (.env)
```bash
cd backend
cp env.example .env
```

Edit `backend/.env`:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/plantcare-ai
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/plantcare-ai

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# GitHub AI Configuration
GITHUB_TOKEN=your_github_token_here

# Twilio Configuration (Optional - uses mock in development)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

#### Frontend Environment (.env)
```bash
# In the root directory
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

### 4. Start the Application

#### Terminal 1 - Backend
```bash
cd backend
npm start
# Server will run on http://localhost:5000
```

#### Terminal 2 - Frontend
```bash
npm start
# App will run on http://localhost:3000
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone number
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/register` - Register new user
- `POST /api/auth/check-phone` - Check if phone exists
- `GET /api/auth/profile` - Get user profile (Protected)
- `PUT /api/auth/update-profile` - Update profile (Protected)

### Plant Disease Detection
- `POST /api/detect-disease` - Analyze plant image
- `GET /api/health` - Health check
- `GET /api/formats` - Supported file formats

## 📱 User Flow

### 1. Registration
1. User clicks "Register" in navigation
2. Enters name, email, and 10-digit Indian phone number (+91)
3. System checks if phone exists
4. OTP is sent to phone number
5. User enters OTP to complete registration
6. User is logged in and redirected to home

### 2. Login
1. User clicks "Login" in navigation
2. Enters 10-digit Indian phone number (+91)
3. OTP is sent to phone number
4. User enters OTP to login
5. User is logged in and redirected to home

### 3. Plant Detection
1. User navigates to "Plant Detection"
2. Uploads plant image
3. Describes symptoms
4. AI analyzes and provides formatted results
5. Results are displayed professionally with sections

### 4. Profile Management
1. User clicks on their name in navigation
2. Views profile information and statistics
3. Can edit name and email
4. Can logout from profile page

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  phone: String (required, unique),
  isPhoneVerified: Boolean (default: false),
  otp: {
    code: String,
    expiresAt: Date
  },
  analysisCount: Number (default: 0),
  diseasesDetected: Number (default: 0),
  plantsSaved: Number (default: 0),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **OTP Verification**: Phone number verification for registration/login
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for frontend domain
- **Helmet Security**: Security headers for protection

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: 768px (tablet), 480px (mobile)
- **Touch Friendly**: Large buttons and touch targets
- **Flexible Layout**: Adapts to all screen sizes

## 🎨 UI Components

### Navigation
- Logo with plant icon
- Responsive menu (desktop/mobile)
- User authentication state
- Active page highlighting

### Pages
- **Home**: Hero section, features, how it works, CTA
- **About**: Mission, values, technology, team, contact
- **Plant Detection**: Image upload, symptom input, AI results
- **Login/Register**: OTP-based authentication forms
- **Profile**: User information, statistics, edit functionality

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify database name

2. **OTP Not Sending**
   - Check Twilio credentials (or use mock mode)
   - Verify phone number format
   - Check console logs for errors

3. **Frontend Not Loading**
   - Ensure backend is running on port 5000
   - Check `REACT_APP_API_URL` in frontend `.env`
   - Clear browser cache

4. **Authentication Issues**
   - Check JWT_SECRET in backend `.env`
   - Verify token expiration
   - Clear localStorage and try again

### Debug Commands

```bash
# Check backend health
curl http://localhost:5000/api/health

# Test MongoDB connection
curl http://localhost:5000/api/auth/check-phone -X POST -H "Content-Type: application/json" -d '{"phone":"9876543210"}'

# Check frontend
curl http://localhost:3000
```

## 🔄 Development Workflow

1. **Backend Development**
   ```bash
   cd backend
   npm run dev  # Uses nodemon for auto-restart
   ```

2. **Frontend Development**
   ```bash
   npm start  # React development server
   ```

3. **Database Management**
   - Use MongoDB Compass for GUI
   - Or MongoDB shell for command line

## 📦 Production Deployment

### Frontend
```bash
npm run build
# Deploy 'build' folder to hosting service
```

### Backend
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set up Twilio credentials
4. Use PM2 for process management
5. Configure reverse proxy (nginx)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check this setup guide
2. Review the troubleshooting section
3. Check console logs for errors
4. Open an issue on GitHub

---

**Happy Plant Disease Detection! 🌱🔍**

The application is now fully functional with:
- Complete navigation system
- OTP-based authentication
- MongoDB data storage
- AI-powered plant disease detection
- Professional UI/UX design
- Mobile-responsive layout
