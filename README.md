# INDUX - WHS Inductions for Project Teams

INDUX is a project-centric Work Health & Safety (WHS) induction platform for Australian construction companies. Each project owns its own Induction Module, while admins, managers, and workers collaborate to keep crews compliant.

## Workflow at a Glance
1. **Admin**
   - Creates projects and seeds their induction modules.
   - Configures fields, slides, quizzes, and settings.
   - Assigns managers and workers to each project and oversees reviews.
2. **Manager**
   - Edits modules while they are in `draft`, `declined`, or `pending`.
   - Sends modules for review and processes pending approvals.
   - Reviews worker submissions and manages allocated workers.
3. **Worker**
   - Sees only assigned projects on the Worker Dashboard.
   - Completes the Induction Wizard (personal data, uploads, slides, quiz, signature).
   - Resubmits if declined and accesses certificates once approved.

## Roles
- **Admin** - Full control over projects, modules, assignments, submissions, reviews, users, and branding.
- **Manager** - Owns assigned projects, edits modules in draft/declined/pending, approves/declines submissions, manages workers.
- **Worker** - Completes inductions for assigned projects and stores their certificate history.

## Module & Submission Lifecycle
1. **Draft** - Admins/managers iterate on configuration.
2. **Pending** - Module submitted for review; managers can still refine content before a decision.
3. **Approved** - Locked for managers, open for worker submissions.
4. **Declined** - Reopens for edits and can re-enter the review pipeline.

Worker submissions mirror this process: pending + approved (certificate generated) or declined (worker resubmits). Certificates are produced during approval and stored securely.

## Induction Field Defaults & Customisation
Every project receives a WHS-ready personal data pack when its induction module is created:

1. Full Name
2. Email
3. Phone
4. Position
5. Company Name
6. Medical Condition (select: Yes/No)
7. Medical Condition Details (textarea, visible only when Medical Condition is "Yes")

Admins and managers can reorder, relabel, change steps, toggle required flags, or add/remove fields at any time. Updates flow straight through to the worker wizard and submissions without downtime.

### Field Types (including `photo`)
- `text`, `number`, `date`, `textarea`, `boolean`, `select`
- `file` - standard uploader for docs, PDFs, etc.
- `photo` - camera-friendly capture that:
  - opens the device camera on mobile (`capture="environment"`)
  - falls back to webcam/file picker on desktop
  - accepts only images (`accept="image/*"`)
  - uses the same MinIO presigned upload pipeline as `file`
  - shows upload progress plus a thumbnail preview in the wizard
  - stores uploads in submissions as `{ key, type: 'photo' }`

### Conditional Fields (`visibleIf`)
`InductionModuleField` accepts a conditional payload:
```
visibleIf: {
  fieldKey: string
  equals: string
}
```
The wizard hides fields until the condition is met and hidden fields never block submission. Medical Condition Details is preconfigured with `visibleIf: { fieldKey: 'medicalCondition', equals: 'Yes' }`, and the same structure can be applied to any custom field.

## Manager Editing Behaviour
Managers may edit induction modules (fields, slides, quiz, settings) whenever `reviewStatus` is `draft`, `pending`, or `declined`. Only `approved` modules become read-only in manager mode. Admins may edit at any stage but usually keep approved modules locked for audit purposes.

## Assignment Workflow & Worker Pools
- Admins assign **managers** and **workers** via Admin -> Projects. The detail panel now includes distinct tabs for **Assigned managers** and **Assigned workers** so admins can seed both roles in one place.
- Workers must be assigned by an admin before they appear in a manager's pool (`ManagerTeam`). Managers can only add/remove workers that already exist in their pool.
- Core endpoints:
  - `POST /assignments` (`role: 'manager' | 'worker'`)
  - `GET /assignments/project/:projectId`
  - `GET /assignments/manager/:managerId/team`
  - `DELETE /assignments/:id`

## Security Model
- Assignment-based access ensures managers/workers can only interact with their projects; admins bypass the checks.
- Module, review, submission, and upload routes all verify role + project assignment.
- Presigned downloads and streaming endpoints validate ownership before exposing slides, uploads, or certificates.
- Worker dashboard, wizard, and history are fully scoped to each worker's assignments.

## API Overview (Conceptual)
- **Projects & Modules** - Create projects, seed induction modules, update configuration, and advance review status.
- **Reviews & Submissions** - Module review requests plus manager/admin approvals or declines; worker submissions and resubmissions.
- **Assignments** - Manager/worker assignment management and manager team lookups.
- **Uploads** - Presigned PUT/GET endpoints and streaming for MinIO-backed files.
- **Worker/Manager Utilities** - Dashboard data, histories, and review queues powered by assignment-aware endpoints.
See `architecture.md` for the full endpoint catalogue.

## Frontend Experience
- **Admin Dashboard** - Project register, module editor, user directory, branding, Pending Approvals, and the Assigned Workers tab per project.
- **Manager Console** - Assigned projects overview, module editor (manager mode), project detail, team management, and Pending Approvals.
- **Worker Dashboard** - Assigned projects, submission status, manager contacts, and certificate access.
- **Induction Wizard** - Guided worker experience across project selection, personal data (with conditional fields), uploads, slides viewer, quiz, signature, and submission. Photo fields open the camera, upload to MinIO via the same presigned pipeline, and render a thumbnail preview for confidence.
- **History & Certificates** - Secure record of submissions with certificate downloads.

## Tech Stack
- **Backend** - Node.js 18+, Express, TypeScript, Mongoose, JWT authentication.
- **Frontend** - React 18, Vite, Material UI, Zustand, Axios.
- **Data & Storage** - MongoDB for persistence and MinIO (S3-compatible) for slides/uploads/certificates.
- **Infrastructure** - Docker Compose for API, frontend, MongoDB, and MinIO; reverse proxy via Caddy or Dokploy.

## Local Development
1. Copy `.env.example` to `.env` and update Mongo URI, MinIO keys, JWT secrets, SMTP, and allowed origins.
2. Run `docker compose up --build` to start Mongo, MinIO, API, and frontend containers.
3. Optional: in `api/`, run `SEED=true npm run dev` or `npm run seed` to create demo data (projects, assignments, approved module).

## Roadmap
- Auto-select the only available project for workers to streamline the wizard.
- Enhanced manager dashboards with direct links to teams and approvals.
- Versioning and audit history for induction modules.
- In-app role matrix and onboarding documentation.
- Continuing UX refinements across dashboards, wizard steps, and notifications.

For full technical details, visit `architecture.md`.
