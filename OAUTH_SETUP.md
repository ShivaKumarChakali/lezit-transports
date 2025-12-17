# OAuth Setup Guide for LEZIT TRANSPORTS

## 🔐 **Google OAuth Setup**

### 1. Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add authorized redirect URIs (IMPORTANT: Must match exactly):
   - **Development**: `http://localhost:5001/api/auth/google/callback`
   - **Production**: `https://lezit-transports-backend.onrender.com/api/auth/google/callback`
   - **Note**: The URL must be the FULL absolute URL including protocol (http/https) and domain

### 2. Get Credentials
- Copy the **Client ID** and **Client Secret**
- Add them to your `.env` file:
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 📘 **Facebook OAuth Setup**

### 1. Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select existing one
3. Add "Facebook Login" product
4. Configure OAuth settings:
   - Valid OAuth Redirect URIs (IMPORTANT: Must match exactly):
     - **Development**: `http://localhost:5001/api/auth/facebook/callback`
     - **Production**: `https://lezit-transports-backend.onrender.com/api/auth/facebook/callback`
     - **Note**: The URL must be the FULL absolute URL including protocol (http/https) and domain

### 2. Get Credentials
- Copy the **App ID** and **App Secret**
- Add them to your `.env` file:
```
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

## 🔧 **Environment Variables**

Add these to your backend `.env` file:

```env
# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Session Configuration
SESSION_SECRET=your-session-secret-key-here

# Frontend URL (for OAuth redirects after authentication)
FRONTEND_URL=http://localhost:3000

# Backend URL (for OAuth callbacks - MUST match Google/Facebook redirect URIs exactly)
# Development: http://localhost:5001
# Production: https://lezit-transports-backend.onrender.com
BACKEND_URL=http://localhost:5001
```

## 🚀 **How It Works**

### 1. User clicks "Continue with Google/Facebook"
2. User is redirected to Google/Facebook OAuth
3. User authorizes the application
4. Google/Facebook redirects back to your backend
5. Backend creates/updates user account
6. Backend generates JWT token
7. User is redirected to frontend with token
8. Frontend stores token and logs user in

## 📱 **Features**

- ✅ **Automatic Account Creation** - New users are created automatically
- ✅ **Account Linking** - Existing users can link OAuth accounts
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Error Handling** - Proper error messages and fallbacks
- ✅ **Mobile Responsive** - Works on all devices

## 🔒 **Security Features**

- **JWT Tokens** - Secure authentication tokens
- **Session Management** - Proper session handling
- **CORS Protection** - Cross-origin request protection
- **Input Validation** - Server-side validation
- **Error Handling** - Secure error responses

## 🛠 **Testing**

1. Start your backend server
2. Start your frontend application
3. Go to login/register page
4. Click "Continue with Google" or "Continue with Facebook"
5. Complete OAuth flow
6. Verify user is logged in successfully

## 📝 **Notes**

- OAuth users don't need to provide phone numbers
- OAuth users don't need passwords
- Users can link multiple OAuth providers to one account
- All OAuth data is stored securely in MongoDB 