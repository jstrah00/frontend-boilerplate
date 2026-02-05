# Troubleshooting Guide

## Issue: Requests Blocked by DevTools

If you see "Blocked by DevTools" in the Network tab when trying to access items or other resources:

### Solution 1: Disable Request Blocking

1. Open Firefox DevTools (F12)
2. Go to the **Network** tab
3. Look for a **🚫 Block** button or filter
4. Click on it and make sure no patterns are blocking `/api/v1/items` or similar paths
5. Clear any blocked URL patterns
6. Refresh the page

### Solution 2: Disable Browser Extensions

Some browser extensions (like ad blockers, privacy tools, or development tools) can block API requests:

1. Try disabling extensions one by one
2. Common culprits:
   - Privacy Badger
   - uBlock Origin
   - NoScript
   - DuckDuckGo Privacy Essentials
3. After disabling each extension, refresh the page to test

### Solution 3: Check CORS Configuration

If you're still having issues, verify:

1. The backend is running on `http://localhost:8000`
2. The backend has proper CORS configuration
3. The Vite proxy is working correctly

### Verify Configuration

Open the browser console and check for:
```
[API Client] Base URL: /api
```

If you see a different URL like `http://localhost:8000`, you may need to:
1. Check your `.env` file
2. Ensure `VITE_API_BASE_URL` is commented out or not set
3. Restart the dev server: `npm run dev`

## Issue: Items Not Loading

### CORS Configuration (Most Common Issue)

If you see "Network Error" or "Blocked by DevTools":

1. **Fix CORS in Backend**:
   - Open `fastapi-boilerplate/.env`
   - Update the CORS_ORIGINS line to include your frontend URL (IMPORTANT: use JSON array format):
     ```
     CORS_ORIGINS=["http://localhost:5173"]
     ```
   - Note: The value MUST be valid JSON array format (with quotes and square brackets)
   - Restart the backend server:
     ```bash
     cd fastapi-boilerplate
     # Press Ctrl+C to stop if running
     uv run dev
     ```

2. **Verify CORS is working**:
   - Refresh your frontend page
   - Check browser DevTools → Network tab
   - The requests should now succeed

### Check the Backend

1. Verify the backend is running:
   ```bash
   curl http://localhost:8000/api/v1/items/
   ```

2. Verify authentication:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/v1/items/
   ```

### Check the Frontend

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any error messages
4. Check the Network tab for failed requests
5. Note the exact error message and status code

## Issue: Session Not Persisting

If you're logged out after refreshing the page:

1. Check browser console for errors during auth initialization
2. Verify localStorage has `access_token`:
   - Open DevTools → Application/Storage → Local Storage
   - Look for `access_token` key
3. If token exists but auth fails, the token might be expired
4. Clear localStorage and login again

## Issue: Theme Toggle Not Working

1. Check if the theme is being saved:
   - Open DevTools → Application/Storage → Local Storage
   - Look for `app-theme` key
   - It should be `light`, `dark`, or `system`

2. Check the HTML element:
   - Inspect the `<html>` element
   - It should have class `dark` when dark mode is active

3. Clear cache and hard refresh:
   - Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)

## Getting Help

If none of these solutions work:

1. Check the browser console for error messages
2. Check the Network tab for failed requests
3. Note the exact error message and steps to reproduce
4. Create an issue with all the relevant information
