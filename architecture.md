# INDUX Architecture & Operations

This document captures every technical detail of the INDUX WHS induction platform: repository layout, API surfaces, security controls, workflows, and troubleshooting guidance.

## Repository Layout
```
/api                  Express + TypeScript backend (Node 18)
/frontend             React + Vite frontend (Material UI, Zustand)
/docs                 Additional documentation assets
docker-compose.yml    Orchestrates API, frontend, MongoDB, MinIO
```

## Data Architecture Overview
```
Project
  └─ InductionModule (type='induction')
       ├─ InductionModuleField (personal data schema)
       ├─ ModuleReview (snapshot of module state)
       └─ Submission (worker output → certificates)
Assignment (user ↔ project, role=manager|worker)
```

### Models
- **Project**: `{ _id, name, description, address?, status (draft|active|archived), createdBy?, updatedBy?, createdAt, updatedAt }`
- **InductionModule**: `{ _id, projectId, type='induction', reviewStatus (draft|pending|approved|declined), config { steps, slides[{ key, title?, fileKey, thumbKey?, order }], quiz{ questions[{ question, options[], answerIndex }] }, settings{ passMark, randomizeQuestions, allowRetry } }, createdBy?, updatedBy?, timestamps }`
- **InductionModuleField**: `{ _id, moduleId, key, label, type(text|number|date|select|file|textarea|boolean), required, order, step, options? }`
- **ModuleReview**: `{ _id, moduleId, projectId, type='induction', data(snapshot), status (pending|approved|declined), reason?, requestedBy, reviewedBy?, timestamps }`
- **Submission**: `{ _id, moduleId, projectId, userId, status (pending|approved|declined), payload, uploads[{ key, type }], quiz { answers, score, passed }, signatureDataUrl?, certificateKey?, reviewedBy?, reviewReason?, timestamps }`
- **Assignment**: `{ user, project, role ('manager'|'worker'), assignedBy?, createdAt, updatedAt }` (unique per user+project).
- **User**: `{ email, name, password (hashed), role (admin|manager|worker), disabled?, position?, phone?, companyName?, avatarUrl? }`

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
- JWT-based `/login` + refresh logic (enforced in `setupAxiosNotifications`).
- `GET /health` liveness probe.

## Role & Permission Matrix
| Role   | Capabilities |
|--------|--------------|
| Admin  | Full CRUD across projects, modules, fields, assignments, submissions, reviews, users, branding. Can assign managers and approve/decline any module or submission. |
| Manager| Limited to assigned projects. Can edit modules while status is draft/declined/pending, submit modules for review, approve/decline worker submissions, and manage worker assignments. |
| Worker | Completes inductions for assigned projects, views submission status, downloads certificates, resubmits when declined. |

Assignments (`user`, `project`, `role`) enforce scope. Admins bypass checks; managers/workers must have an assignment to interact with a project.

## Detailed Workflows

### Admin Flow
1. **Project Creation** – via `/projects` or Admin UI.
2. **Module Seeding** – `POST /projects/:projectId/modules/induction` creates default config + personal data fields.
3. **Configuration** – Module Editor (admin mode) manages fields, slides, quiz, and settings while module is draft.
4. **Manager Assignment** – Admin Projects modal uses `/assignments` to attach managers.
5. **Monitoring** – Review Queue displays pending module reviews and worker submissions; admins can approve/decline or override.
6. **Branding & Users** – Admin Settings and Users pages configure organisation details and accounts.

### Manager Workflow
1. **Dashboard** – shows assigned projects, pending submissions, and modules awaiting review.
2. **Project Register** – ManagerProjects lists each project with module status, description, and quick actions.
3. **Project Detail** – ManagerProjectDetail displays summary, assigned managers, and module state with buttons to edit module or manage workers.
4. **Module Editing** – ManagerModuleEditor wraps the admin editor; editing allowed when module status is draft/declined/pending and manager has assignment.
5. **Review Queue** – Pending Approvals tab lists worker submissions and module reviews limited to projects they own.
6. **Team Management** – ManagerTeam fetches `/assignments/project/:projectId` to display current workers and `/assignments/manager/:id/team` for available workers, ensuring only assigned managers can adjust staffing.

### Worker Pipeline
1. **Worker Dashboard** – uses `/assignments/user/:id` to list assigned projects plus submission status and manager contacts.
2. **Induction Wizard** – steps driven by module config and fields. Wizard checks `/modules/:moduleId/submissions/my` to guard against duplicate pending/approved submissions.
3. **Uploads** – Files go through `POST /uploads/presign`, then wizard stores `key` references in module fields.
4. **Quiz & Signature** – Client collects answers and signature data URL.
5. **Submission** – `POST /modules/:moduleId/submissions` creates/updates pending submissions. Approved/declined logic handled by managers/admins.
6. **History & Certificates** – `GET /workers/me/submissions` surfaces all submissions; certificates open via secure presigned downloads.

## Module Lifecycle
1. **Draft** – Fully editable by admins/managers. Workers cannot submit.
2. **Pending** – Module submitted for review. Managers retain edit access to fix issues until decision.
3. **Approved** – Locked for managers; workers may submit if they hold a worker assignment. Only admins can edit (if needed) via direct updates.
4. **Declined** – Module returns to editable state; managers request review again once adjustments are complete.

### Submission Lifecycle & Certificates
- **Pending** – Worker submission stored; any new submission overwrites the pending record rather than deleting first, preventing data loss.
- **Approved** – Certificate generated (`certs/{projectId}/{moduleId}/{submissionId}.pdf`) and stored in MinIO. Worker sees “Induction approved” status.
- **Declined** – Submission flagged with reason; worker can resubmit via wizard.

## Assignments & Access Control
- Stored in `assignments` collection with unique `(user, project)` pairs.
- Manager actions check `{ user: req.user.id, project: targetProjectId, role: 'manager' }` before allowing module edits, review approvals, team management, or downloads.
- Worker actions check `{ user: req.user.id, project: targetProjectId, role: 'worker' }` before allowing module fetching or submissions.
- Admins bypass checks.

## Upload System & MinIO
- **Presign PUT** (`POST /uploads/presign`): Generates `uploads/<uuid>` or other prefixes (e.g., `worker-uploads/`) with S3-compatible credentials.
- **Presign GET** (`POST /uploads/presign-get`): Validates ownership by checking whether the key belongs to a module slide, thumbnail, map, worker upload, or certificate tied to the requestor’s project assignments.
- **Streaming** (`GET /uploads/stream`): Streams objects through the API for preview; also applies assignment-based ownership checks.
- **Storage Layout**:
  - Slides: `slides/<uuid>`
  - Thumbnails: `thumbs/<uuid>`
  - Maps: `maps/<uuid>`
  - Worker uploads: `worker-uploads/<uuid>`
  - Certificates: `certs/{projectId}/{moduleId}/{submissionId}.pdf`

## Certificate Generation
- Triggered in `POST /submissions/:id/approve`:
  1. Load worker submission, project, and module.
  2. Generate PDF via `services/pdf.ts` with worker name, project, and module details.
  3. Store in MinIO at `certs/...` and save `certificateKey` on submission.
  4. Worker downloads via history or wizard once the record is approved.

## Security Model (Detailed)
1. **Assignment Enforcement** – All manager/worker routes require matching assignments. Examples: module GET/PUT, review approvals, submission approvals/declines, team management, and uploads.
2. **Role Checks** – `requireRole` middleware ensures only admins/managers/workers hit relevant endpoints.
3. **File Ownership** – `presign-get` and `stream` map requested keys to modules or submissions, ensuring the user has either manager assignment to the project or owns the submission.
4. **Module Access** – `GET /projects/:projectId/modules/induction` returns data only if the caller is admin or assigned manager/worker on that project.
5. **Submission Safety** – Duplicate pending submissions are updated instead of deleting, avoiding race conditions. Workers cannot submit when module is not approved or when they lack assignments.
6. **Auditing** – ModuleReview captures snapshots; submissions store review reasons and reviewer IDs for traceability.

## Docker Architecture & Environment Setup
1. **Environment** – `.env` at the repo root drives both API and frontend. Key variables: Mongo URI, MinIO endpoint/access/secret keys, JWT secrets, SMTP, base URLs.
2. **Compose Setup**:
   - `indux-api`: Node 18 + TS build, listens on 8080.
   - `indux-frontend`: nginx serving the Vite build.
   - `mongo`: persistent database (volume `indux_mongo_data`).
   - `minio`: object storage (volume `indux_minio_data`). Access via console at `:9001` if ports are exposed.
3. **Networking** – Compose references `shared_caddy_net` so Caddy/Dokploy can proxy API (`http://indux-api:8080`) and frontend (`http://indux-frontend`).
4. **Local Development** – `docker compose up --build`. For manual runs, `npm run dev` in `/api` and `/frontend` provide hot reload.
5. **Seeding** – `SEED=true npm run dev` or `npm run seed` populates admins, managers, workers, a demo project, approved module, and assignments.

## Troubleshooting
| Symptom | Resolution |
|---------|------------|
| Manager Dashboard shows zero projects | Ensure manager assignment exists and project isn’t archived. Confirm frontend uses `user.id` (not `user.sub`). |
| “You are not assigned as manager” warning in module editor | Manager missing assignment or project archived; check `assignments` collection. |
| 403 on `/assignments/project/:id` for manager | Manager lacks assignment to that project; assign via admin UI. |
| Worker blocked from wizard | Module reviewStatus not `approved` or worker lacks assignment. |
| Certificates fail to download | Ensure submission status is `approved`, assignment exists, and `certificateKey` references a stored object. |
| Seed users absent | API launched without `SEED=true`; run `npm run seed`. |
| Upload download returns 403 | File key not tied to caller’s project/submission; confirm assignment and key mapping. |

## Seed Users & Demo Project
- When seeding, default users are created: `admin@indux.local`, `manager@indux.local`, `worker@indux.local` with obvious passwords (`admin123`, `manager123`, `worker123`).
- Demo project seeded with `status: active`, approved induction module, quiz questions, slides, and default fields.
- Manager/worker assignments point to the demo project so end-to-end flows (wizard, submission, approval, certificate) function immediately.

## Additional Notes
- Axios client handles JWT refresh and global error messaging; see `frontend/src/setupAxiosNotifications.js`.
- Slides viewer supports PDF (pdf.js), PPT/PPTX (Office embed), and includes download/open controls.
- Review Queue is shared between admin and manager roles; content is filtered server-side by assignments to prevent leakage.
- Worker Dashboard now maps each project to its managers (names, emails, phones, positions) for easy contact.
- Manager dashboard quick actions redirect to `/manager/projects` to enforce project selection before managing teams.

This document should be kept current alongside code changes to maintain a single source of truth for INDUX’s technical architecture.
