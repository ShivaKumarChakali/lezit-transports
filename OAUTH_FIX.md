# OAuth Redirect URI Mismatch - Fix Guide

## 🔴 **Error: redirect_uri_mismatch**

This error occurs when the redirect URI in your Google Cloud Console doesn't match what your application is sending.

## ✅ **Solution**

### Step 1: Update Your `.env` File

Add the `BACKEND_URL` environment variable to your `backend/.env` file:

**For Development:**
```env
BACKEND_URL=http://localhost:5001
```

**For Production (Render):**
```env
BACKEND_URL=https://lezit-transports-backend.onrender.com
```

### Step 2: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, add these EXACT URLs:

   **Development:**
   ```
   http://localhost:5001/api/auth/google/callback
   ```

   **Production:**
   ```
   https://lezit-transports-backend.onrender.com/api/auth/google/callback
   ```

6. Click **Save**

### Step 3: Verify Your Configuration

Make sure your `backend/.env` has:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
BACKEND_URL=http://localhost:5001  # or your production URL
FRONTEND_URL=http://localhost:3000
```

### Step 4: Restart Your Server

After updating the `.env` file, restart your backend server:
```bash
cd backend
npm run dev
```

## 🔍 **How to Check What URL is Being Used**

The application now automatically builds the callback URL from `BACKEND_URL`. You can verify by:

1. Check the console output when the server starts
2. The callback URL will be: `${BACKEND_URL}/api/auth/google/callback`

## ⚠️ **Important Notes**

- The redirect URI in Google Cloud Console must match **EXACTLY** (including http/https, port, and path)
- No trailing slashes
- Case-sensitive
- Must include the full path: `/api/auth/google/callback`

## 🚀 **For Production Deployment**

When deploying to Render, make sure to:
1. Set `BACKEND_URL` environment variable in Render dashboard to: `https://lezit-transports-backend.onrender.com`
2. Add the production redirect URI in Google Cloud Console
3. Restart the service

## 📝 **Same Fix for Facebook**

If you're using Facebook OAuth, update Facebook App settings with the same URLs:
- Development: `http://localhost:5001/api/auth/facebook/callback`
- Production: `https://lezit-transports-backend.onrender.com/api/auth/facebook/callback`

