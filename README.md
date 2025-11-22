# Indux - Safety Induction Platform (Modular)

Indux is a single-tenant safety induction platform built around a clean separation between the parent **Project** entity and pluggable **modules** (currently only the Induction module). Backend: Node.js/Express + TypeScript + MongoDB; frontend: React + Vite + Material UI + Zustand. Storage uses MinIO (S3-compatible) and Docker Compose orchestrates the whole stack.

---

## Stack Overview

| Layer       | Technology / Notes                                                                 |
|-------------|-------------------------------------------------------------------------------------|
| API         | Node.js 18+, Express, TypeScript, Mongoose, JWT auth                                |
| Frontend    | React 18 + Vite, Material UI 5, Zustand state, Axios client                         |
| Persistence | MongoDB                                                                             |
| Storage     | MinIO (S3-compatible) for uploads, slides, certificates                             |
| Auth        | JWT access + refresh tokens, automatic refresh + global 401/403 handling            |
| Deploy      | Docker Compose (local) + Caddy/Dokploy (reverse proxy / TLS)                        |

```
/api        -> Express API (Project + module architecture)
/frontend   -> React app (Vite)
/docs       -> Architecture notes
docker-compose.yml -> API + Frontend + Mongo + MinIO (expects external Caddy)
```

---

## Architecture: Project (parent) + InductionModule (child)

**Project** (clean parent)
```
{ _id, name, description, address?, managers[], status: draft|active|archived,
  createdBy?, updatedBy?, createdAt, updatedAt }
```

**InductionModule**
```
{ _id, projectId, type: 'induction', reviewStatus: draft|pending|approved|declined,
  config: {
    steps: string[],
    slides: [{ key, title?, fileKey, thumbKey?, order }],
    quiz: { questions: [{ question, options[], answerIndex }] },
    settings: { passMark, randomizeQuestions, allowRetry }
  },
  createdBy?, updatedBy?, createdAt, updatedAt
}
```
- Draft save (`PUT /modules/:id`) accepts incomplete payloads (e.g., slides empty) so admins/managers can work iteratively.
- Submit for review (`POST /modules/:id/reviews`) enforces validation (>=1 slide, valid quiz, required fields, status is draft/declined).

**InductionModuleField**
```
{ _id, moduleId, key, label, type(text|number|date|select|file|textarea|boolean),
  required, order, step, options? }
```

**ModuleReview**
```
{ _id, moduleId, projectId, type:'induction', data(snapshot),
  status: pending|approved|declined, reason?, requestedBy, reviewedBy?,
  createdAt, updatedAt }
```

**Submission**
```
{ _id, moduleId, projectId, userId, status: pending|approved|declined,
  payload, uploads:[{key,type}], quiz:{ answers, score, passed },
  signatureDataUrl?, certificateKey?, reviewedBy?, reviewReason?,
  createdAt, updatedAt }
```

Assignments remain project-scoped (`role: 'manager' | 'worker'`) and gate every action.

**User**
```
{ email, name, password(hashed), role, disabled?,
  position?, phone?, companyName?, avatarUrl? }
```

---

## Running the Platform Locally

### 1. Prepare env + Docker resources

The compose stack reads everything from the root `.env`, so copy the single template and adjust the values (JWT secrets, SMTP, MinIO credentials, etc.).

```bash
cp .env.example .env
```

`docker-compose.yml` references external volumes and a pre-existing shared network that Caddy (or any other reverse proxy) also joins. Create them once:

```bash
docker network create shared_caddy_net
docker volume create indux_mongo_data
docker volume create indux_minio_data
```

> If you prefer Docker-managed (non-external) volumes/networks, update `docker-compose.yml` accordingly.

### 2. Start the stack

```bash
docker-compose up --build
```

The API and frontend containers only `expose` their internal ports because the expectation is that Caddy (running outside this compose file) terminates TLS and publishes ports 80/443. Make sure your Caddy instance is attached to `shared_caddy_net` and proxies traffic to:

- `api`: `http://indux-api:8080`
- `frontend`: `http://indux-frontend`

For quick local tinkering without Caddy, bind ports directly in `docker-compose.yml` (e.g., add `ports: - "8080:8080"` on the API service and `ports: - "5173:80"` on the frontend).

---

## API Surface (highlights)

- **Projects**: `GET /projects`, `POST /projects`, `PUT /projects/:id`, `DELETE /projects/:id`
- **Induction module**:
  - `POST /projects/:projectId/modules/induction` (create if missing)
  - `GET /projects/:projectId/modules/induction`
  - `PUT /modules/:moduleId` (config/status + optional `fields`)
- **Fields**: `GET /modules/:moduleId/fields`, `POST /modules/:moduleId/fields`, `PUT /module-fields/:id`, `DELETE /module-fields/:id`
- **Reviews**: `POST /modules/:moduleId/reviews`, `GET /modules/:moduleId/reviews`, `POST /modules/:moduleId/reviews/:reviewId/approve|decline`
- **Submissions**: `POST /modules/:moduleId/submissions`, `GET /modules/:moduleId/submissions`, `POST /submissions/:id/approve|decline`
- **Worker submission status**: `GET /modules/:moduleId/submissions/my` (checks latest submission for the authenticated worker to block duplicate attempts)
- **Worker submission history**: `GET /workers/me/submissions` (lists the worker's submissions across assigned projects, incl. certificates and review reasons)
- **Assignments**: `POST /assignments`, `GET /assignments/user/:id`, `GET /assignments/project/:id`, `DELETE /assignments/:id`, `GET /assignments/manager/:id/team`
- **Auth/Uploads/Users/Brand Config**: standard CRUD as defined in `api/src/routes`.

Workers can only submit if the module is approved and they hold a worker assignment.

---

## Frontend Highlights

- Axios client with interceptor-based refresh tokens (`frontend/src/utils/api.js`).
- Admin apps (`/admin/projects`, module editor) manage project metadata separately from module configuration.
- Review Queue consumes module submissions and reviews (manager/admin views).
- Worker induction wizard (`frontend/src/pages/InductionWizard.jsx`) renders module steps dynamically from `config` + `fields`.
- Slides viewer supports PDF/PPT/PPTX through pdf.js/Office embeds.
- Admin Users screen handles extended profile fields (`position`, `phone`, `companyName`, `avatarUrl`).

---

## Data Flow Summary

```
Project
  └─ InductionModule (type='induction')
       ├─ InductionModuleField (personal data schema)
       ├─ ModuleReview (snapshots module config)
       └─ Submission (worker output -> certificate in MinIO)
Assignment (user ↔ project, role manager|worker)
```

- Approved modules accept submissions; drafting/declined modules remain editable by managers/admins.
- Assignments gate both worker submissions and manager access to modules/team management.
- Approved submissions generate certificates in `certs/{project}/{module}/{submission}.pdf`.

---

## Deployment Notes

- `.env` files declare Mongo/MinIO connection strings, JWT secrets, SMTP, and CORS origins.
- Docker Compose services: Mongo, MinIO, API, Frontend. Reverse proxy (Caddy/Dokploy) runs separately, joins `shared_caddy_net`, and strips `/api` before proxying to the backend.
- Certificates are rendered via `api/src/services/pdf.ts` and uploaded to MinIO.
- Liveness check: `GET /health`.

---

## Status

- ✅ Project model is clean (no induction-specific columns).
- ✅ Induction module encapsulates config, fields, slides, quiz, reviews, submissions.
- ✅ Frontend consumes module endpoints (admin editors, review queue, worker wizard, manager console).
- ✅ Legacy project-based induction endpoints removed.

Future modules (risk, tasks, materials, etc.) can follow the same pattern: Project + module collection + module-specific fields/reviews/submissions.

---

## Roles, Assignments, and Permissions

| Role   | Capabilities                                                                                                                                                          |
|--------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Admin  | Full CRUD over projects, modules, fields, assignments, submissions, reviews, users, brand config. Can assign managers to projects.                                    |
| Manager| Edit/view modules for their projects (draft/declined only), manage worker assignments, review submissions, open review queue. Needs manager assignment.               |
| Worker | Completes the induction wizard for projects where they have a worker assignment. Cannot edit modules or view other workers’ data.                                     |

Assignments live in `assignments` collection (`{ user, project, role: 'manager'|'worker', assignedBy }`) and gate all actions:
- Admin ➜ Projects ➜ “Assign User” modal creates manager assignments.
- Manager ➜ Project ➜ “Team” view adds/removes worker assignments.
- API now validates manager access with `Assignment.exists` to avoid stale populate issues.
- Frontend must refer to the authenticated person as `user.id` (legacy `user.sub` no longer exists).

---

## Default Users & Seeding

Set `SEED=true` before starting the API (or run `npm run seed` in `api/`) to generate demo data:

| Email               | Password   | Role    |
|---------------------|------------|---------|
| admin@indux.local   | admin123   | admin   |
| manager@indux.local | manager123 | manager |
| worker@indux.local  | worker123  | worker  |

Seed script (`api/src/seed.ts`) also creates:
- “Demo Project” (status `active`) with an approved induction module, quiz questions, and default fields.
- Manager + worker assignments to that project.
- Module review status set to approved so worker submissions work immediately.

```bash
cd api
SEED=true npm run dev   # start dev server with seeding enabled
# or one-off seed
npm run seed
```

---

## Manager Experience Flow

1. **Dashboard** (`frontend/src/pages/manager/ManagerDashboard.jsx`)  
   - Loads `/assignments/user/${user.id}` to count assigned projects and pending modules.

2. **Projects list** (`ManagerProjects.jsx`)  
   - Lists non-archived projects tied to the manager, with module status chips and shortcuts.

3. **Project detail** (`ManagerProjectDetail.jsx`)  
   - Shows project info, managers, module status, and entrypoints to module/team views.

4. **Module editing** (`ManagerModuleEditor.jsx` → `ModuleEditor` in manager mode)  
   - Edit access only if manager is assigned and module status is `draft` or `declined`. Otherwise read-only.

5. **Team management** (`ManagerTeam.jsx`)  
   - Reads `/assignments/project/:projectId` + `/assignments/manager/${user.id}/team` to add/remove worker assignments.

6. **Review queue** (`frontend/src/pages/ReviewQueue.jsx`)  
   - Filters submissions/reviews by manager assignments to enforce visibility.

---

## Worker Flow (Induction Wizard)

1. Worker opens `/induction/:projectId` and fetches module data + fields.  
2. Wizard immediately checks `/modules/:moduleId/submissions/my` to see if the worker already has a submission (blocks if `approved`/`pending`, allows retry if `declined`).  
3. Completes dynamic steps (personal data, uploads, slides, quiz, signature).  
4. Wizard submits to `/modules/:moduleId/submissions`.  
5. Managers/admins review submission; once approved, certificate PDF is stored in MinIO and shown to worker. Workers can see their history/certificates via `/workers/me/submissions` (rendered in `frontend/src/pages/worker/WorkerHistory.jsx`) and the Worker Dashboard surfaces per-project status + manager info.

Requirements: worker assignment exists and module `reviewStatus === 'approved'`.

---

## Troubleshooting

| Symptom                                                     | Likely Cause / Fix                                                                                  |
|-------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| Manager Dashboard shows 0 projects                          | Frontend build still using `user.sub` or manager lacks assignment. Redeploy latest build and assign. |
| Banner “You are not assigned as manager” within module      | Assignment missing or project archived. Check `db.assignments` for that manager/project pair.        |
| 403 on `/assignments/project/:id` as manager                | Manager not assigned. API checks `Assignment.exists`.                                                |
| Worker cannot start induction                               | Module not approved or worker assignment missing.                                                   |
| Seed users absent                                           | API started without `SEED=true`. Run `npm run seed` or restart with env set.                         |

---

## Useful Commands

```bash
# API
cd api
npm install
npm run dev
npm run build && npm start
npm test

# Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173
npm run build
npm run lint

# Docker (full stack)
docker-compose up --build
```

---
