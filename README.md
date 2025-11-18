# Indux – Safety Induction Platform (Modular)

Indux is a single-tenant safety-induction platform built with a clean separation between the parent **Project** entity and a pluggable **InductionModule**. Backend is Node.js/Express + TypeScript + MongoDB; frontend is React + Vite + MUI + Zustand. Storage uses MinIO (S3 compatible). Docker Compose orchestrates the stack locally and in production.

---

## Stack Overview

| Layer       | Technology / Notes                                                                 |
|-------------|-------------------------------------------------------------------------------------|
| API         | Node.js (18+) + Express + TypeScript, Mongoose ODM, JWT auth                        |
| Frontend    | React 18 + Vite, Material UI 5, Zustand state, Axios API client                     |
| Persistence | MongoDB                                                                             |
| Storage     | MinIO (S3 compatible) for uploads, slide decks, certificates                        |
| Auth        | JWT access/refresh tokens with automatic refresh + global 401/403 handling          |
| Deploy      | Docker Compose (local), Caddy/Dokploy (production reverse proxy)                    |

```
/api        -> Express API (Project + module architecture)
/frontend   -> React app
/docs       -> Architecture notes
docker-compose.yml -> API + Frontend + Mongo + MinIO + Caddy
```

---

## Architecture: Project (parent) + InductionModule (module)

**Project** (parent, clean)
```
{ _id, name, description, address?, managers[], status: draft|active|archived, createdBy, createdAt, updatedAt }
```

**InductionModule** (child, type: "induction")
```
{ _id, projectId, type: 'induction', reviewStatus: draft|pending|approved|declined,
  config: {
    steps: string[]
    slides: [ { key, title?, fileKey, thumbKey?, order } ]
    quiz: { questions: [ { question, options[], answerIndex } ] }
    settings: { passMark, randomizeQuestions, allowRetry }
  },
  createdBy, updatedBy, createdAt, updatedAt
}
```

**InductionModuleField**
```
{ _id, moduleId, key, label, type(text|number|date|select|file|textarea|boolean), required, order, step, options? }
```

**ModuleReview**
```
{ _id, moduleId, projectId, type:'induction', data(snapshot), status: pending|approved|declined,
  reason?, requestedBy, reviewedBy?, createdAt, updatedAt }
```

**Submission**
```
{ _id, moduleId, projectId, userId, status: pending|approved|declined,
  payload, uploads:[{key,type}], quiz:{ answers, score, passed }, signatureDataUrl?, certificateKey?,
  reviewedBy?, reviewReason?, createdAt, updatedAt }
```

Assignments remain project-scoped (manager/worker) and gate submissions.

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
```

---

## API Surface (key endpoints)

- **Projects**: `GET /projects`, `POST /projects`, `PUT /projects/:id`, `DELETE /projects/:id`
- **Modules (induction)**:
  - `POST /projects/:projectId/modules/induction` (create if missing)
  - `GET /projects/:projectId/modules/induction`
  - `PUT /modules/:moduleId` (config/status, accepts optional `fields` bulk replacement)
- **Fields**: `GET /modules/:moduleId/fields`, `POST /modules/:moduleId/fields`, `PUT /module-fields/:id`, `DELETE /module-fields/:id`
- **Reviews**: `POST /modules/:moduleId/reviews`, `GET /modules/:moduleId/reviews`, `POST /modules/:moduleId/reviews/:reviewId/approve`, `POST /modules/:moduleId/reviews/:reviewId/decline`
- **Submissions**: `POST /modules/:moduleId/submissions`, `GET /modules/:moduleId/submissions`, `POST /submissions/:id/approve`, `POST /submissions/:id/decline`
- **Assignments**: unchanged (project-scoped manager/worker assignment)
- **Auth/Uploads/Users/Brand Config**: unchanged

A submission requires: worker assignment to the project, and the module reviewStatus approved.

---

## Frontend Highlights

- Axios client with refresh token handling (`frontend/src/utils/api.js`).
- Admin consoles (`/admin/projects`, `AdminConsole`) now edit **Project** metadata separately from the **InductionModule** (fields, slides, quiz, settings).
- Review queue consumes module-based submissions/reviews (`/modules/...`).
- Worker induction wizard loads module + fields via `/projects/:projectId/modules/induction` and submits to `/modules/:moduleId/submissions`.

---

## Data Flow Summary

```
Project (clean)
  ↳ InductionModule (type='induction')
      ↳ InductionModuleField (personal data schema)
      ↳ ModuleReview (snapshots config+fields)
      ↳ Submission (worker output) -> certificate in MinIO
Assignment (user ↔ project, manager|worker)
```

- Only approved modules accept submissions.
- Assignments gate worker submissions and manager/team access.
- Submissions approved -> certificate stored in `certs/{project}/{module}/{submission}.pdf`.

---

## Deployment Notes

- `.env` declares Mongo/MinIO credentials, JWT secrets, SMTP, and CORS origins.
- Docker Compose runs Mongo, MinIO, API, Frontend, Caddy. Caddy strips `/api` before proxying to the API.
- Certificates generated via `api/src/services/pdf.ts` and stored in MinIO.
- Health check: `GET /health`.

---

## Status

- ✅ Project is clean (no induction data).
- ✅ Induction module encapsulates config, fields, slides, quiz, reviews, submissions.
- ✅ Frontend consumes module endpoints (admin editors, review queue, worker wizard).
- ✅ Legacy project-based induction endpoints removed.

Future modules (risk, tasks, materials, etc.) can follow the same pattern: parent Project + module collection + module-specific fields/reviews/submissions.
