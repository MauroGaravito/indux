# Dev Log - INDUX

## 23 November 2025 (AM)
1. Tightened permission checks so managers can only approve/decline modules and submissions for projects where they hold an assignment.
2. Added ownership validation to presigned downloads and streaming endpoints to ensure only admins, assigned managers, or authorised workers can access project content.
3. Allowed managers to submit induction modules for review without tripping 403 errors so long as they are assigned to the project.
4. Fixed the duplicate-submission path so pending worker submissions are updated in place rather than deleted and recreated.
5. Confirmed managers may edit modules when the status is `draft`, `declined`, or `pending`.
6. Applied assignment validation to `GET /projects/:projectId/modules/induction` to prevent configuration leakage between projects.

## 23 November 2025 - PM session
1. Completed a wording overhaul across 19 frontend files to align every label, heading, and CTA with Australian-English WHS terminology.
2. Fixed the Manager Dashboard quick action by removing the hard-coded `/manager/projects/1/team` route and redirecting to the projects list.
3. Delivered a full workflow and security assessment covering admin-manager-worker pipelines, module lifecycle, assignment logic, API structure, and frontend alignment.
4. Prepared for the "full user-to-certificate pipeline" session by confirming every stage from project creation to certificate download is documented and validated.
5. Agreed that DEVLOG now serves as the single source of truth for daily platform updates and documentation alignment.

## 24 November 2025
1. Fixed the worker Slides Viewer so it now passes the file name and extension to `/slides-viewer`, allowing PDF decks to render via pdf.js just like admin/manager views.
2. Rewrote `README.md` to present a concise, Australian-English overview of the workflow, roles, lifecycle, security, APIs, frontend experience, tech stack, and roadmap.
3. Rebuilt `architecture.md` with the full technical reference (models, endpoints, workflows, uploads, security, Docker, troubleshooting, and seed data) to keep documentation aligned with current behaviour.

## 25 November 2025
1. Added conditional `visibleIf` support across backend validation and the worker wizard so fields can appear based on prior answers.
2. Seeded the Medical Condition defaults (Yes/No + conditional details) and documented full customisation controls for admins/managers.
3. Introduced the `photo` field type with camera capture, presigned MinIO uploads, and thumbnail previews inside the wizard.
4. Updated manager editing rules so modules remain editable while in `draft`, `pending`, or `declined`, reserving read-only mode for `approved` states.
5. Delivered the Admin -> Projects "Assigned Workers" tab and clarified that admins must seed worker assignments before managers can manage their teams.
6. Enhanced the worker wizard to bundle photo uploads into submissions, refresh previews, and respect conditional visibility without blocking submission.
