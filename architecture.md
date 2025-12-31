# INDUX Architecture & Operations

This document is the single source of truth for repository layout, data models, API endpoints, workflows, and operational considerations.

## Repository Layout
```

Project geography is managed via Leaflet + OpenStreetMap. The Admin Project Info panel supports entering a human-readable `locationLabel`, click-to-set coordinates (which remain null until explicitly saved), drag-to-move Points of Interest, pick custom marker colours from a palette, adjust a default zoom level, and a CTA to open the full-screen map editor (`/admin/projects/:projectId/location`) for precise adjustments. Location, zoom, and coloured POI data surface across dashboards (manager/worker) so crews see both textual descriptors and coordinates, and the Setup tab shows a warning whenever the draft map position diverges from the last persisted snapshot.
/api                  Express + TypeScript backend (Node 18)
/frontend             React + Vite frontend (Material UI, Zustand)
/docs                 Additional documentation
architecture.md       (this file)
docker-compose.yml    Orchestrates API, frontend, MongoDB, MinIO
```

## Data Architecture
Projects store location metadata (optional location label, Leaflet coordinates captured only after the map is saved, default zoom, and colour-coded POIs) and host both induction modules and project inspections. Assignments link users to projects with optional per-module restrictions, while templates provide reusable blueprints for both inductions and inspections.

### Models
- **Project** - `{ _id, name, description, address?, locationLabel?, status (draft|active|archived), location?: { lat, lng } | null, mapZoom (1-22), pointsOfInterest: [{ label, lat, lng, color }], createdBy?, updatedBy?, createdAt, updatedAt }`.
- **InductionModule** - `{ _id, projectId, type: 'induction', name?, description?, reviewStatus (draft|pending|approved|declined), config { steps, slides[{ key, title?, fileKey, thumbKey?, order }], quiz{ questions[{ question, options[], answerIndex }] }, settings{ passMark, randomizeQuestions, allowRetry } }, createdBy?, updatedBy?, timestamps }`.
- **InductionModuleField** - `{ _id, moduleId, key, label, type(text|number|date|select|file|photo|textarea|boolean), required, order, step, options?, visibleIf? }`.
- **ModuleReview** - `{ _id, moduleId, projectId, type: 'induction', data snapshot, status (pending|approved|declined), reason?, requestedBy, reviewedBy?, timestamps }`.
- **Submission** - `{ _id, moduleId, projectId, userId, status (pending|approved|declined), payload, uploads[{ key, type }], quiz { answers, score, passed }, signatureDataUrl?, certificateKey?, reviewedBy?, reviewReason?, timestamps }`.
- **Assignment** - `{ user, project, role ('manager'|'worker'), assignedBy?, modules?: ObjectId[], createdAt, updatedAt }` (unique per user + project).
- **InductionTemplate** - `{ _id, name, description?, type: 'induction', config (same shape as modules), fields[ ModuleField-like schema ], createdBy?, updatedBy?, timestamps }`. Templates never hold reviews or submissions; they are cloned into projects or edited directly in admin mode.
- **InspectionTemplate** - `{ _id, name, description?, requireSignature (default false), requirePOI (default false), categories[{ key, label, order }], items[{ key, categoryKey, label, photoRequired?, photoRequiredOnFail?, notesRequired?, notesRequiredOnFail?, enableRiskLevel?, correctiveActionRequiredOnFail? }], createdBy, updatedBy, timestamps }`.
- **ProjectInspection** - `{ _id, projectId, templateId, type ('daily'|'weekly'|'adhoc'), active (default true), createdBy, updatedBy, timestamps }`.
- **InspectionExecution** - `{ _id, projectInspectionId, projectId, templateId?, templateSnapshot (frozen JSON), executedBy, executedByRole ('manager'|'worker'), executedAt (default now), status ('draft'|'submitted'), poiRef?, signatureDataUrl?, itemResults[], submittedAt?, timestamps }`.
- **User** - `{ email, name, password (hashed), role (admin|manager|worker), disabled?, position?, phone?, companyName?, avatarUrl? }`.

### Induction Field Defaults
When a module is first created it is seeded with:
1. Full Name
2. Email
3. Phone
4. Position
5. Company Name
6. Medical Condition (select Yes/No)
7. Medical Condition Details (textarea, `visibleIf: { fieldKey: 'medicalCondition', equals: 'Yes' }`)

Admins/managers can edit labels, steps, type, order, required flags, and conditional logic at any time.

### Induction Templates
- **Purpose** - reusable admin-only blueprints for common inductions (e.g., Electrician, Forklift). Templates store module config and personal data fields but never hold reviews or submissions.
- **Endpoints** - `/induction-templates` (CRUD) for admins and `/induction-templates/summaries` for admins/managers when opening the creation dialog.
- **Cloning Flow** - during module creation the user chooses Blank or Template. Selecting a template deep-copies config + fields and creates a draft module under the project.
- **Template Editor** - reuses the Module Editor UI in `mode="template"`; actions save directly via the template endpoints.

### Inspection Templates
- **Purpose** - reusable inspection blueprints that define categories, items, and validation toggles (photo, notes, corrective action, risk level, POI and signature requirements).
- **Activation** - admins/managers activate templates per project via `/projects/:projectId/inspections`, selecting cadence (daily/weekly/adhoc). Each activation creates a `ProjectInspection` record.
- **Execution Snapshotting** - when an execution is created via `/project-inspections/:projectInspectionId/executions`, the current template is embedded under `templateSnapshot` to keep historical data immutable even if the template later changes.

### Inspection Workflow (v1)
- **Admin** - curates templates, activa/desactiva plantillas por proyecto y define la cadencia. No revisa ni aprueba ejecuciones en esta fase.
- **Manager / Worker** - lanzan inspecciones desde sus dashboards (Run/Open inspection). Cada acción crea o reanuda un `InspectionExecution` y abre el `InspectionWizard`.
- **Completion** - el wizard se compone de Contexto, Checklist, Resumen, Firma y Submit. Al enviar, el execution cambia a `submitted`, queda read-only y se registra en el historial del proyecto como evidencia WHS.
- **Sin revisión** - v1 no incluye flujo de aprobación. El submit es el final del proceso; managers y workers consultan las inspecciones completadas desde sus dashboards o el historial del proyecto.
- **Inspection Records** - Admins usan `GET /inspection-records` con filtros por proyecto, usuario, plantilla y rango de fechas; managers consultan `GET /projects/:projectId/inspection-records` desde Project → Inspections → History; y los workers reciben `GET /my/inspection-records` en su dashboard. Todas las vistas abren el `InspectionWizard` en modo `readOnly` para mostrar snapshot del template, checklist, fotos (presign), notas, firma, POI y metadatos auditables.

### Conditional Fields (`visibleIf`)
`InductionModuleField` supports:
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
- `GET /modules/:moduleId`
- `PUT /modules/:moduleId`
- `GET /modules/:moduleId/fields`
- `POST /modules/:moduleId/fields`
- `PUT /module-fields/:id`
- `DELETE /module-fields/:id`
- `DELETE /modules/:moduleId`

### Induction Module Reviews
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

### Inspection Templates
- `GET /inspection-templates`
- `POST /inspection-templates`
- `GET /inspection-templates/:id`
- `PUT /inspection-templates/:id`
- `DELETE /inspection-templates/:id`

### Project Inspections
- `GET /projects/:projectId/inspections`
- `POST /projects/:projectId/inspections`

### Inspection Executions
- `POST /project-inspections/:projectInspectionId/executions`
- `GET /inspection-executions/:id`
- `POST /inspection-executions/:id/submit`

### Inspection Records
- `GET /inspection-records`
- `GET /projects/:projectId/inspection-records`
- `GET /my/inspection-records`
- `GET /inspection-records/:id`

### Assignments
- `POST /assignments`
- `GET /assignments/user/:userId`
- `GET /assignments/project/:projectId`
- `GET /assignments/manager/:managerId/team`
- `PUT /assignments/:id/modules`
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
| Admin  | Full CRUD over projects, modules, assignments, submissions, reviews, users, and branding. Can approve or decline any review/submission (including the Worker Submissions console) and assign managers. |
| Manager| Limited to assigned projects. Can edit modules in draft/declined/pending, send modules for review, approve/decline worker submissions, manage workers, and view pending approvals. |
| Worker | Completes inductions for assigned projects, views submission status, downloads certificates, and resubmits when declined. |

Assignments (`user`, `project`, `role`) enforce the scope. Admins bypass these checks; managers/workers must have an assignment to interact with a project.

## Detailed Workflows

### Admin Flow
1. **Create Project** - Admin UI or `POST /projects`.
   - Project edits allow admins/managers to set the default map zoom, recolour POIs from the palette, capture a location label, and open the full-screen map editor; values flow through manager/worker dashboards and the worker map experiences. The Project Summary card reads from the last persisted version so unsaved edits never appear until stored, and the Setup tab warns when the draft map differs from that snapshot to remind users that **Save project** is required.
2. **Seed Induction Modules** - `POST /projects/:projectId/modules/induction` using the creation dialog (blank or clone from template). Cloned modules automatically copy config + fields.
3. **Configure Content** - Module Editor (admin mode) updates fields, slides, quiz, and settings while the module is draft. Admin Projects also allows deleting unused modules; removal cascades through reviews and submissions automatically.
4. **Assign Managers & Workers** - Admin Projects provides dedicated tabs for both roles; `POST /assignments` seeds manager/worker links so managers can see their pool and workers can access the wizard. Admins can also open the per-worker module dialog here to restrict which modules each worker must complete.
5. **Manage Inspections** - Admins curate the inspection template library via **Admin -> Inspection Templates** and activate them per project with `/projects/:projectId/inspections`, selecting cadence (daily/weekly/adhoc). Activated templates create `ProjectInspection` records that surface in project dashboards.
6. **Monitor Reviews & Submissions** - Review Queue lists induction module reviews and worker submissions; admins can approve/decline or override. The admin navigation also exposes a dedicated **Worker Submissions** page (Inductions, Exams, Inspections tabs), **Inspection Module Reviews** placeholder for future inspection approvals, and the new **Inspection Records** surface (`GET /inspection-records`) for filtered, read-only access to every submitted inspection.
7. **Branding & Users** - Admin Settings and Users screens manage organisational metadata and accounts.
### Manager Workflow
1. **Dashboard** - Shows assigned projects, pending submissions, and modules awaiting review.
2. **Project Register** - `ManagerProjects` lists each project with module status, quick actions, and descriptions.
3. **Project Detail** - `ManagerProjectDetail` displays summary, assigned managers, a module selector, and actions to edit modules, request new ones (blank/template), manage workers, or open the Project Inspections tab.
4. **Module & Template Editing** - `ManagerModuleEditor` wraps the admin editor; editing is allowed if an assignment exists and the module status is draft/declined/pending.
5. **Project Inspections** - Assigned managers can enable new inspections via the Project Inspections dialog, choosing a template and cadence (daily/weekly/adhoc). Workers inherit these activations when launching the Inspection Wizard, and the same screen now includes a **History** table backed by `GET /projects/:projectId/inspection-records` for read-only review of submitted inspections.
6. **Pending Approvals** - Review Queue (Submission Reviews + Induction Module Review Requests) filtered by assignments, plus the Worker Submissions surface for projects they manage. Managers can approve/decline worker submissions, but induction module approvals remain admin-only.
7. **Team Management** - `ManagerTeam` uses `/assignments/project/:projectId` and `/assignments/manager/:id/team` to manage worker rosters and opens the per-worker module dialog (`PUT /assignments/:id/modules`) so managers can decide which modules each worker must complete.
### Worker Pipeline
1. **Worker Dashboard** - Uses `/assignments/user/:id` to show assigned projects, manager contacts, and submission status. Module lists are filtered by the worker assignment so restricted modules stay hidden.
2. **Induction Wizard** - Steps driven by module config/fields. Wizard checks `/modules/:moduleId/submissions/my` to prevent duplicate pending/approved submissions.
3. **Inspection Wizard** - Mirrors the Induction Wizard UX with a visible stepper for Context, Checklist, Summary, Signature, and Submit. Workers pick POIs when required, complete checklist items with pass/fail/NA, capture photos/notes/corrective actions, and provide signatures when demanded.
4. **Uploads** - `file` and `photo` inputs pass through `POST /uploads/presign`; photos open the camera (mobile) or webcam/file picker (desktop), preview immediately, and store the resulting keys in submission payloads.
5. **Slides Viewer** - Workers pass the slide name and extension to `/slides-viewer` so PDFs render via pdf.js (matching admin/manager behaviour).
6. **Submission** - `POST /modules/:moduleId/submissions` stores or updates pending submissions safely, while inspections use `POST /inspection-executions/:id/submit` after checklist validation.
7. **Review Decision** - Managers/admins approve or decline; approved submissions trigger certificate generation. Inspection submissions become immutable after submit until downstream reviews are built.
8. **History** - `GET /workers/me/submissions` lists past submissions with certificate download links protected by assignment checks.
9. **Inspection Records** - `GET /my/inspection-records` powers the worker dashboard "Completed inspections" table. Each record links into the read-only Inspection Wizard with the template snapshot, checklist responses, photos, notes, signature, POI, and metadata intact.
## Module Lifecycle
1. **Draft** – Fully editable; workers cannot submit.
2. **Pending** – Submitted for review; managers retain edit access until decision.
3. **Approved** – Locked for managers; workers can submit if assigned.
4. **Declined** – Re-opened for edits; managers re-submit for review when ready.

Managers retain edit access for states `draft`, `pending`, and `declined`; only `approved` modules are read-only outside of admin overrides. When a project has no induction module yet, the admin/manager editor now presents a dedicated empty state and CTA instead of surfacing a raw 404/toast.

### Submission Lifecycle & Certificates
- **Pending** – Worker submission stored; new pending submissions overwrite the existing record to avoid data loss.
- **Approved** – Certificate generated (`certs/{projectId}/{moduleId}/{submissionId}.pdf`) and stored in MinIO. Worker sees “Induction approved” and can download immediately. Certificates are rendered in PDFKit with a decorative border, headline, worker/project/module metadata, issue date, and a signature block for on-site validation.
- **Declined** – Submission carries a decline reason; worker resubmits via the wizard.

Managers assigned to the project can approve or decline submissions directly (admins continue to have override access). Module approvals, however, remain restricted to admins.

## Assignments & Access Control
- Stored in `assignments` with a unique `(user, project)` constraint.
- Manager endpoints verify `{ user: req.user.id, project: projectId, role: 'manager' }` before allowing module edits, approvals, team management, or downloads.
- Worker endpoints verify `{ user: req.user.id, project: projectId, role: 'worker' }` before exposing module data or allowing submissions.
- Optional `modules` array on worker assignments limits which induction modules that worker can see or submit to. Leaving it empty grants access to every module in the project; specifying IDs filters `GET /projects/:id/modules/induction`, `GET /modules/:id`, and worker submission endpoints.
- Admins bypass assignment checks but still require authentication.
- Admin Projects now exposes **Assigned managers** and **Assigned workers** tabs so admins can seed both roles directly; managers can only invite workers that already exist in their pool (`GET /assignments/manager/:id/team`).

## Upload System & MinIO
- **Presigned PUT** (`POST /uploads/presign`) – Generates unique keys under prefixes like `slides/` or `worker-uploads/`.
- **Presigned GET** (`POST /uploads/presign-get`) – Validates that the requester owns the file via module or submission context before issuing a download URL.
- **Streaming** (`GET /uploads/stream`) – Streams objects via the API after the same ownership checks, helping browsers preview files without exposing public URLs.
- **Storage Layout** – Slides, thumbnails, maps, worker uploads, and certificates each have dedicated prefixes; certificates follow `certs/{project}/{module}/{submission}.pdf`.
  - Certificates are A4 documents rendered via PDFKit with a branded border, descriptive paragraph, and signature area for the Indux platform.

### Photo Capture & Retrieval
- `photo` fields set `accept="image/*"` and `capture="environment"` so phones open the rear camera while desktop users get the webcam/file picker.
- The wizard uploads photos via the same presigned PUT pipeline, shows a thumbnail preview, and records `{ key, type: 'photo' }` in submissions.
- Reviewers/workers request presigned GET URLs or use `/uploads/stream` to view the stored image without exposing public buckets.

## Certificate Generation
1. During `POST /submissions/:id/approve`, the API fetches submission + project + module.
2. Generates a PDF via `services/pdf.ts` with worker name, project name, and module type.
3. Stores it in MinIO and saves `certificateKey` on the submission.
4. Workers access certificates through history or the wizard once approval is complete.

### Regenerating Legacy Certificates
Existing certificates are not re-rendered automatically. To apply the latest layout to historical approvals, run:
```
cd api
npx ts-node src/scripts/regenerateCertificates.ts
```
The script reloads each approved submission, rebuilds the PDF with the current template, and uploads it back to the same MinIO key.

## Security Model
1. **Assignment Enforcement** – All manager/worker routes check assignments (`Assignment.findOne`). Examples: module GET/PUT, reviews, submissions, team management, uploads.
2. **Role Checks** – `requireRole` middleware ensures only authorised roles hit protected routes.
3. **File Ownership** – Downloads/streaming map keys to modules or submissions and ensure the user either owns the submission or manages the project.
4. **Module Access** – `GET /projects/:projectId/modules/induction` returns data only if the caller is admin or assigned manager/worker of that project.
5. **Per-Worker Module Restrictions** – If a worker assignment stores module IDs, module listings, detail calls, and submission routes are filtered so the worker sees only the assigned inductions; empty lists continue to expose all modules.
6. **Submission Safety** – Workers can submit only when modules are approved and they have assignments; pending submissions are updated instead of deleted to avoid race conditions.
7. **Auditing** – ModuleReview stores snapshots; submissions capture reviewer IDs and reasons.
8. **Creation/List Guardrails** – Managers must be assigned to a project before hitting `POST /projects/:projectId/modules/induction` or `GET /modules/:moduleId/submissions`. Admins bypass this requirement.

## Docker & Environment Setup
1. **Environment Variables** – `.env` defines Mongo URI, MinIO endpoint/access keys, JWT secrets, SMTP, and allowed origins (used by both API and frontend).
2. **Compose Services** – `indux-api`, `indux-frontend`, `mongo`, and `minio`. Reverse proxy (Caddy/Dokploy) runs separately and attaches to the shared network.
3. **Volumes/Networks** – External volumes (`indux_mongo_data`, `indux_minio_data`) and `shared_caddy_net` mimic production; adjust as needed for local-only environments.
4. **Local Run** – `docker compose up --build` starts the full stack. Dev mode can use `npm run dev` in `/api` and `/frontend` for hot reload.
5. **Seeding** - `SEED=true npm run dev` or `npm run seed` populates demo users (admin/manager/worker), the demo project, the approved induction module, quiz, default fields, assignments, the seeded **Indux Induct Template**, and five default Inspection Templates (PPE, Pre-Start Heavy Machinery, Site Safety HazCheck, First Aid Kit, High-Risk Work Permit).

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

Seeding also creates "Demo Project" (status `active`) with an approved module, quiz questions, default fields, and assignments so the full induction pipeline works immediately, plus the reusable **Indux Induct Template** and five inspection templates for PPE, Heavy Machinery, HazCheck, First Aid, and High-Risk permits.

## Additional Notes
- Axios interceptors refresh JWTs and handle 401/403 responses globally.
- Slides viewer supports PDF via pdf.js and PPT/PPTX via Office Online embeds; worker view now mirrors admin/manager behaviour.
- Review Queue is shared across admin/manager routes, with server-side filtering based on assignments.
- Worker Dashboard surfaces manager contact details to streamline communication.
- Manager dashboard quick actions route to `/manager/projects` so managers choose a project before managing teams or approvals.

Keep this file updated alongside feature changes to maintain an accurate technical reference.
