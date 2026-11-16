# Deployment Guide for CampusConnect

## Overview
This guide walks you through deploying the **frontend** on **Vercel** and the **backend** on **Render**. The repository now includes a `vercel.json` configuration and a central `API_URL` constant for the frontend, so the application can communicate with the backend after deployment.

---

## 1. Prerequisites
- GitHub account with the repository **https://github.com/amankv1234/Campus_Connection** forked or cloned.
- Vercel account (https://vercel.com) – you can sign in with GitHub.
- Render account (https://render.com).
- `node` (>=18) and `npm` installed locally.
- Optional: MongoDB instance (MongoDB Atlas or Render managed DB). The backend needs a `MONGO_URI`.

---

## 2. Backend Deployment on Render
### 2.1 Create a Render Web Service
1. Log in to Render and click **New > Web Service**.
2. **Name**: e.g., `campus-connection-backend`.
3. **Region**: Choose a region close to your users.
4. **Repository**: Connect the GitHub repo and select the `server` folder (Render will detect the `package.json`).
5. **Build Command**: `npm install`
6. **Start Command**: `npm start` (runs `node server.js`).
7. **Port**: Render assigns a port via the `PORT` env var; the code already reads `process.env.PORT || 5000`.

### 2.2 Environment Variables
Add the following in the *Environment* section:
- `NODE_ENV=production`
- `PORT=5000` (Render overrides this automatically, but setting a default keeps local runs consistent.)
- `MONGO_URI=<your‑mongo‑connection‑string>`
- `JWT_SECRET=<your‑jwt‑secret>`
- `REDIS_URL=<your‑redis‑connection‑url>` *(Optional - Upstash Redis or Render Redis for ultra-fast Leaderboard, Caching, Rate-Limiting & Online Status. If omitted, app smoothly runs on MongoDB fallback)*
- Any other custom vars referenced in `server/.env.example`.

### 2.3 Deploy
Click **Create Web Service**. Render will install dependencies, build, and start the server. After the build finishes you will receive a public URL, e.g.:
```
https://campus-connection-backend.onrender.com
```
Copy this URL – you will need it for the frontend.

---

## 3. Frontend Deployment on Vercel
### 3.1 Add the Project
1. Log in to Vercel and click **New Project**.
2. Import the same GitHub repository.
3. Vercel will automatically detect the `vercel.json` at the repo root.
4. Ensure the **Root Directory** is left blank (the repo root). The `vercel.json` tells Vercel to build the `client` folder.

### 3.2 Environment Variables
Add a single variable:
- `API_URL=<backend‑url-from‑Render>`
  (e.g., `https://campus-connection-backend.onrender.com`).
  Vite injects this at build time via `vite.config.js` — no `VITE_` prefix needed.

### 3.3 Deploy
Click **Deploy**. Vercel will run:
```
cd client && npm install && npm run build
```
and serve the static files from `client/dist` as defined in `vercel.json`.

Once deployment finishes you will get a preview URL (e.g., `https://campus-connection.vercel.app`).

---

## 4. Verify the Deployment
1. Open the Vercel URL in a browser.
2. Register / log in – the app should communicate with the Render backend.
3. Test a few core flows:
   - Create a post.
   - View the post feed.
   - Open the **Share** button on a post – a modal with social‑share options should appear.
   - Send a direct message (socket.io works via the same `VITE_API_URL`).
4. Check the Render dashboard logs for any runtime errors.

---

## 5. Optional: Local Development with the Same Config
You can run the frontend locally against the Render backend by setting the environment variable:
```bash
# In the client folder
echo "API_URL=https://<render‑url>" > .env
npm run dev
```
The same `API_URL` constant (`client/src/config/api.js`) will be used.

---

## 6. Repository Checklist
- `vercel.json` – present at repo root (already added).
- `client/src/config/api.js` – exports `API_URL` used throughout the app.
- Share button uses **react‑share** library and works on both dev and prod.
- `README.md` updated (see next step).

---

## 7. Update README (quick summary)
You may want to add a short deployment badge or instructions to the main README. Below is a concise snippet you can copy‑paste:
```markdown
## Deploy
- **Backend**: Deploy the `server` folder on Render. Set `MONGO_URI` & `JWT_SECRET`.
- **Frontend**: Deploy the repo on Vercel (auto‑detects `vercel.json`). Add `VITE_API_URL` pointing to the Render URL.
```

---

## 8. Next Steps / Maintenance
- Monitor Render logs for memory/CPU usage; upgrade the plan if needed.
- Set up a custom domain on Vercel (optional).
- Enable automatic redeploys on GitHub pushes for both services.

---

**That’s it!** Your CampusConnect app should now be live with a functional Share button and proper API routing.

