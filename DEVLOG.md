# Dev Log – INDUX

## 23 de noviembre de 2025

1. Se implementaron validaciones de permisos para que los managers solo puedan aprobar o declinar módulos y envíos asociados a proyectos en los que están asignados.
2. Se añadió validación de propiedad en las descargas de archivos (presigned URLs y streaming) para asegurar que solo admins, managers asignados o workers autorizados puedan acceder a contenidos del proyecto.
3. Se habilitó que los managers envíen módulos de inducción a revisión sin generar errores 403, siempre que estén asignados al proyecto.
4. Se corrigió el manejo de duplicación de submissions: ahora las submissions en estado “pending” se actualizan sin eliminar registros previos, evitando pérdida de datos.
5. Se permitió que los managers editen módulos en estado “draft”, “declined” y ahora también “pending”.
6. Se agregó validación de asignación en el endpoint de obtención del módulo de inducción para evitar filtración de configuraciones entre proyectos.

## 23 November 2025 – PM session

1. Completed a wording overhaul across 19 frontend files to align every label, heading, and CTA with Australian-English WHS terminology.
2. Fixed the Manager Dashboard quick action by removing the invalid hard-coded `/manager/projects/1/team` route and redirecting to the projects list.
3. Delivered a full workflow and security assessment covering admin-manager-worker pipelines, module lifecycle, assignment logic, API structure, and frontend alignment.
4. Prepared for the “full user-to-certificate pipeline” session by confirming every stage from project creation to certificate download is documented and validated.
5. Agreed that DEVLOG now serves as the single source of truth for daily platform updates and documentation alignment.
