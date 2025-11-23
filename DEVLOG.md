# Dev Log – INDUX

## 23 de noviembre de 2025

1. Se implementaron validaciones de permisos para que los managers solo puedan aprobar o declinar módulos y envíos asociados a proyectos en los que están asignados.
2. Se añadió validación de propiedad en las descargas de archivos (presigned URLs y streaming) para asegurar que solo admins, managers asignados o workers autorizados puedan acceder a contenidos del proyecto.
3. Se habilitó que los managers envíen módulos de inducción a revisión sin generar errores 403, siempre que estén asignados al proyecto.
4. Se corrigió el manejo de duplicación de submissions: ahora las submissions en estado “pending” se actualizan sin eliminar registros previos, evitando pérdida de datos.
5. Se permitió que los managers editen módulos en estado “draft”, “declined” y ahora también “pending”.
6. Se agregó validación de asignación en el endpoint de obtención del módulo de inducción para evitar filtración de configuraciones entre proyectos.
