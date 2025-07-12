# mediaInk Web/Desktop App Frontend

This directory contains the Electron-based (or web) frontend for the mediaInk extension project.

## Features
- Movie playback control (via mediaInk backend)
- Subtitle generation/fetching
- Movie suggestions based on watchlist

## Next Steps
1. Scaffold the Electron app (or web app).
2. Connect to the backend API for playback, subtitles, and suggestions.
3. Build UI for playback, subtitle management, and movie recommendations. 

---

## How to Fix

### 1. For Local Development

- **If you control the CSP (e.g., via a browser extension or a reverse proxy):**
  - Temporarily relax the CSP for `localhost:3000` by allowing `'unsafe-eval'` in the `script-src` directive.
  - Example:
    ```
    Content-Security-Policy: script-src 'self' 'unsafe-eval';
    ```
  - **Warning:** This is only safe for local development, never in production.

- **If you do NOT control the CSP:**
  - Check if you have a browser extension (like an ad blocker, privacy tool, or CSP enforcer) that is injecting a strict CSP. Try disabling extensions and reloading the page.

### 2. For Production

- **Never use `'unsafe-eval'` in production.**
- If you deploy your app, make sure your build is production-optimized (`npm run build`), which usually does not use eval.

### 3. For React/Electron

- If you are using Electron, you may need to adjust the CSP in your Electron main process or HTML template.

---

## Next Steps

1. **For now, try disabling browser extensions that might enforce CSP.**
2. **If you are using Chrome, try opening an Incognito window and loading http://localhost:3000.**
3. **If you are using a company or school network, there may be a proxy injecting CSP headers. Try a different network if possible.**
4. **If you want to relax the CSP for local development, you can add `'unsafe-eval'` to your CSP header, but only do this locally.**

---

### If the problem persists:

- Please copy any additional errors from the browser console.
- Let me know if you are running this in a special environment (Electron, Docker, etc.).
- Let me know if you have any browser extensions enabled.

I can help you further once you provide more details! 