# 🔧 OAuth Production Fix

## Issues Found:
1. **OAuth callback redirects to `localhost:5001`** instead of production Render URL
2. **Login page shows "not found"** when refreshed

## ✅ Fixes Applied:

### 1. Backend OAuth Callback URL Configuration
Updated `backend/src/config/passport.ts` to:
- Check `NODE_ENV === 'production'` first
- Use production Render URL as default in production
- Fallback to `BACKEND_URL` env variable if set

### 2. Frontend OAuth Redirect URL
Updated `backend/src/routes/oauth.ts` to:
- Use production frontend URL in production
- Default to `https://lezit-transports-frontend.onrender.com` in production
- Fallback to env variable or localhost for development

---

## 🚀 Required Actions:

### For Render Production Deployment:

1. **Set Environment Variables in Render Dashboard:**
   
   Go to your Render backend service → Environment tab → Add/Update:

   ```env
   NODE_ENV=production
   BACKEND_URL=https://lezit-transports-backend.onrender.com
   FRONTEND_URL=https://lezit-transports-frontend.onrender.com
   ```

2. **Update Google OAuth Redirect URIs:**
   
   Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials:
   - Find your OAuth 2.0 Client ID
   - Add/Update Authorized redirect URIs:
     ```
     https://lezit-transports-backend.onrender.com/api/auth/google/callback
     ```

3. **Update Facebook OAuth Redirect URIs:**
   
   Go to [Facebook Developers](https://developers.facebook.com/) → Your App → Settings → Basic:
   - Add/Update Valid OAuth Redirect URIs:
     ```
     https://lezit-transports-backend.onrender.com/api/auth/facebook/callback
     ```

4. **Redeploy Backend:**
   ```bash
   git add .
   git commit -m "Fix OAuth callback URLs for production"
   git push
   ```
   (Render will auto-deploy)

---

## ✅ Verification:

After deploying, test:

1. **Regular Login:**
   - Should work normally
   - Should redirect to correct dashboard based on role

2. **Google OAuth:**
   - Click "Continue with Google"
   - Should redirect to Google
   - After authorization, should redirect to production backend callback
   - Should then redirect to production frontend

3. **Facebook OAuth:**
   - Same as Google

4. **Page Refresh:**
   - Login page should load correctly when refreshed
   - No "Not Found" errors

---

## 🐛 If Still Having Issues:

1. **Check Render Environment Variables:**
   - Verify `BACKEND_URL` is set to production URL
   - Verify `FRONTEND_URL` is set to production frontend URL
   - Verify `NODE_ENV=production`

2. **Check OAuth Provider Settings:**
   - Google/Facebook redirect URIs must match exactly
   - No trailing slashes
   - Must be HTTPS in production

3. **Check Browser Console:**
   - Look for CORS errors
   - Look for redirect URL mismatches
   - Check Network tab for actual URLs being called

4. **Verify Backend Logs:**
   - Check Render backend logs
   - Look for OAuth callback URL being used
   - Should show production URL, not localhost

