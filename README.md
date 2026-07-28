# Community Blood Donation Network

Full-stack platform connecting verified hospitals with blood donors in real time — built for a 3-day team sprint.

**Team:** Caren & Ian (Backend) · Rehema & Victor (Frontend)

## What's actually built vs. what's left

| Feature | Status |
|---|---|
| 5 models, JWT auth, password reset, donor/hospital/request/donation/admin endpoints |  Built |
| Matching algorithm (blood type compatibility + city) |  Built |
| **Real-time notifications via WebSockets** | Built — `Flask-SocketIO` on the backend (`app/sockets.py`), `socket.io-client` on the frontend (`src/services/socket.js`). A donor's Matches page updates live when a hospital runs the matching algorithm, no refresh needed. |
| **Automated hospital verification** |  Built, with a caveat below — integrates with Kenya's official [KMHFR](https://mfl-api-docs.readthedocs.io/en/latest/) (Kenya Master Health Facility Registry) to auto-verify a hospital at signup if it finds a confident name+county match. Falls back to the existing manual admin-review flow (`/admin/hospitals`) if the API can't confirm a match. |
| React SPA, protected routes, 13 routes |  Built |
| Live deployment to Render/Vercel | Not done — see "Deploying" below. Nobody can create your team's cloud accounts remotely; these are the exact steps for whoever owns the Day 3 deploy task. |

### A note on the KMHFR integration

`app/services/hospital_verification.py` calls the real, public KMHFR API (`api.kmhfr.health.go.ke`) — this is not a mock. That said:

- It's a **best-effort name/county match**, not a legal guarantee — a false negative just means the hospital falls back to manual admin approval (safe); the code is written conservatively so it never auto-verifies on a weak match.
- KMHFR's list endpoint is publicly readable for basic search, but production integrations may need a registered API account for heavier or authenticated use — check current requirements at the docs link before relying on this for a real deployment, since access policies can change.
- Admins can also manually re-trigger the check via `POST /api/hospitals/<id>/auto-verify`, or just approve manually as before.

## Project structure

```
blood-donation-network/
├── server/                  # Flask REST API
│   ├── app/
│   │   ├── models/          # Caren — Day 1
│   │   ├── routes/          # auth (Ian/Caren), donors/requests (Caren),
│   │   │                    # hospitals/matches-creation (Victor), donations (Caren),
│   │   │                    # admin (Victor)
│   │   ├── services/        # matching.py + hospital_verification.py (Victor)
│   │   ├── auth/             # decorators + reset tokens (Ian/Caren)
│   │   └── sockets.py        # WebSocket real-time layer (Victor)
│   ├── run.py
│   ├── requirements.txt
│   └── render.yaml
│
├── client/                  # React SPA (Vite)
│   ├── src/
│   │   ├── context/          # AuthContext (Rehema)
│   │   ├── routes/           # ProtectedRoute (Victor)
│   │   ├── pages/            # split across Rehema/Victor/Ian per the sprint plan
│   │   └── services/         # api.js, socket.js
│   └── index.html
│
├── README.md
└── LICENSE
```

## Running locally

### Backend
```bash
cd server
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in JWT_SECRET_KEY, DATABASE_URL, mail creds
python run.py
```
Runs on `http://localhost:5000`. `run.py` calls `db.create_all()` on startup for local dev — use real migrations (Flask-Migrate/Alembic) before production.

### Frontend
```bash
cd client
npm install
cp .env.example .env   # set VITE_API_URL to your backend URL
npm run dev
```
Runs on `http://localhost:5173`.

## Deploying (Day 3 — not yet done)

### Backend → Render
1. Push this repo to GitHub.
2. On Render: **New** → **Blueprint** → point at this repo (it will read `server/render.yaml`).
3. Set the env vars Render prompts for: `JWT_SECRET_KEY`, `DATABASE_URL` (Render can provision the free Postgres itself), `MAIL_USERNAME`, `MAIL_PASSWORD`, `FRONTEND_URL` (fill in once the frontend is deployed).
4. Deploy. Note the resulting public API URL.

### Frontend → Vercel or Netlify
1. Import the repo, set the project root to `client/`.
2. Build command: `npm run build`. Output directory: `dist`.
3. Set env var `VITE_API_URL` to `<your-backend-url>/api`.
4. Deploy. Take the resulting URL back to Render and set it as `FRONTEND_URL` so CORS and WebSocket origins are correct.

## License
MIT — see `LICENSE`.

