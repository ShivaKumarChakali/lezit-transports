# 🔧 Production Environment Variables Setup

## Critical Issue: OAuth Redirects to localhost

The OAuth callback is redirecting to `localhost:5001` because the backend environment variables are not set correctly in production.

---

## ✅ **FIX: Set These Environment Variables in Render**

### Backend Service (lezit-transports-backend)

Go to **Render Dashboard** → **Your Backend Service** → **Environment** tab:

Add/Update these variables:

```env
NODE_ENV=production
BACKEND_URL=https://lezit-transports-backend.onrender.com
FRONTEND_URL=https://lezit-transports-frontend.onrender.com
```

### Frontend Service (lezit-transports-frontend)

Go to **Render Dashboard** → **Your Frontend Service** → **Environment** tab:

Add/Update:

```env
REACT_APP_API_URL=https://lezit-transports-backend.onrender.com/api
```

---

## 📝 Complete Backend Environment Variables List

```env
# Server
NODE_ENV=production
PORT=10000

# Database
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT
JWT_SECRET=your_very_secure_jwt_secret_key
JWT_EXPIRE=7d

# URLs (CRITICAL FOR OAUTH)
BACKEND_URL=https://lezit-transports-backend.onrender.com
FRONTEND_URL=https://lezit-transports-frontend.onrender.com

# Email (if using)
SMTP_HOST=smtppro.zoho.in
SMTP_PORT=465
SMTP_USER_BOOKING=bookings@lezittransports.com
SMTP_PASS_BOOKING=your_password
SMTP_USER_SUPPORT=support@lezittransports.com
SMTP_PASS_SUPPORT=your_password

# OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Admin
ADMIN_EMAIL=admin@lezittransports.com
ADMIN_PASSWORD=your_admin_password
```

---

## 🔄 After Setting Environment Variables:

1. **Redeploy Backend:**
   - Render will auto-redeploy, or
   - Go to Render Dashboard → Backend Service → Manual Deploy → Deploy latest commit

2. **Update OAuth Provider Redirect URIs:**

   **Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - APIs & Services → Credentials
   - Edit your OAuth 2.0 Client ID
   - Authorized redirect URIs:
     ```
     https://lezit-transports-backend.onrender.com/api/auth/google/callback
     ```

   **Facebook OAuth:**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Your App → Settings → Basic
   - Valid OAuth Redirect URIs:
     ```
     https://lezit-transports-backend.onrender.com/api/auth/facebook/callback
     ```

3. **Redeploy Frontend:**
   - Render will auto-redeploy, or
   - Manual deploy from Render Dashboard

---

## ✅ Verification Checklist:

- [ ] `BACKEND_URL` set to production URL in Render
- [ ] `FRONTEND_URL` set to production frontend URL in Render
- [ ] `NODE_ENV=production` set in Render
- [ ] Google OAuth redirect URI updated
- [ ] Facebook OAuth redirect URI updated (if using)
- [ ] Backend redeployed
- [ ] Frontend redeployed
- [ ] Test OAuth login - should redirect to production URLs
- [ ] Test regular login - should work correctly

---

## 🐛 Troubleshooting:

### Still redirecting to localhost?

1. **Check Render Environment Variables:**
   - Go to Render Dashboard → Backend → Environment
   - Verify `BACKEND_URL` is exactly: `https://lezit-transports-backend.onrender.com`
   - No trailing slash, no spaces

2. **Check Backend Logs:**
   - Render Dashboard → Backend → Logs
   - Look for OAuth callback URL being used
   - Should show production URL, not localhost

3. **Clear Browser Cache:**
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Or clear browser cache completely

4. **Check OAuth Provider Settings:**
   - Redirect URIs must match EXACTLY
   - Must be HTTPS in production
   - No trailing slashes

---

## 📞 Quick Fix Command:

If you have Render CLI access:

```bash
# Update backend env var
render env:set BACKEND_URL=https://lezit-transports-backend.onrender.com --service your-backend-service-name

# Update frontend env var  
render env:set REACT_APP_API_URL=https://lezit-transports-backend.onrender.com/api --service your-frontend-service-name
```

