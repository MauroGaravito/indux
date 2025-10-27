# Indux – HammerTech‑style Induction Tool (Mono‑Repo)

Indux is a single‑tenant construction safety induction tool. It provides an Admin console to configure projects, a Manager review queue to approve worker submissions and project configs, and a Worker wizard to complete an induction. This repository includes a TypeScript Node/Express API and a Vite + React frontend. Local development runs via Docker Compose, and the same compose file is deploy‑ready for Dokploy.

---

## Production

* Live app: [https://indux.downundersolutions.com/](https://indux.downundersolutions.com/)
* API (proxied by Caddy): [https://indux-api.downundersolutions.com/](https://indux-api.downundersolutions.com/)

## Local quick links

* Backend: [http://localhost:8080/health](http://localhost:8080/health)
* Frontend: [http://localhost:5173](http://localhost:5173)
* MinIO Console: [http://localhost:9001](http://localhost:9001)

---

## Features

* Roles and auth: admin, manager, worker with JWT access/refresh tokens
* Projects with configurable steps and JSON config
* Worker induction wizard: project select, personal details, slides viewer, quiz, signature, submit
* Manager review queue: approve/decline worker submissions; auto‑generates certificate PDF and emails worker
* Admin console:

  * Section 1 – Project Information: name, address, value, map upload (image)
  * Section 2 – Personal Details (Configurator): required/optional toggles, add custom fields (Text/Image/Camera)
  * Section 3 – Induction Slides: upload PPT/PPTX (viewer stub; recommended to convert to images/PDF)
  * Section 4 – Test Questions: dynamic MCQ builder with correct answer
* File uploads via MinIO (S3‑compatible) using presigned URLs
* Certificates generated with PDFKit and stored in MinIO
* Emails via SMTP (Nodemailer)
* Zod validation on the API

---

## Tech Stack

* Backend: Node.js, Express, TypeScript, Mongoose, JWT, MinIO SDK, Nodemailer, PDFKit, Zod
* Frontend: React 18, Vite, React Router, MUI v6, Zustand, React Hook Form, Zod, Axios
* Infra: Docker Compose (api, frontend, mongo, minio). Dokploy uses the same compose file.

---

## Environment Variables

Environment is provided via Dokploy in production (no `.env` committed in the repo). For local development you can create an `.env` in the project root. See `.env.example` for defaults. Key variables:

```env
PORT=8080
MONGO_URI=mongodb://mongo:27017/indux
JWT_ACCESS_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
S3_ENDPOINT=http://minio:9000
S3_REGION=us-east-1
S3_BUCKET=indux
S3_ACCESS_KEY=your-key
S3_SECRET_KEY=your-secret
S3_USE_SSL=false
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password
MAIL_FROM=Indux <no-reply@indux.local>
FRONTEND_URL=https://indux.downundersolutions.com,http://localhost:5173
VITE_API_URL=https://indux-api.downundersolutions.com
SEED=true
```

---

## Running In Production (Dokploy + Caddy)

* Dokploy uses this repo’s `docker-compose.yml` unmodified.
* All environment variables are configured in Dokploy (no `.env` in the repo).
* Caddy proxies the frontend and API.

  * `indux.downundersolutions.com` → frontend (port 5173)
  * `indux-api.downundersolutions.com` → API (port 8080) with CORS allowing the frontend origin
* Ensure these envs are set in Dokploy for production:

  * `FRONTEND_URL=https://indux.downundersolutions.com`
  * `VITE_API_URL=https://indux-api.downundersolutions.com`
* After changing either value, rebuild the frontend in Dokploy so the bundle gets the new `VITE_API_URL`:

  ```bash
  docker compose build frontend && docker compose up -d
  ```

---

## Running Locally (Development)

Because production env is managed by Dokploy, the repo ships without a `.env`. To run locally:

```bash
cp .env.example .env
```

Edit `.env` with local values:

```env
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:8080
SEED=true
```

Start the stack:

```bash
docker compose up -d --build
```

Validate:

* Backend: [http://localhost:8080/health](http://localhost:8080/health)
* Frontend: [http://localhost:5173](http://localhost:5173)
* MinIO: [http://localhost:9001](http://localhost:9001)

PowerShell helper scripts (Windows)

* `api/scripts/rebuild-api.ps1 [-NoCache]`
* `api/scripts/rebuild-frontend.ps1 [-NoCache]`
* `api/scripts/rebuild-mongo.ps1`
* `api/scripts/rebuild-minio.ps1`
* `api/scripts/rebuild-all.ps1 [-NoCache]`

---

## Seeded Demo Users

* Admin: `admin@indux.local` / `admin123`
* Manager: `manager@indux.local` / `manager123`
* Worker: `worker@indux.local` / `worker123`

---

## API Overview

* `GET /health` – health check
* `POST /auth/login` – returns `{ accessToken, refreshToken, user }`
* `POST /auth/refresh`
* `GET /projects` – list
* `POST /projects` (admin) – create
* `PUT /projects/:id` (admin) – update (supports `config` JSON)
* `DELETE /projects/:id` (admin)
* `POST /uploads/presign` (auth) – returns `{ key, url }`
* `POST /submissions` (worker) – create worker submission
* `GET /submissions` (manager/admin) – list pending
* `POST /submissions/:id/approve` (manager/admin) – generate certificate + email
* `POST /submissions/:id/decline` (manager/admin)
* `POST /reviews/projects` (admin) – send project config for review
* `GET /reviews/projects` (manager/admin) – pending reviews
* `POST /reviews/projects/:id/approve|decline` (manager/admin)

---

## Frontend Usage

Login

* Login page redirects after success: Admin → `/admin`, Manager → `/review`, Worker → `/`.

Admin Console

* Section 1 – Project Information

  * Required inputs: `projectName`, `projectAddress`, `projectValue` (number)
  * Map upload accepts images; stored in MinIO; saved as `config.projectInfo.projectMapKey`.
* Section 2 – Personal Details (Configurator)

  * Admin configures a list of fields, not values.
  * Built‑in fields cannot be removed or retargeted; only Required/Optional can be toggled.
  * Add custom fields with Name, Type (Text, Image, Camera), Required flag.
  * Stored at `project.config.personalDetails.fields`.
* Section 3 – Induction Slides

  * Upload `.ppt`/`.pptx`; saved key at `config.slides.pptKey`. The worker viewer is stubbed (text slides sample).
* Section 4 – Test Questions

  * Add questions with multiple answers and select a correct answer.
* Actions

  * Save: persists `config` to the selected project.
  * Send For Review: creates a manager review request (`/reviews/projects`).

Manager Review

* Review Queue lists:

  * Worker submissions → Approve/Decline
  * Project reviews → Approve/Decline

Worker Wizard

* Steps: select project → personal details → slides → quiz → signature → submit
* Submits to `/submissions` and moves to manager review.

---

## Files, Uploads, and Certificates

* MinIO bucket is ensured on demand and used for:

  * Uploads via `PUT` to presigned URLs
  * Stored project assets (maps, slides) and generated certificates
* Certificates

  * Created with PDFKit and saved to `certs/<uuid>.pdf` in MinIO upon approval.

---

## Troubleshooting

* **502 from Caddy** → confirm upstream ports: frontend 5173, API 8080; Caddy proxies to those; services are up.
* **CORS/Login errors** → ensure:

  * API env `FRONTEND_URL` includes the active origin (prod and/or local).
  * Frontend built with correct `VITE_API_URL`. Rebuild frontend after changing it.
  * Preflight test: `curl -X OPTIONS http://localhost:8080/auth/login -H "Origin: <your_frontend_origin>" -i` shows `Access-Control-Allow-Origin` with your origin.
* **MinIO upload issues** → verify `S3_ACCESS_KEY`/`S3_SECRET_KEY` and bucket; check `/uploads/presign` works; restart `minio`.
* **Clean rebuild** → `docker compose build --no-cache api frontend && docker compose up -d`.

---

## Appendix: Example Caddy Configuration

```caddy
# Frontend and API reverse proxy (HTTPS)
indux.downundersolutions.com {
    encode gzip

    @cors_preflight method OPTIONS
    header @cors_preflight Access-Control-Allow-Origin https://indux.downundersolutions.com
    header @cors_preflight Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    header @cors_preflight Access-Control-Allow-Headers "*"
    respond @cors_preflight 204

    handle /api/* {
        reverse_proxy indux-api:8080
    }

    handle {
        reverse_proxy indux-frontend:80
    }

    header Access-Control-Allow-Origin https://indux.downundersolutions.com
    header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"

    log {
        output file /var/log/caddy/indux.access.log
        format json
    }
```
