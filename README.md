# Indux – HammerTech‑style Induction Tool (Mono‑Repo)

Indux is a single‑tenant construction safety induction tool. It provides an Admin console to configure projects, a Manager review queue to approve worker submissions and project configs, and a Worker wizard to complete an induction. This repository includes a TypeScript Node/Express API and a Vite + React frontend. Local development runs via Docker Compose, and the same compose file is deploy‑ready for Dokploy.

Quick links
- Backend: http://localhost:8080/health
- Frontend: http://localhost:5173
- MinIO Console: http://localhost:9001

## Features
- Roles and auth: admin, manager, worker with JWT access/refresh tokens
- Projects with configurable steps and JSON config
- Worker induction wizard: project select, personal details, slides viewer, quiz, signature, submit
- Manager review queue: approve/decline worker submissions; auto‑generates certificate PDF and emails worker
- Admin console:
  - Section 1 – Project Information: name, address, value, map upload (image)
  - Section 2 – Personal Details (Configurator): required/optional toggles, add custom fields (Text/Image/Camera)
  - Section 3 – Induction Slides: upload PPT/PPTX (viewer stub; recommended to convert to images/PDF)
  - Section 4 – Test Questions: dynamic MCQ builder with correct answer
- File uploads via MinIO (S3‑compatible) using presigned URLs
- Certificates generated with PDFKit and stored in MinIO
- Emails via SMTP (Nodemailer)
- Zod validation on the API

## Tech Stack
- Backend: Node.js, Express, TypeScript, Mongoose, JWT, MinIO SDK, Nodemailer, PDFKit, Zod
- Frontend: React 18, Vite, React Router, MUI v6, Zustand, React Hook Form, Zod, Axios
- Infra: Docker Compose (api, frontend, mongo, minio). Dokploy uses the same compose file.

## Repository Layout
```
indux/
├─ api/
│  ├─ src/
│  │  ├─ index.ts              # Express app entry
│  │  ├─ db.ts                 # Mongo connection
│  │  ├─ models/               # Users, Projects, Questions, Documents, Submissions, AuditLog, ProjectReview
│  │  ├─ routes/               # auth, projects, submissions, uploads, reviews
│  │  ├─ middleware/           # auth (JWT + roles)
│  │  ├─ services/             # tokens, minio, mailer, pdf
│  │  ├─ utils/                # zod validators
│  │  └─ seed.ts               # demo users + project + questions
│  ├─ scripts/                 # PowerShell helpers to rebuild containers
│  ├─ Dockerfile
│  ├─ package.json
│  └─ tsconfig.json
│
├─ frontend/
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ SignaturePad.jsx
│  │  │  └─ admin/
│  │  │     ├─ ProjectInfoSection.jsx
│  │  │     ├─ PersonalDetailsSection.jsx   # Field configurator (required/optional + custom fields)
│  │  │     ├─ SlidesSection.jsx
│  │  │     └─ QuestionsSection.jsx
│  │  ├─ pages/
│  │  │  ├─ Login.jsx
│  │  │  ├─ InductionWizard.jsx
│  │  │  ├─ AdminConsole.jsx
│  │  │  └─ ReviewQueue.jsx
│  │  ├─ store/                # auth, wizard
│  │  └─ utils/                # api client, upload helpers
│  ├─ Dockerfile
│  ├─ index.html
│  ├─ package.json
│  └─ vite.config.js
│
├─ docker-compose.yml
├─ .env.example
└─ README.md
```

## Services and Ports
- api → http://localhost:8080 (depends on mongo + minio)
- frontend → http://localhost:5173
- mongo → mongodb://localhost:27017 (volume persisted)
- minio → S3 API on 9000 and console on http://localhost:9001

## Environment Variables
See `.env.example` for defaults. Key variables:
- `PORT=8080` – API port
- `MONGO_URI=mongodb://mongo:27017/indux`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ACCESS_TOKEN_TTL`, `REFRESH_TOKEN_TTL`
- `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_USE_SSL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`
- `FRONTEND_URL=http://localhost:5173`
- `SEED=true` – seed demo users/project/questions on boot

## Getting Started (Docker Compose)
1) Create env file
```
cp .env.example .env
```
2) Start stack
```
docker compose up -d --build
```
3) Validate services
- Backend: http://localhost:8080/health → `{ ok: true, service: 'indux-api' }`
- Frontend: http://localhost:5173
- MinIO console: http://localhost:9001 (login using S3 access/secret from .env)

PowerShell helper scripts (Windows)
- `api/scripts/rebuild-api.ps1 [-NoCache]`
- `api/scripts/rebuild-frontend.ps1 [-NoCache]`
- `api/scripts/rebuild-mongo.ps1`
- `api/scripts/rebuild-minio.ps1`
- `api/scripts/rebuild-all.ps1 [-NoCache]`

## Seeded Demo Users
- Admin: `admin@indux.local` / `admin123`
- Manager: `manager@indux.local` / `manager123`
- Worker: `worker@indux.local` / `worker123`

## API Overview
- `GET /health` – health check
- `POST /auth/login` – returns `{ accessToken, refreshToken, user }`
- `POST /auth/refresh`
- `GET /projects` – list
- `POST /projects` (admin) – create
- `PUT /projects/:id` (admin) – update (supports `config` JSON)
- `DELETE /projects/:id` (admin)
- `POST /uploads/presign` (auth) – returns `{ key, url }`
- `POST /submissions` (worker) – create worker submission
- `GET /submissions` (manager/admin) – list pending
- `POST /submissions/:id/approve` (manager/admin) – generate certificate + email
- `POST /submissions/:id/decline` (manager/admin)
- `POST /reviews/projects` (admin) – send project config for review
- `GET /reviews/projects` (manager/admin) – pending reviews
- `POST /reviews/projects/:id/approve|decline` (manager/admin)

Collections (Mongoose)
- `users`, `projects`, `questions`, `documents`, `submissions`, `auditlogs`, `projectreviews`

## Frontend Usage
Login
- Login page redirects after success: Admin → `/admin`, Manager → `/review`, Worker → `/`.

Admin Console
- Section 1 – Project Information
  - Required inputs: `projectName`, `projectAddress`, `projectValue` (number)
  - Map upload accepts images; stored in MinIO; saved as `config.projectInfo.projectMapKey`.
- Section 2 – Personal Details (Configurator)
  - Admin configures a list of fields, not values.
  - Built‑in fields cannot be removed or retargeted; only Required/Optional can be toggled.
  - Add custom fields with Name, Type (Text, Image, Camera), Required flag.
  - Stored at `project.config.personalDetails.fields` as e.g.:
    ```json
    [
      { "key": "name", "label": "Name", "type": "text", "required": true, "builtin": true },
      { "key": "dob", "label": "Date of Birth", "type": "date", "required": true, "builtin": true },
      { "key": "custom-123", "label": "Work License", "type": "image", "required": false }
    ]
    ```
- Section 3 – Induction Slides
  - Upload `.ppt`/`.pptx`; saved key at `config.slides.pptKey`. The worker viewer is stubbed (text slides sample).
- Section 4 – Test Questions
  - Add questions with multiple answers and select a correct answer.
- Actions
  - Save: persists `config` to the selected project.
  - Send For Review: creates a manager review request (`/reviews/projects`).

Manager Review
- Review Queue lists:
  - Worker submissions → Approve/Decline
  - Project reviews → Approve/Decline

Worker Wizard
- Steps: select project → personal details → slides → quiz → signature → submit
- Submits to `/submissions` and moves to manager review.

## Files, Uploads, and Certificates
- MinIO bucket is ensured on demand and used for:
  - Uploads via `PUT` to presigned URLs
  - Stored project assets (maps, slides) and generated certificates
- Certificates
  - Created with PDFKit and saved to `certs/<uuid>.pdf` in MinIO upon approval.

## Deploying on Dokploy
- Use the same `docker-compose.yml`.
- Configure all environment variables in the Dokploy UI/secrets.
- Attach volumes for Mongo (`/data/db`) and MinIO (`/data`).
- Optionally externalize Mongo/MinIO and point the API to the external endpoints.

## Troubleshooting
- Frontend build fails missing `@mui/icons-material` → ensure it's installed (added).
- API build types for `jsonwebtoken`/`nodemailer` → dev types added and service typed.
- `npm ci` fails due to missing lockfile → Dockerfiles use `npm install`.
- CORS/Login errors → verify `FRONTEND_URL` matches http://localhost:5173 and tokens are attached by the frontend.
- MinIO access errors → verify `S3_ACCESS_KEY`/`S3_SECRET_KEY` and bucket; restart `minio` service.
- Need clean rebuild → `docker compose build --no-cache api frontend` then `docker compose up -d`.

## Roadmap / Notes
- Slides viewer currently stubbed; for production use slide images or PDF conversion.
- Worker personal details form can be rendered dynamically from `project.config.personalDetails.fields` (pending).
- Email provider can be swapped for Postmark/SES; Nodemailer interface is abstracted in `api/src/services/mailer.ts`.
