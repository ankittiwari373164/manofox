# Manofox — Digital Marketing Agency Site

Exact rebuild of the site from the provided build transcript: React + Tailwind marketing site
(Framer Motion, React Three Fiber hero, Lenis smooth scroll) with a FastAPI + MongoDB backend
and a protected admin panel for leads and site content.

## Run the backend

    cd backend
    python -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    uvicorn server:app --reload --port 8000

MongoDB must be running at the `MONGO_URL` in `backend/.env`. On startup the admin user is seeded.

## Run the frontend

    cd frontend
    npm install
    npm start

`frontend/.env` sets `REACT_APP_BACKEND_URL` (default `http://localhost:8000`).

## Admin credentials

    admin@manofox.com / Manofox@2026

Admin panel: `/admin/login` → `/admin` (dashboard), `/admin/leads`, `/admin/content`.

## Routes

Marketing: `/`, `/services`, `/about`, `/portfolio`, `/blog`, `/contact`

## API

| Method | Path | Auth |
| --- | --- | --- |
| GET | /api/ | public |
| POST | /api/auth/login | public |
| GET | /api/auth/me | bearer |
| POST | /api/auth/logout | public |
| POST | /api/leads | public (contact form) |
| GET | /api/leads?status= | bearer |
| PATCH | /api/leads/{id} | bearer |
| DELETE | /api/leads/{id} | bearer |
| GET | /api/stats | bearer |
| POST | /api/newsletter | public |
| GET | /api/content | public |
| PUT | /api/content | bearer |

## Notes

- The `frontend/src/components/ui/` folder here contains only the two shadcn primitives the app
  imports (`select`, `alert-dialog`). Add the rest with the shadcn CLI if you need them.
- Node engine warnings from `camera-controls` are handled by `frontend/.npmrc` (`engine-strict=false`), so plain `npm install` works. `legacy-peer-deps=true` is set there too for the React 18 peer ranges.
- Use `npm run build` for a production bundle.
