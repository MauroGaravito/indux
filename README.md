# INDUX – Project-Based WHS Inductions

INDUX is a Work Health & Safety induction platform tailored for Australian construction projects. Every project owns an Induction Module, and three roles collaborate to keep site crews compliant.

## Platform Workflow
1. **Admin**
   - Creates projects and seeds their induction modules.
   - Configures fields, slides, quizzes, and settings.
   - Assigns managers to each project and monitors reviews.
2. **Manager**
   - Edits modules while they are in `draft`, `declined`, or `pending` states.
   - Sends modules for review and actions worker submissions.
   - Manages assigned workers and keeps pending approvals clear.
3. **Worker**
   - Views only assigned projects on the Worker Dashboard.
   - Completes the Induction Wizard (personal data, uploads, slides, quiz, signature).
   - Resubmits if declined and accesses certificates once approved.

## Roles at a Glance
- **Admin** – Full control of projects, modules, assignments, users, and reviews.
- **Manager** – Project-level ownership: edit modules, review submissions, manage workers.
- **Worker** – Completes inductions for assigned projects and retains certificates.

## Module & Submission Lifecycle
1. **Draft** – Admins/managers iterate on configuration.
2. **Pending** – Module submitted for review; managers can still tweak before decision.
3. **Approved** – Locked for managers, open to workers for submissions.
4. **Declined** – Returns to edit mode and can re-enter the review cycle.
Worker submissions follow the same idea: pending → approved (certificate issued) or declined (worker retries).

## Security Model
- Assignments dictate all access. Managers and workers only touch their assigned projects; admins bypass checks.
- Module, review, submission, and upload routes verify role + assignment before serving data.
- Presigned downloads (slides, uploads, certificates) validate ownership to prevent cross-project exposure.

## API Overview (High Level)
- **Projects & Modules** – Project CRUD, module creation, configuration, and review status updates.
- **Reviews & Submissions** – Module review requests, approvals/declines, and worker submission handling.
- **Assignments** – Manager and worker assignments per project, plus manager team lookups.
- **Uploads** – Presigned PUT/GET and streaming endpoints built on MinIO.
- **Worker/Manager Utilities** – Dashboard data, assignment-driven listings, and histories.
For the full endpoint catalogue see `architecture.md`.

## Frontend Experience
- **Admin Dashboard** – Project register, module editor, user directory, branding, and pending approvals.
- **Manager Console** – Assigned projects, module editor (manager mode), project overview, team management, and review queue.
- **Worker Dashboard** – Assigned projects, submission status, and certificate access.
- **Induction Wizard** – Guided experience for workers covering every induction step.
- **History & Certificates** – Completed submissions with secure certificate downloads.

## Tech Stack
- **Backend**: Node 18+, Express, TypeScript, Mongoose, JWT authentication.
- **Frontend**: React 18, Vite, Material UI, Zustand, Axios.
- **Data/Storage**: MongoDB + MinIO (S3-compatible) for slides/uploads/certificates.
- **Infra**: Docker Compose orchestration with optional reverse proxy (Caddy/Dokploy).

## Local Development
1. Copy `.env.example` to `.env` and set Mongo URI, MinIO keys, JWT secrets, and allowed origins.
2. Run `docker compose up --build` to start Mongo, MinIO, API, and frontend.
3. Optional: in `api/`, run `SEED=true npm run dev` (or `npm run seed`) for demo data.

## Roadmap
- Auto-select the sole project for workers to reduce friction.
- Enhanced manager dashboards with direct links to teams and approvals.
- Module versioning and audit history for WHS sign-off.
- Documented role matrix exposed in-app.
- End-to-end UX refinements across dashboards, wizard, and notifications.

For detailed architecture, endpoints, and troubleshooting see `architecture.md`.
