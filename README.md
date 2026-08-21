# Manofox — single Node.js app (Hostinger-ready)

Backend and frontend are now **one app**. No Python anywhere. Express serves both
the `/api/*` routes and the built React site from the same Node.js process —
exactly what Hostinger's shared "Node.js App" hosting expects (one entry file,
one port, managed by Passenger).

## What changed from the original project
- `backend/server.py` (FastAPI + MongoDB) → `server/server.js` (Express + MySQL), same routes/behavior.
- Database: MongoDB → **MySQL** (Hostinger gives you MySQL, not Mongo).
- Frontend `api.js` now calls `/api` on the **same origin** by default (no separate backend URL needed).
- One root `package.json` is the single entry point Hostinger runs.

## Folder structure
```
manofox/
├── package.json         ← root app Hostinger installs & starts
├── .env.example          ← copy to .env / set in hPanel
├── server/
│   ├── server.js         ← Express API + serves frontend/build
│   ├── db.js              ← MySQL connection pool
│   └── schema.sql        ← run this in phpMyAdmin once
└── frontend/              ← React app (unchanged UI/pages)
    └── build/             ← created by `npm run build`
```

## 1. Create the MySQL database on Hostinger
1. hPanel → **Databases → MySQL Databases** → create a database + user, note the host/user/password/db name.
2. hPanel → **Databases → phpMyAdmin** → open your new database → **Import** → upload `server/schema.sql`.

## 2. Set up the Node.js app on Hostinger
1. hPanel → **Advanced → Node.js** → Create Application.
2. Node version: 18+ .
3. Application root: the folder you upload this project to (e.g. `manofox`).
4. **Application startup file**: `server/server.js`
5. In **Environment variables**, add everything from `.env.example` with your real values:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (from step 1)
   - `JWT_SECRET` — any long random string
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — your admin login (auto-created on first boot)
   - `CORS_ORIGINS` — your domain, e.g. `https://manofox.com` (or `*`)
6. Click **Run NPM Install** in the Hostinger Node.js panel (installs root deps: express, mysql2, etc).

## 3. Build the React frontend
You need the compiled `frontend/build` folder present before starting the app.
Easiest: build it locally and upload the `frontend/build` folder, OR use Hostinger's terminal/SSH:
```bash
cd frontend
npm install
npm run build
cd ..
```
(`npm run build` at the project root does this for you too.)

## 4. Start the app
In hPanel's Node.js app panel, click **Restart**. Your site (marketing pages + `/admin`) and
the API (`/api/...`) are now served from the same domain — no CORS issues, no separate backend URL.

## Local development
```bash
npm install                 # root deps
npm run build                # builds frontend/build
cp .env.example .env         # fill in local MySQL creds
npm start                    # runs on http://localhost:8000
```
If you prefer hot-reloading the React app while developing, run the CRA dev server separately
(`cd frontend && npm start`) and set `REACT_APP_BACKEND_URL=http://localhost:8000` in `frontend/.env`
so it talks to the Node API — this is optional and only for local dev.

## Admin login
Seeded automatically on first server start from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Log in at `/admin/login`.
