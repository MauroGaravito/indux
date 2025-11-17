# Indux – Safety Induction Platform

Indux is a single-tenant safety-induction platform that combines a Node/Express API, a React + Vite frontend, and MongoDB + MinIO for persistence. The entire stack lives in this monorepo and is orchestrated locally (and in production) via Docker Compose.

---

## Stack Overview

| Layer       | Technology / Notes                                                                 |
|-------------|-------------------------------------------------------------------------------------|
| API         | Node.js (18+) + Express + TypeScript, Mongoose ODM, JWT authentication              |
| Frontend    | React 18 + Vite, Material UI 5, Zustand state, Axios API client                     |
| Persistence | MongoDB (projects, assignments, submissions, reviews, users)                        |
| Storage     | MinIO (S3 compatible) for uploads, slide decks, certificates                        |
| Auth        | JWT access/refresh tokens with automatic refresh + global 401/403 handling          |
| Deploy      | Docker Compose (local), Caddy/Dokploy (production reverse proxy)                    |

```
/api        -> Express API
/frontend   -> React app
/docs       -> Architecture notes
docker-compose.yml    -> API + Frontend + Mongo + MinIO + Caddy
```

---

## Running the Platform Locally

```bash
# 1. Copy env templates
cp api/.env.example api/.env
cp frontend/.env.example frontend/.env

# 2. Start services
docker-compose up --build

# 3. Access
# Frontend: http://localhost:5173
# API:      http://localhost:8080
# Mongo Express, MinIO, etc. are exposed via docker-compose ports
```

Production uses the *same docker-compose.yml* behind Caddy/Dokploy. Mongo and MinIO volumes persist data between restarts.

---

## Local Development Scripts

### API (`/api`)

| Command            | Description                                                   |
|--------------------|---------------------------------------------------------------|
| `npm install`      | Install backend dependencies.                                 |
| `npm run dev`      | Start Express with `ts-node-dev` + live reload on port 8080.  |
| `npm run build`    | Compile TypeScript to `dist/`.                                |
| `npm start`        | Run the compiled build (expects `dist/index.js`).             |
| `npm run seed`     | Execute `src/seed.ts` once (RESPECTS `MONGO_URI`, `SEED`).     |

### Frontend (`/frontend`)

| Command            | Description                                                         |
|--------------------|---------------------------------------------------------------------|
| `npm install`      | Install UI dependencies.                                            |
| `npm run dev`      | Launch Vite dev server on `http://localhost:5173`.                  |
| `npm run build`    | Produce the production build consumed by the Docker image/Nginx.    |
| `npm run preview`  | Serve the production build locally (binds to port 5173).            |

> Tip: Keep `.env.local` (frontend) aligned with `VITE_API_URL` and run API + frontend without Docker when debugging auth flows.

---

## Roles & Workflow

| Role    | Responsibilities                                                                                             |
|---------|--------------------------------------------------------------------------------------------------------------|
| Admin   | Create/update/delete projects, manage global settings, define ProjectFields, request project reviews         |
| Manager | Approve/decline project reviews, assign workers, manage teams, review worker submissions, monitor dashboards |
| Worker  | View assigned (approved) projects, complete the Induction Wizard, track submission status & certificates     |

### Pipeline

1. **Admin** creates a project and configures:
   * Project info (name/address/map key).
   * ProjectFields (personal data schema).
   * Slides (ppt file key).
   * Quiz questions.
2. Admin clicks **Send For Review** → `reviewStatus = pending`.
3. **Manager** opens `/manager/review` and:
   * Sees **Project Reviews** (snapshot of fields + config).
   * Approves or declines (with reason). Approved projects immediately flip `reviewStatus = approved`.
4. **Manager** (only on approved projects) assigns workers via `/assignments`.
5. **Worker** dashboard pulls `/projects` (filtered by assignments + reviewStatus) and enters the Induction Wizard:
   * Step 1: Project selection + gating (approved only).
   * Step 2: Personal details generated from ProjectFields.
   * Step 3: Slides (ppt).
   * Step 4: Quiz.
   * Step 5: Signature & submission.
6. Backend enforces **one active submission per worker/project**:
   * Existing `pending` / `declined` submissions are overwritten.
   * Existing `approved` submissions return HTTP 409 and UI locks the project.
7. **Manager/Admin** review worker submissions via `/manager/review` or `/admin/review`:
   * Submission modal includes worker info, uploads, quiz, signature, and a download link for each file.
   * Approve triggers PDF certificate generation + email, decline captures a reason.
8. **Dashboards** (manager/admin) reflect assignments, review queue counts, submissions, and system status.

---

## Single Source of Truth – Project Fields

* Project personal-data schema lives in `ProjectField` documents (`api/src/models/ProjectField.ts`).
* Endpoints:
  - `GET /projects/:projectId/fields` (role aware: admin, manager, worker assigned/approved).
  - `POST /projects/:projectId/fields`
  - `PUT /fields/:id`
  - `DELETE /fields/:id`
* Project detail responses embed `fields` sorted by `order`. The wizard, review modal, and dashboards consume these—legacy `project.config.personalDetails` is gone.

---

## API Surface (Key Endpoints)

```
# Health
GET    /health                      -> service heartbeat consumed by uptime checks

# Auth
POST   /auth/login                  -> JWT access + refresh tokens
POST   /auth/refresh                -> exchange refresh token for a new access token
POST   /auth/register               -> public worker self-signup (pending admin approval)
POST   /auth/verify-email           -> verify email via token sent in the request body
GET    /auth/verify-email           -> verify email via query token (used by emailed links)
POST   /auth/resend-verification    -> resend verification email to users still pending

# Projects
GET    /projects                     -> filtered by role/assignments
POST   /projects                     -> admin only
GET    /projects/:id                 -> role-aware, includes embedded fields
PUT    /projects/:id                 -> admin/manager (if editable)
DELETE /projects/:id                 -> admin

# Project fields
GET    /projects/:projectId/fields   -> admin/manager/worker (approved, assigned)
POST   /projects/:projectId/fields   -> admin/manager
PUT    /fields/:id                   -> admin/manager
DELETE /fields/:id                   -> admin/manager

# Users
GET    /users                        -> admin user directory (optional status filter)
GET    /users/workers                -> admin/manager view of approved workers (for assignments)
POST   /users                        -> admin creates a user (auto-verifies email)
PUT    /users/:id                    -> admin updates user profile/role/password
PATCH  /users/:id/status             -> admin toggles pending/approved/disabled
DELETE /users/:id                    -> admin deletes a user record

# Reviews (project-level)
POST /reviews/projects               -> admin requests review, snapshots config+fields
GET  /reviews/projects               -> admin (all) / manager (assigned)
POST /reviews/projects/:id/approve   -> manager/admin approve review
POST /reviews/projects/:id/decline   -> manager/admin decline review (reason)
DELETE /reviews/:id                  -> admin cleanup

# Assignments
POST   /assignments                  -> admin assigns managers, managers assign workers
GET    /assignments/project/:id      -> admin/managers
GET    /assignments/user/:id         -> admin/managers/workers (self)
GET    /assignments/manager/:id/team -> admin/manager view of a manager's worker roster
DELETE /assignments/:id              -> admin/manager (if assigned)

# Submissions (worker induction responses)
POST   /submissions                  -> worker (single active submission enforced)
GET    /submissions                  -> admin (all), manager (assigned projects), worker (self)
GET    /submissions/:id              -> returns submission + project + fields snapshot
POST   /submissions/:id/approve      -> manager/admin (assignment enforced)
POST   /submissions/:id/decline      -> manager/admin
DELETE /submissions/:id              -> admin

# Uploads
POST   /uploads/presign              -> S3 presign for PUT uploads (MinIO)
POST   /uploads/presign-get          -> presign a GET URL for downloading existing objects
GET    /uploads/stream               -> proxy file download/preview through the API

# Brand config
GET    /brand-config                 -> public read for theme/logo data
POST   /brand-config                 -> admin create brand configuration
PUT    /brand-config/:id             -> admin update existing brand config
```

The API response layer uses consistent 4xx/5xx errors via a shared HttpError helper. Workers hitting unauthorized resources see a global 401 redirect to `/login` or a 403 toast (“You are not allowed to access this resource.”).

---

## Frontend Highlights

* **Global Axios Interceptor** (frontend/src/utils/api.js) – handles bearer token injection, refresh, and 401/403 user experience.
* **Role Layouts**:
  * `/admin/*`, `/manager/*`, `/worker/*` share card-based dashboards and forms.
* **ReviewQueue.jsx** – now split into **Project Reviews** (snapshots) and **Submissions**.
  * Uses `ProjectReviewModal` and `SubmissionReviewModal`.
* **Project Fields Editor** – shared between admin and manager views (read/write permissions enforced by backend).
* **Induction Wizard** – dynamically renders personal fields, uploads, quiz, and slides; handles 409 (already approved) gracefully.

---

## Data Flow Summary

```
Project (reviewStatus: draft/pending/approved/declined)
  ↳ ProjectFields (custom schema for personal data)
  ↳ ProjectReview (snapshot of config + fields, pending approval)
Assignment (user ↔ project, role: manager or worker)
Submission (worker output, status: pending/approved/declined)
```

* Only **approved** projects appear to workers.
* **Assignments** gate every operation (manager updates, worker submissions, review visibility).
* **Submissions** reference projects + workers; deletion cascades when a project is removed.

---

## Core Data Models

| Collection      | Key Fields / Notes                                                                                                      |
|-----------------|-------------------------------------------------------------------------------------------------------------------------|
| `User`          | `{ email, name, role: admin/manager/worker, status, disabled, emailVerified, lastLoginAt }` (password stored hashed).   |
| `Project`       | `{ name, description, steps[], config, managers[], editableByManagers, reviewStatus, reviewedAt }`.                     |
| `ProjectField`  | `{ projectId, key, label, type(text/number/date/select/boolean/file), required, order, step, options[] }`.              |
| `ProjectReview` | Snapshot of a project ready for approval: `{ projectId, requestedBy, data, status, reviewedBy, reason/message }`.       |
| `Assignment`    | Link between `user` and `project` with `{ role(manager|worker), assignedBy, endedAt }`.                                 |
| `Submission`    | Worker output `{ projectId, userId, personal payload, uploads[], quiz stats, signatureDataUrl, status, certificateKey }`.|
| `BrandConfig`   | Tenant branding `{ companyName, logoUrl, primaryColor, secondaryColor, createdBy }`.                                    |

Each schema lives under `api/src/models/` and exposes indexes for lookups (e.g., `Assignment` enforces one per user/project). When evolving data, add migrations/seeds to keep the wizard/review snapshots consistent.

---

## Deployment Notes

* `.env` files specify Mongo/MinIO credentials, JWT secrets, SMTP settings for notifications, and CORS origins.
* Dokploy deploys use the following `.env` baseline (override secrets per environment):

  ```ini
  NODE_ENV=production
  PORT=8080
  MONGO_URI=mongodb://admin:supersecurepassword@mongo:27017/indux?authSource=admin
  MONGO_USER=admin
  MONGO_PASS=supersecurepassword
  JWT_ACCESS_SECRET=change_me_access_32chars_or_more
  JWT_REFRESH_SECRET=change_me_refresh_32chars_or_more
  ACCESS_TOKEN_TTL=15m
  REFRESH_TOKEN_TTL=7d
  S3_ENDPOINT=http://minio:9000
  S3_USE_SSL=false
  PUBLIC_S3_ENDPOINT=https://indux.downundersolutions.com
  S3_BUCKET=indux
  S3_REGION=us-east-1
  S3_ACCESS_KEY=induxadmin
  S3_SECRET_KEY=please_change_me
  SMTP_HOST=
  SMTP_PORT=587
  SMTP_USER=
  SMTP_PASS=
  MAIL_FROM="Indux <no-reply@downundersolutions.com>"
  FRONTEND_URL=https://indux.downundersolutions.com,http://localhost:5173
  VITE_API_URL=https://indux.downundersolutions.com/api
  TRUST_PROXY=1
  SEED=true
  ```
* Docker Compose services (`docker-compose.yml`) and exposed ports:

  | Service   | Image / Build              | Ports (host→container)     | Notes                                         |
  |-----------|---------------------------|----------------------------|-----------------------------------------------|
  | `mongo`   | `mongo:7`                 | _none_ (internal only)     | Auth enforced via `MONGO_USER/PASS`; persistent volume `indux_mongo_data`. |
  | `minio`   | `minio/minio:latest`      | `9000`, `9001`             | Console on `9001`; bucket data stored in `indux_minio_data`.                |
  | `api`     | Build `./api`             | exposed `8080` (no host)   | Depends on Mongo + MinIO; trust proxy/CORS configured via env.              |
  | `frontend`| Build `./frontend` (Vite) | exposed `80` (no host)     | Receives `VITE_API_URL` build arg + env for runtime.                        |
  | `caddy`   | Managed by Dokploy        | 443/80                     | Reverse proxy defined below (handles `/api`, MinIO, frontend, console).     |

* Caddy strips `/api` prefix before proxying to the API container.
* Dokploy's Caddyfile ensures MinIO, API, and frontend routing; mirror this when adding new services:

  ```caddyfile
  indux.downundersolutions.com {
      encode gzip

      @cors_preflight method OPTIONS
      header @cors_preflight Access-Control-Allow-Origin https://indux.downundersolutions.com
      header @cors_preflight Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
      header @cors_preflight Access-Control-Allow-Headers "*"
      respond @cors_preflight 204

      @favicon path /indux-icon.png
      handle @favicon {
          reverse_proxy indux-frontend:80
      }

      @s3 path /indux*
      handle @s3 {
          reverse_proxy indux-minio:9000 {
              header_up Host {http.request.host}
              header_up X-Forwarded-Host {http.request.host}
              header_up X-Forwarded-Proto https
          }
      }

      handle /minio-console/* {
          reverse_proxy indux-minio:9001
      }

      handle_path /api/* {
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
  }
  ```
* Certificates are generated via `api/src/services/pdf.ts` and stored under `certs/` in MinIO.
* Health check: `GET /health`.

---

## Report / Alignment Status

* ✅ Project-field workflow fully migrated to `ProjectField` documents; no legacy `project.config.personalDetails`.
* ✅ Review pipeline (admin → manager) is active with `/reviews/projects`.
* ✅ Manager Review queue now includes both project reviews and worker submissions.
* ✅ Worker wizard enforces approved projects and single-active-submission logic.
* ✅ Global 401/403 handling ensures sessions expire cleanly and unauthorized actions give users immediate feedback.
* ✅ Dashboards (admin/manager/worker) consume the new filtered data sources and display reviewStatus everywhere relevant.

The README now matches the current pipeline and components. If any future enhancements alter the workflow (multi-tenant setup, additional roles, more granular permissions), update the sections above so every contributor can trace the lifecycle from project creation to worker certification.
