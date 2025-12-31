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

## 15 December 2025
1. Added a dedicated empty state to the module editor so admins/managers can create an induction module after a 404 (no more error toast); the axios interceptor suppresses notifications for this expected 404.
2. Locked down module review approvals to admin-only in both backend and frontend; managers now see read-only states for approved/pending modules.
3. Updated Review Queue so managers assigned to a project can approve or decline worker submissions while module approvals remain admin-only.
4. Documented the submission approval split and empty-state behavior in `README.md` and `architecture.md`.

## 16 December 2025
1. Introduced reusable **Induction Templates**: backend model, admin-only CRUD endpoints, and a new admin UI surface (list + editor) that reuses the module editor in template mode.
2. Updated project module creation to support blank modules or deep clones from templates, including automatic field/config seeding. Projects can now host multiple modules, and the UI (admin + manager) includes selectors and creation dialogs.
3. Added assignment guardrails so managers must be assigned to a project before creating modules or listing submissions; admins bypass as usual.
4. Refreshed documentation (`README.md`, `architecture.md`) and frontend empty states to reflect multi-module support, template workflows, and the new security rules.

## 17 December 2025
1. Added module deletion support (`DELETE /modules/:moduleId`) plus admin UI controls so unused inductions can be removed along with dependent reviews/submissions.
2. Introduced per-worker module permissions: assignments now store an optional `modules[]`, `PUT /assignments/:id/modules` lets admins/managers configure access, and worker-facing APIs/UI filter module lists accordingly.
3. Updated Admin Projects and Manager Team pages with the new "Assign modules" dialog, showing summaries of current restrictions and allowing edits from both consoles.
4. Filtered worker dashboards, module detail endpoints, and submission routes to honour the assignment's module list, preventing workers from seeing or submitting to unauthorised inductions.
5. Documented the new behaviour in `README.md` and `architecture.md`.

## 21 December 2025
1. Replaced the Google Maps dependency with Leaflet + OpenStreetMap across Admin projects. The Project Info panel now includes click-to-set locations, editable Points of Interest, and a CTA that opens a full-screen Project Map Editor at `/admin/projects/:projectId/location`. Coordinates are persisted on the project model and surfaced to managers/workers.
2. Added the dedicated **Worker Submissions** console for admins/managers with tabs for Inductions, Exams (placeholder), and Inspections (placeholder). Existing submission review logic was moved here, improving clarity between worker compliance reviews and module/template approvals.
3. Cleaned up the admin navigation and review pages by renaming "Module Reviews" to **Induction Module Reviews**, updating all headings/empty states/button text accordingly so it is explicit that this screen is only for induction modules/templates. README and architecture docs were updated to describe the new map editing flow and worker submissions area.

## 22 December 2025
1. Finalised the project map enhancements: admins/managers can now set a default zoom level per project, store it on the Project model, and render that zoom consistently across admin/manager/worker maps.
2. Added POI colour storage plus a palette-driven picker in `ProjectMapEditor`, so each pin can be recoloured with one click; Leaflet markers adopt the stored colours everywhere.
3. Updated backend validators, populate paths, and worker/manager payloads so `mapZoom` and `pointsOfInterest.color` are persisted and returned consistently.
4. Refreshed README and architecture docs to record the new geography controls, note that the induction module scope is complete, and call out that inspections are the next roadmap item; DEVLOG now marks the induction module effort as done.

## 23 December 2025
1. Landed the inspections data model (InspectionTemplate, ProjectInspection, InspectionExecution), admin CRUD endpoints, project activation routes, execution APIs, and submit validation (POI, signature, item rules) without touching the older induction flows.
2. Delivered the Inspection Templates admin UI, Project Inspections page, and Inspection Wizard that mirrors the Induction Wizard (Context, Checklist, Summary, Signature, Submit) using the same MUI stepper and gating patterns.
3. Wired admin routing/navigation with new sidebar items, refreshed the Induction Templates UI to match inspection styling, and seeded five professional inspection templates plus the default **Indux Induct Template** during bootstrap.
4. Updated README, `architecture.md`, and other docs to describe inspection workflows, seeded templates, project activation, and the worker-facing wizard so onboarding stays accurate.

## 27 December 2025
1. Closed **Inspection Module v1** from a UX perspective: dashboards (manager/worker) now muestran cada inspección activada, su estado (Not started/In progress/Completed) y botones para ejecutar o ver el `InspectionWizard` en modo lectura tras el submit.
2. El wizard registra cada envío como evidencia WHS (sin revisión): `Submit` bloquea la inspección, actualiza el historial local y actualiza los estados en los dashboards.
3. La pestaña **Project ? Inspections** incorpora un historial read-only con las ejecuciones enviadas (fecha, usuario, estado Submitted) más controles para activar/desactivar plantillas.
4. Documentación actualizada (`README`, `architecture.md`) con la sección "Inspection Workflow (v1)" que deja claro que el backend está completo, que manager/worker son los ejecutores y que no existe revisión/aprobación en esta versión (se planifica para una fase futura).

## 28 December 2025
1. Confirmé que `InspectionExecution` almacena `templateId` y `executedByRole`, añadí índices de auditoría y dejé expuestos los endpoints read-only (`GET /inspection-records`, `/projects/:projectId/inspection-records`, `/my/inspection-records`, `/inspection-records/:id`) para Admin, Manager y Worker.
2. Publiqué **Admin ? Inspection Records** con filtros por proyecto/usuario/plantilla/rango de fechas, tabla estilo MUI y botón **View** que abre el `InspectionWizard` en modo `readOnly`.
3. Añadí el historial por proyecto (Project ? Inspections ? History) y la tabla "Completed inspections" en el dashboard del worker, ambos alimentados por los nuevos endpoints y enlazados al wizard en modo auditoría (snapshot, checklist, fotos con presign, firma, POI, metadatos).
4. Extendí `InspectionWizard` con `mode="readOnly"` para reutilizar el mismo layout como visor de auditoría, y actualicé `README.md` + `architecture.md` + `DEVLOG.md` para dejar marcado que el Inspection Module v1 queda cerrado y audit-ready.

## 29 December 2025
1. Eliminamos las coordenadas semilla al crear proyectos nuevos: `location` comienza en `null` hasta que alguien guarda el mapa y los validadores backend ahora aceptan esa ausencia sin romper PUT heredados.
2. Agregamos el campo opcional `locationLabel` al modelo/API/UI para describir la ubicación en texto plano y lo mostramos junto a las coordenadas dentro del Project Summary.
3. El Project Summary ahora solo lee del proyecto persistido, evitando que ediciones no guardadas aparezcan como definitivas; README y `architecture.md` documentan el nuevo flujo.
## 30 December 2025
1. Documentamos en README/architecture que los proyectos arrancan sin coordenadas, que el Project Summary solo refleja el snapshot guardado y que el tab Setup muestra un warning cuando la ubicación draft difiere del valor persistido (los cambios siguen dependiendo de Save project).

## 31 December 2025
1. Rediseñamos el certificado PDF del worker (borde, branding, bloque de detalles, sección de firma) y añadimos el script `npx ts-node src/scripts/regenerateCertificates.ts` para reemitir certificados existentes si hace falta.
2. `SubmissionDetails` ahora muestra las fotos de payload y la firma del worker con un layout más prolijo.
