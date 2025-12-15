# INDUX Architecture & Operations

This document is the single source of truth for repository layout, data models, API endpoints, workflows, and operational considerations.

## Repository Layout
```
/api                  Express + TypeScript backend (Node 18)
/frontend             React + Vite frontend (Material UI, Zustand)
/docs                 Additional documentation
architecture.md       (this file)
docker-compose.yml    Orchestrates API, frontend, MongoDB, MinIO
```

## Data Architecture
```
Project
  └─ InductionModule (type='induction')
       ├─ InductionModuleField (personal data schema)
       ├─ ModuleReview (snapshot of module state)
       └─ Submission (worker output → certificates)
Assignment (user ↔ project, role = manager | worker)
```

### Models
- **Project** – `{ _id, name, description, address?, status (draft|active|archived), createdBy?, updatedBy?, createdAt, updatedAt }`
- **InductionModule** – `{ _id, projectId, type='induction', reviewStatus (draft|pending|approved|declined), config { steps, slides[{ key, title?, fileKey, thumbKey?, order }], quiz{ questions[{ question, options[], answerIndex }] }, settings{ passMark, randomizeQuestions, allowRetry } }, createdBy?, updatedBy?, timestamps }`
- **InductionModuleField** – `{ _id, moduleId, key, label, type(text|number|date|select|file|photo|textarea|boolean), required, order, step, options?, visibleIf? }`
- **ModuleReview** – `{ _id, moduleId, projectId, type='induction', data snapshot, status (pending|approved|declined), reason?, requestedBy, reviewedBy?, timestamps }`
- **Submission** – `{ _id, moduleId, projectId, userId, status (pending|approved|declined), payload, uploads[{ key, type }], quiz { answers, score, passed }, signatureDataUrl?, certificateKey?, reviewedBy?, reviewReason?, timestamps }`
- **Assignment** – `{ user, project, role ('manager'|'worker'), assignedBy?, createdAt, updatedAt }` (unique per user + project).
- **User** – `{ email, name, password (hashed), role (admin|manager|worker), disabled?, position?, phone?, companyName?, avatarUrl? }`

### Default Induction Fields
When a module is first created it is seeded with:
1. Full Name
2. Email
3. Phone
4. Position
5. Company Name
6. Medical Condition (select Yes/No)
7. Medical Condition Details (textarea, `visibleIf: { fieldKey: 'medicalCondition', equals: 'Yes' }`)

These defaults are only a starting point—admins/managers can edit labels, steps, type, order, required flags, and conditional logic as needed.

### Conditional Fields (`visibleIf`)
Fields can include:
```
visibleIf: {
  fieldKey: string
  equals: string
}
```
The worker wizard hides conditional fields until the criteria is satisfied and hidden inputs never block submission. Any field type may use `visibleIf`.

## REST Endpoints (Grouped)

### Projects & Modules
- `GET /projects`
- `POST /projects`
- `PUT /projects/:id`
- `DELETE /projects/:id`
- `POST /projects/:projectId/modules/induction`
- `GET /projects/:projectId/modules/induction`
- `PUT /modules/:moduleId`
- `GET /modules/:moduleId/fields`
- `POST /modules/:moduleId/fields`
- `PUT /module-fields/:id`
- `DELETE /module-fields/:id`

### Module Reviews
- `POST /modules/:moduleId/reviews`
- `GET /modules/:moduleId/reviews`
- `POST /modules/:moduleId/reviews/:reviewId/approve`
- `POST /modules/:moduleId/reviews/:reviewId/decline`

### Submissions
- `POST /modules/:moduleId/submissions`
- `GET /modules/:moduleId/submissions`
- `GET /modules/:moduleId/submissions/my`
- `GET /workers/me/submissions`
- `POST /submissions/:id/approve`
- `POST /submissions/:id/decline`

### Assignments
- `POST /assignments`
- `GET /assignments/user/:userId`
- `GET /assignments/project/:projectId`
- `GET /assignments/manager/:managerId/team`
- `DELETE /assignments/:id`

### Uploads & Files
- `POST /uploads/presign`
- `POST /uploads/presign-get`
- `GET /uploads/stream`

### Users & Branding
- `GET /users`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`
- `GET /brand-config`
- `POST /brand-config`
- `PUT /brand-config/:id`

### Miscellaneous
- JWT-based `/login` and refresh handling (configured in `frontend/src/setupAxiosNotifications.js`).
- `GET /health` liveness check.

## Role & Permission Matrix
| Role   | Capabilities |
|--------|--------------|
| Admin  | Full CRUD over projects, modules, assignments, submissions, reviews, users, and branding. Can approve or decline any review/submission and assign managers. |
| Manager| Limited to assigned projects. Can edit modules in draft/declined/pending, send modules for review, approve/decline worker submissions, manage workers, and view pending approvals. |
| Worker | Completes inductions for assigned projects, views submission status, downloads certificates, and resubmits when declined. |

Assignments (`user`, `project`, `role`) enforce the scope. Admins bypass these checks; managers/workers must have an assignment to interact with a project.

## Detailed Workflows

### Admin Flow
1. **Create Project** – Admin UI or `POST /projects`.
2. **Seed Module** – `POST /projects/:projectId/modules/induction` plus personal data fields.
3. **Configure Content** – Module Editor (admin mode) updates fields, slides, quiz, and settings while module is draft.
4. **Assign Managers & Workers** – Admin Projects provides dedicated tabs for both roles; `POST /assignments` seeds manager/worker links so managers can see their pool and workers can access the wizard.
5. **Monitor Reviews** – Review Queue lists module reviews and worker submissions; admins can approve/decline or override.
6. **Branding & Users** – Admin Settings and Users screens manage organisational metadata and accounts.

### Manager Workflow
1. **Dashboard** – Shows assigned projects, pending submissions, and modules awaiting review.
2. **Project Register** – `ManagerProjects` lists each project with module status, quick actions, and descriptions.
3. **Project Detail** – `ManagerProjectDetail` displays summary, assigned managers, and module state with buttons to edit the module or manage workers.
4. **Module Editing** – `ManagerModuleEditor` wraps the admin editor; editing allowed if assignment exists and module status is draft/declined/pending.
5. **Pending Approvals** – Review Queue (Submission Reviews + Module Review Requests) filtered by assignments. Managers can approve/decline worker submissions for projects they manage, but module approvals remain admin-only.
6. **Team Management** – `ManagerTeam` uses `/assignments/project/:projectId` and `/assignments/manager/:id/team` to manage worker rosters.

### Worker Pipeline
1. **Worker Dashboard** – Uses `/assignments/user/:id` to show assigned projects, manager contacts, and submission status.
2. **Induction Wizard** – Steps driven by module config/fields. Wizard checks `/modules/:moduleId/submissions/my` to prevent duplicate pending/approved submissions.
3. **Uploads** – `file` and `photo` inputs pass through `POST /uploads/presign`; photos open the camera (mobile) or webcam/file picker (desktop), preview immediately, and store the resulting keys in submission payloads.
4. **Slides Viewer** – Workers now pass the slide’s name and extension to `/slides-viewer` so PDFs render via pdf.js (matching admin/manager behaviour).
5. **Submission** – `POST /modules/:moduleId/submissions` stores or updates pending submissions safely.
6. **Review Decision** – Managers/admins approve or decline; approved submissions trigger certificate generation.
7. **History** – `GET /workers/me/submissions` lists past submissions with certificate download links protected by assignment checks.

## Module Lifecycle
1. **Draft** – Fully editable; workers cannot submit.
2. **Pending** – Submitted for review; managers retain edit access until decision.
3. **Approved** – Locked for managers; workers can submit if assigned.
4. **Declined** – Re-opened for edits; managers re-submit for review when ready.

Managers retain edit access for states `draft`, `pending`, and `declined`; only `approved` modules are read-only outside of admin overrides. When a project has no induction module yet, the admin/manager editor now presents a dedicated empty state and CTA instead of surfacing a raw 404/toast.

### Submission Lifecycle & Certificates
- **Pending** – Worker submission stored; new pending submissions overwrite the existing record to avoid data loss.
- **Approved** – Certificate generated (`certs/{projectId}/{moduleId}/{submissionId}.pdf`) and stored in MinIO. Worker sees “Induction approved” and can download immediately.
- **Declined** – Submission carries a decline reason; worker resubmits via the wizard.

Managers assigned to the project can approve or decline submissions directly (admins continue to have override access). Module approvals, however, remain restricted to admins.

## Assignments & Access Control
- Stored in `assignments` with a unique `(user, project)` constraint.
- Manager endpoints verify `{ user: req.user.id, project: projectId, role: 'manager' }` before allowing module edits, approvals, team management, or downloads.
- Worker endpoints verify `{ user: req.user.id, project: projectId, role: 'worker' }` before exposing module data or allowing submissions.
- Admins bypass assignment checks but still require authentication.
- Admin Projects now exposes **Assigned managers** and **Assigned workers** tabs so admins can seed both roles directly; managers can only invite workers that already exist in their pool (`GET /assignments/manager/:id/team`).

## Upload System & MinIO
- **Presigned PUT** (`POST /uploads/presign`) – Generates unique keys under prefixes like `slides/` or `worker-uploads/`.
- **Presigned GET** (`POST /uploads/presign-get`) – Validates that the requester owns the file via module or submission context before issuing a download URL.
- **Streaming** (`GET /uploads/stream`) – Streams objects via the API after the same ownership checks, helping browsers preview files without exposing public URLs.
- **Storage Layout** – Slides, thumbnails, maps, worker uploads, and certificates each have dedicated prefixes; certificates follow `certs/{project}/{module}/{submission}.pdf`.

### Photo Capture & Retrieval
- `photo` fields set `accept="image/*"` and `capture="environment"` so phones open the rear camera while desktop users get the webcam/file picker.
- The wizard uploads photos via the same presigned PUT pipeline, shows a thumbnail preview, and records `{ key, type: 'photo' }` in submissions.
- Reviewers/workers request presigned GET URLs or use `/uploads/stream` to view the stored image without exposing public buckets.

## Certificate Generation
1. During `POST /submissions/:id/approve`, the API fetches submission + project + module.
2. Generates a PDF via `services/pdf.ts` with worker name, project name, and module type.
3. Stores it in MinIO and saves `certificateKey` on the submission.
4. Workers access certificates through history or the wizard once approval is complete.

## Security Model
1. **Assignment Enforcement** – All manager/worker routes check assignments (`Assignment.findOne`). Examples: module GET/PUT, reviews, submissions, team management, uploads.
2. **Role Checks** – `requireRole` middleware ensures only authorised roles hit protected routes.
3. **File Ownership** – Downloads/streaming map keys to modules or submissions and ensure the user either owns the submission or manages the project.
4. **Module Access** – `GET /projects/:projectId/modules/induction` returns data only if the caller is admin or assigned manager/worker of that project.
5. **Submission Safety** – Workers can submit only when modules are approved and they have assignments; pending submissions are updated instead of deleted to avoid race conditions.
6. **Auditing** – ModuleReview stores snapshots; submissions capture reviewer IDs and reasons.

## Docker & Environment Setup
1. **Environment Variables** – `.env` defines Mongo URI, MinIO endpoint/access keys, JWT secrets, SMTP, and allowed origins (used by both API and frontend).
2. **Compose Services** – `indux-api`, `indux-frontend`, `mongo`, and `minio`. Reverse proxy (Caddy/Dokploy) runs separately and attaches to the shared network.
3. **Volumes/Networks** – External volumes (`indux_mongo_data`, `indux_minio_data`) and `shared_caddy_net` mimic production; adjust as needed for local-only environments.
4. **Local Run** – `docker compose up --build` starts the full stack. Dev mode can use `npm run dev` in `/api` and `/frontend` for hot reload.
5. **Seeding** – `SEED=true npm run dev` or `npm run seed` populates demo users (admin/manager/worker), the demo project, approved module, quiz, fields, and assignments.

## Troubleshooting
| Symptom | Resolution |
|---------|------------|
| Manager dashboard shows zero projects | Manager lacks assignment or project is archived; verify `assignments` collection and ensure frontend uses `user.id`. |
| “You are not assigned as manager” banner | Assignment missing or project archived; add assignment in Admin Projects. |
| 403 on `/assignments/project/:id` | Manager not assigned to that project. |
| Worker cannot start induction | Module `reviewStatus` not `approved` or worker assignment missing. |
| Certificates will not download | Submission not approved or caller lacks assignment; confirm `certificateKey` exists. |
| Seed users absent | API started without `SEED=true`; rerun `npm run seed`. |
| Slides viewer fails for workers | Ensure slide upload includes a file extension; wizard now passes `name`/`ext` to `/slides-viewer` so PDFs render correctly. |

## Seed Users & Demo Project
- `admin@indux.local` / `admin123` (admin)
- `manager@indux.local` / `manager123` (manager)
- `worker@indux.local` / `worker123` (worker)

Seeding also creates “Demo Project” (status `active`) with an approved module, quiz questions, default fields, and assignments so the full induction pipeline works immediately.

## Additional Notes
- Axios interceptors refresh JWTs and handle 401/403 responses globally.
- Slides viewer supports PDF via pdf.js and PPT/PPTX via Office Online embeds; worker view now mirrors admin/manager behaviour.
- Review Queue is shared across admin/manager routes, with server-side filtering based on assignments.
- Worker Dashboard surfaces manager contact details to streamline communication.
- Manager dashboard quick actions route to `/manager/projects` so managers choose a project before managing teams or approvals.

Keep this file updated alongside feature changes to maintain an accurate technical reference.
