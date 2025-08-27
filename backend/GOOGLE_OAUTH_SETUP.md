# Google OAuth Setup Guide for StudentsAI MVP

## 🎯 Overview
This guide will help you set up Google OAuth authentication for your StudentsAI MVP backend. The implementation supports both traditional email/password authentication and Google OAuth, allowing users to sign in with their Google accounts.

## 📋 Prerequisites
- Google Cloud Console account (Individual profile recommended for MVP)
- PostgreSQL database running
- Backend server running on localhost:8000
- Frontend running on localhost:3000

## 🔧 Backend Setup

### 1. Environment Variables
Add these to your `backend/.env` file:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Other existing variables...
DATABASE_URL=postgresql://username:password@localhost:5432/studentsai_db
SECRET_KEY=your-secret-key-here
# ... etc
```

### 2. Database Migration
The OAuth fields have been added to the database. Run the migration:

```bash
cd backend
source venv/bin/activate
alembic upgrade head
```

### 3. Dependencies
Install the new OAuth dependencies:

```bash
pip install -r requirements.txt
```

## 🌐 Google Cloud Console Setup

### 1. Create a New Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name: `StudentsAI-MVP` (or your preferred name)
4. Click "Create"

### 2. Enable Google+ API
1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on it and click "Enable"

### 3. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Name: `StudentsAI Web Client`
5. Authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://localhost:8000`
6. Authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback`
7. Click "Create"

### 4. Copy Credentials
1. Copy the **Client ID** and **Client Secret**
2. Paste them in your `backend/.env` file

## 🚀 Testing the Setup

### 1. Start the Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Test the OAuth Endpoint
The backend now has a new endpoint: `POST /auth/google`

You can test it with curl:
```bash
curl -X POST "http://localhost:8000/auth/google" \
  -H "Content-Type: application/json" \
  -d '{"code": "test_code"}'
```

### 3. Frontend Integration
The frontend is already set up with:
- Google OAuth button in the auth form
- Callback handling at `/auth/google/callback`
- API integration via `api.googleAuth(code)`

## 🔐 How It Works

### 1. OAuth Flow
1. User clicks "Continue with Google" button
2. Frontend redirects to Google OAuth consent screen
3. User authorizes the application
4. Google redirects back with an authorization code
5. Frontend sends code to backend `/auth/google` endpoint
6. Backend exchanges code for Google access token
7. Backend gets user info from Google
8. Backend creates/updates user in database
9. Backend returns JWT token to frontend
10. User is logged in

### 2. Database Changes
- `users.password_hash` is now nullable (for OAuth users)
- `users.oauth_provider` stores the OAuth provider (e.g., "google")
- `users.oauth_id` stores the OAuth provider's user ID
- OAuth users are automatically verified

### 3. User Management
- OAuth users can link to existing email/password accounts
- New OAuth users get auto-generated usernames
- All existing functionality works for OAuth users

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Invalid redirect URI" Error
- Ensure the redirect URI in Google Cloud Console matches exactly
- Check for trailing slashes or protocol mismatches

#### 2. "Client ID not found" Error
- Verify `GOOGLE_CLIENT_ID` in your `.env` file
- Ensure the environment variable is loaded correctly

#### 3. Database Connection Issues
- Check if the migration ran successfully
- Verify database connection string

#### 4. CORS Issues
- Ensure frontend origin is in `ALLOWED_ORIGINS`
- Check if CORS middleware is properly configured

### Debug Steps
1. Check backend logs for detailed error messages
2. Verify environment variables are loaded
3. Test database connection
4. Check Google Cloud Console credentials

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use strong, unique secrets for production
- Rotate credentials regularly

### 2. OAuth Scopes
- Current implementation uses minimal scopes
- Only requests basic profile information
- Consider additional scopes if needed

### 3. Token Security
- JWT tokens are short-lived (30 minutes)
- Refresh token implementation can be added later
- OAuth tokens are not stored in database

## 🚀 Production Deployment

### 1. Update Redirect URIs
When deploying to production, update:
- Google Cloud Console redirect URIs
- Environment variable `GOOGLE_REDIRECT_URI`
- Frontend callback URL

### 2. Environment Variables
Set production environment variables:
```bash
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
```

### 3. HTTPS Required
- Google OAuth requires HTTPS in production
- Ensure SSL certificates are properly configured

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [FastAPI OAuth Tutorial](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/)
- [Google Cloud Console Help](https://cloud.google.com/apis/docs/overview)

## ✅ Checklist

- [ ] Google Cloud Console project created
- [ ] Google+ API enabled
- [ ] OAuth 2.0 credentials created
- [ ] Environment variables set in `.env`
- [ ] Database migration run
- [ ] Dependencies installed
- [ ] Backend server started
- [ ] OAuth endpoint tested
- [ ] Frontend integration verified

## 🎉 You're All Set!

Your StudentsAI MVP now supports Google OAuth authentication! Users can sign in with their Google accounts while maintaining all existing functionality.

For any issues or questions, check the troubleshooting section above or review the backend logs for detailed error messages.
