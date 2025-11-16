# Indux - Induction Tool (Monorepo)

Indux es una herramienta de induccion de seguridad para construccion (single-tenant).
Incluye:
- API Node/Express en TypeScript
- Frontend React + Vite
- MongoDB y almacenamiento S3-compatible (MinIO)
- Orquestado con Docker Compose; el mismo `docker-compose.yml` sirve para produccion con Caddy/Dokploy.

---

## Actualizaciones recientes (2025-11-16 - Submission Flow & Review UX)

- **Backend – Submissions resistentes a IDs corruptos**  
  - `api/src/services/submissionsService.ts` ahora normaliza cualquier `projectId` usando un helper interno antes de ejecutar `find()`, `findById()` o `populate()`.  
  - `createSubmission` garantiza **una sola submission por worker/proyecto**: si existe una pending/declined se reemplaza, y si ya hay una `approved` se bloquea.  
  - Todos los endpoints existentes (`POST /submissions`, `POST /submissions/:id/approve|decline`, `DELETE /submissions/:id`) trabajan siempre con ObjectIds limpios, evitando los CastError cuando el frontend enviaba objetos.
- **Manager/Admin Review Experience**  
  - `frontend/src/pages/ReviewQueue.jsx` muestra acciones rápidas en la tabla: `Review`, `Approve`, `Decline`, `Retry` y `Delete` (solo admins).  
  - El modal `SubmissionReviewModal` expone los mismos controles (“Approve”, “Decline / Send Back” y “Delete”) con confirmaciones y refresca la tabla automáticamente al completar una acción.
- **Worker Wizard Dinámico**  
  - El paso “Personal Details” ahora se construye **100% a partir de la configuración del proyecto** (`project.config.personalDetails.fields` + `extraFields`), soportando tipos text/date/number/select/boolean/textarea + uploads.  
  - Al abrir el wizard se consulta `/submissions` del worker:  
    - `approved` → bloquea el flujo con un mensaje.  
    - `pending` → avisa que la submission está en revisión.  
    - `declined` → precarga la data anterior para retry y, al volver a enviar, reemplaza la submission existente.  
  - El payload enviado a `/submissions` siempre persiste `personal[field.label]`, por lo que coincide con los campos creados desde Admin.

## Actualizaciones recientes (2025-11-15 - UI Refresh & Branding)

- **Autenticación / Layouts**
  - Nuevo `LoginLayout` minimalista y rutas `/login|/register|/pending` sin `AppNav`. El formulario de Login ahora muestra logo, card centrada y redirecciones según rol.
- **Manager Experience**
  - `ManagerDashboard` renovado con métricas en vivo, tabla de actividad y pipeline de revisiones (`/submissions`, `/reviews/projects`, `/projects`, `/users`).
  - `ManagerProjects` convertido en panel enterprise: lista de proyectos, detalle tabulado (Overview/Team/Activity) y acciones con estados.
  - `ManagerSettings` actualizado con cards (perfil, password, notificaciones) para mantener coherencia visual.
  - `ReviewQueue` reorganizado en cards y tabs empresariales, reutilizando la misma lógica existente.
- **Worker Experience**
  - Dashboard, Inductions, Certificates y Settings modernizados con cards, métricas y datos reales usando solo `/projects` y `/submissions`. Certificates muestra placeholders cuando no hay `certificateKey`.
  - Ajustes en frontend para que todas las pantallas de worker usen la misma experiencia enterprise y no hagan llamadas con parámetros no soportados.
- **Admin Dashboard**
  - Sección “Activity” ahora consume `/projects`, `/submissions`, `/reviews/projects`, `/users` y muestra:
    - Timeline de actividad combinada.
    - Snapshot semanal con mini-gráficas.
    - System Status con métricas clave, todo en cards estilo enterprise.
- **Admin Settings / Branding**
  - `AdminSettings.jsx` reorganizado en cuatro cards (Brand Identity, Live Brand Preview, System Information, Future Options) manteniendo los mismos endpoints (`/brand-config`).
  - Preview muestra cómo quedarían acciones, chips y header con los colores configurados; las opciones futuras están documentadas con TODOs backend.
- **API**
  - `GET /submissions` ahora soporta acceso de workers devolviendo solo sus submissions (`routes/submissions.ts`). Manager/Admin conservan la lógica anterior.

## Project Fields (Custom Personal Details)

Backend now includes a scoped CRUD system for per-project field definitions exposed via the existing API namespace:
- `GET /projects/:projectId/fields` – list ordered field metadata for that project.
- `POST /projects/:projectId/fields` – create a new field (validates key uniqueness per project, type, options).
- `PUT /fields/:id` – update label, key, type, required flag, help text or order for an existing field.
- `DELETE /fields/:id` – remove a field definition.

On the frontend, the Admin > Projects experience now ships with `ProjectFieldsEditor`, a professional UI that replaces the legacy `PersonalDetailsSection`. Admins can create, edit, delete and reorder custom fields with validation, contextual icons, select options management and confirmation flows without touching `project.config.personalDetails`. Workers still consume the legacy payload until the next phase aligns the submission wizard with these definitions.

## Actualizaciones recientes (2025-11-15)

- **Frontend – Reorganización y componentes base (Fase 1)**  
  - `src` ahora se estructura en `pages/`, `components/common|layout|forms|tables`, `hooks/`, `context/`, `layout/`, `utils/`, `theme/`.  
  - Componentes reutilizables (`DUSButton`, `DUSTable`, `DUSCard`, etc.) y layouts base (`MainLayout`, `AdminLayout`, `ManagerLayout`, `WorkerLayout`) fueron creados para escalar sin tocar lógica de negocio.
- **Frontend – Theme Moderno (Fase 2)**  
  - Se añadió `src/theme/` con `baseTheme`, `modernTheme` y overrides globales (palette #6366F1, tipografía Inter, botones, inputs, tablas, cards).  
  - `ThemeProvider` usa `modernTheme` y `CssBaseline` centralizado, preparando la UI para variantes de marca futuras.
- **Frontend – Layouts y rutas (Fase 3)**  
  - `AdminLayout`, `ManagerLayout` y `WorkerLayout` ahora incluyen sidebar responsivo + header con estado móvil/desktop, usando `Outlet` para las páginas hijas.  
  - `ReviewQueue` se sirve bajo `/admin/review` y `/manager/review`. También se añadieron placeholders (`ManagerProjects`, `ManagerSettings`, `WorkerInductions`, `WorkerCertificates`, `WorkerSettings`).  
  - `AppNav` y todas las sidebars muestran el logo global (`src/assets/indux-logo.png`) y respetan el branding definido.
- **Branding y assets**  
  - El favicon oficial vive en `public/indux-icon.png`; `index.html` lo referencia y el Dockerfile copia `/public` dentro de la imagen de Nginx para servirlo.  
  - Se eliminó la copia redundante del ícono dentro de `src/assets/`.  
  - El Caddyfile (producción) se actualizó para enrutar `/indux-icon.png` al frontend antes que al proxy de MinIO, evitando respuestas 403.
- **Infra & Deploy**  
  - Dockerfile multi-stage: después de `npm run build`, copia tanto `/dist` como `/public` a `/usr/share/nginx/html`.  
  - Mantener `VITE_API_URL` como `ARG` durante el build y reutilizar la red `shared_caddy_net` para Caddy/Dokploy.

## Actualizaciones recientes (2025-11-08)

- Review (Manager/Admin)
  - Modal “View” de submissions ahora renderiza datos con MUI: datos personales en grid, resumen del quiz, firma (imagen) y lista de uploads. También muestra el cuestionario con la respuesta seleccionada y la correcta.
  - Nueva pestaña “All Submissions” con tabla (Worker, Project, Status, Submitted At, Reviewed By) y acción “View”, filtros por estado y recuentos.
- Dashboard (Admin)
  - "Overview" ahora usa datos en vivo: Projects, Inductions Completed, Pending Reviews (submissions + project reviews), Users.
- Wizard (Worker)
  - El formulario de "Personal Details" se alimenta de la configuración de Admin (`project.config.personalDetails.fields`). Si no hay configuración guardada, se muestran campos por defecto (Name, DOB, Address, Phone, etc.). Los selects usan `native: true` para compatibilidad.
  - Cámara integrada: bloque visual con video en vivo (`autoPlay`, `playsInline`, `muted`), captura a `canvas`, vista previa, y botones Capture / Retake / Accept / Cancel. No se sube nada hasta "Accept". Manejo de limpieza del stream y fix del error `srcObject` nulo.
  - Slides: visor embebido centrado y escalado automáticamente (PDF directo; PPT/PPTX vía Office Online). Temporizador de 5 segundos por slide que bloquea “Next/Continue” hasta cumplirse. El botón “Open Original” permanece disponible.
  - Submit: diálogo de confirmación (Cancel/Confirm) para evitar doble clic, indicador de carga en “Confirm”, mensaje de éxito y redirección automática al dashboard del worker.
- Backend
  - `GET /submissions` acepta `?status=pending|approved|declined|all` (default `pending`) y devuelve `userId.name`, `projectId.name` y `reviewedBy.name` (populate).
  - `Submission.quiz` soporta `answers` (índices seleccionados) y el wizard las envía.
- Compatibilidad
  - Submissions antiguas sin `quiz.answers` siguen funcionando; el UI muestra “No stored answer” si falta.
- Compose
  - Docker Compose v2 ignora `version:`; puedes removerlo del `docker-compose.yml` para evitar warnings.

- Branding
  - Nuevo módulo BrandConfig (API + UI) para definir nombre de empresa, logo y colores.
  - Página Admin → Settings permite editar y guardar el branding.
  - El frontend aplica los colores al tema de MUI (ThemeProvider) y muestra el logo/nombre en la barra superior.

## Produccion

- App: https://indux.downundersolutions.com/
- API (via Caddy): https://indux-api.downundersolutions.com/

Despliegue recomendado: Dokploy + Caddy (o cualquier reverse proxy) con Docker Compose.
En Dokploy, importa este repositorio como aplicación Docker Compose y configura las variables descritas abajo.

---

## Arquitectura y servicios

- `api`: Express (puerto 8080)
- `frontend`: build de Vite servido con Nginx (puerto 80)
- `mongo`: MongoDB 7 (puerto 27017)
- `minio`: MinIO + consola (9000/9001)
- Red externa: `shared_caddy_net` (debe existir previamente y la usa Caddy para hacer proxy a `api` y `frontend`).

Crear la red si no existe:
```
docker network create shared_caddy_net
```

---

## Variables de entorno

Usa `.env` localmente (ver `.env.example`). En produccion, configuralas en Dokploy/Caddy.

Claves principales:
```
NODE_ENV=production
PORT=8080
MONGO_URI=mongodb://mongo:27017/indux

# JWT
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d

# MinIO / S3 (interno)
S3_ENDPOINT=http://minio:9000
S3_REGION=us-east-1
S3_BUCKET=indux
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_USE_SSL=false

# MinIO / S3 (publico para firmar URLs)
# MUY IMPORTANTE para que los uploads desde el navegador funcionen
PUBLIC_S3_ENDPOINT=http://localhost:9000   # en local
# ej. en prod: https://s3.downundersolutions.com

# SMTP
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
MAIL_FROM=Indux <no-reply@indux.local>

# CORS frontend (lista separada por comas)
FRONTEND_URL=http://localhost:5173

# Frontend (solo build del frontend)
VITE_API_URL=https://indux-api.downundersolutions.com

# Seed inicial (solo primer despliegue)
SEED=true
```

Notas:
- `PUBLIC_S3_ENDPOINT` ahora es soportado por `api/src/services/minio.ts` y se usa para firmar URLs presignadas accesibles desde el navegador. Si no lo defines, se firma contra el endpoint interno y los uploads pueden fallar desde el browser.
- `VITE_API_URL` lo consume el frontend en build/preview/dev (ver `frontend/src/utils/api.js`). En Dokploy, pasa `VITE_API_URL` como ARG/ENV al construir el contenedor del frontend (por ejemplo `https://indux-api.downundersolutions.com`).
- `SEED=true` solo para el primer despliegue: crea usuarios de demo si no existen. Luego cambia a `SEED=false` y vuelve a desplegar para desactivar el sembrado automático.

---

## Despliegue en Dokploy (pasos sugeridos)

1) Red de Docker compartida (si usas Caddy externo)
```
docker network create shared_caddy_net
```
Conecta Caddy a esa red (`docker network connect shared_caddy_net caddy`).

2) Importa la app Docker Compose en Dokploy
- Usa este repo y el `docker-compose.yml` del proyecto.
- Asegúrate de que la red `shared_caddy_net` exista y esté marcada como externa en Dokploy.

3) Variables/Secrets mínimos
- API:
  - `NODE_ENV=production`
  - `PORT=8080`
  - `MONGO_URI=mongodb://mongo:27017/indux`
  - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (valores seguros)
  - `FRONTEND_URL` (orígenes permitidos, separa por comas; ej. `https://indux.downundersolutions.com`)
  - `S3_*` y `PUBLIC_S3_ENDPOINT` (dominio público del MinIO/S3)
  - `SEED=true` solo en el primer despliegue
- Frontend:
  - `VITE_API_URL=https://indux-api.downundersolutions.com`

4) Volúmenes
- Mongo: persiste `/data/db`.
- MinIO: persiste `/data`.

5) Despliega
- Primer despliegue con `SEED=true`. Revisa logs de la API en Dokploy y verifica entradas como `Seeded user admin@indux.local`.
- Luego, cambia `SEED=false` y vuelve a desplegar para evitar recrear credenciales de demo en el futuro.

6) Proxy (Caddy) – ejemplos más abajo

---

## Ejecucion local

Existen dos formas recomendadas:

1) Desarrollo con Vite/ts-node (sin proxy externo)
- Copia `.env.example` a `.env` y ajusta:
  - `FRONTEND_URL=http://localhost:5173`
  - `PUBLIC_S3_ENDPOINT=http://localhost:9000` (para que el navegador suba a MinIO local)
- Levanta dependencias con Docker (Mongo/MinIO):
```
docker compose up -d mongo minio
```
- API en modo dev:
```
cd api && npm install && npm run dev
```
- Frontend en dev (Vite 5173):
```
cd frontend && npm install && npm run dev
```
- Verifica:
  - API: http://localhost:8080/health
  - Frontend: http://localhost:5173
  - MinIO: http://localhost:9001

2) Docker Compose completo + Caddy externo o override de puertos
- El `docker-compose.yml` expone puertos solo dentro de la red; no publica `api`/`frontend` al host. Opciones:
  - Usar un contenedor Caddy en la red `shared_caddy_net` que haga proxy a `api:8080` y `frontend:80`.
  - O crear `docker-compose.override.yml` local con mapeo de puertos, por ejemplo:
    ```yaml
    services:
      api:
        ports:
          - "8080:8080"
      frontend:
        ports:
          - "5173:80"   # accesible en http://localhost:5173
    ```
  - Luego:
    ```
    docker compose up -d --build
    ```

Scripts de ayuda (Windows PowerShell):
- `api/scripts/rebuild-api.ps1 [-NoCache]`
- `api/scripts/rebuild-frontend.ps1 [-NoCache]`
- `api/scripts/rebuild-mongo.ps1`
- `api/scripts/rebuild-minio.ps1`
- `api/scripts/rebuild-all.ps1 [-NoCache]`

---

## Primer inicio de sesión / Usuarios de demo

Durante el primer despliegue con `SEED=true`, se crearán automáticamente usuarios de demo (si no existen):
- Admin: `admin@indux.local` / `admin123`
- Manager: `manager@indux.local` / `manager123`
- Worker: `worker@indux.local` / `worker123`

Recomendaciones de seguridad:
- Tras validar el acceso, cambia las contraseñas o elimina los usuarios de demo desde el panel de Admin.
- Desactiva el seed cambiando `SEED=false` y redeploy.

Entrar por primera vez:
- Frontend: inicia sesión en `/login` con un usuario seed (Admin recomendado).
- Navegación según rol:
  - Admin: `/admin` (dashboard y gestión)
  - Manager: `/review`
  - Worker: `/wizard`

---

## Endpoints API

- `GET /health`
- `POST /auth/login` -> `{ accessToken, refreshToken, user }`
- `POST /auth/refresh`
- `GET /projects`
- `POST /projects` (admin)
- `PUT /projects/:id` (admin)
- `DELETE /projects/:id` (admin)
- `POST /uploads/presign` (auth) -> `{ key, url }`
- `POST /submissions` (worker)
- `GET /submissions[?status=pending|approved|declined|all]` (manager/admin)
  - Devuelve `userId` y `projectId` con `name` (populate) y `reviewedBy.name` si existe.
- `POST /submissions/:id/approve|decline` (manager/admin)
- `POST /reviews/projects` (admin)
- `GET /reviews/projects` (manager/admin)
- `POST /reviews/projects/:id/approve|decline` (manager/admin)
\- `GET /users` (admin)
\- `POST /users` (admin) - si falta `password`, se genera automáticamente una temporal (8 chars) y se guarda hasheada.
\- `PUT /users/:id` (admin) - permite actualizar `name`, `role`, `disabled` y `password` (el backend almacena el hash en `password`).
\- `DELETE /users/:id` (admin) - borrado real del usuario (hard delete).

Branding:
- `GET /brand-config` (public)
- `POST /brand-config` (admin)
- `PUT /brand-config/:id` (admin)

---

## Subidas a MinIO (presign)

- El backend asegura el bucket y firma URLs con MinIO SDK. Las claves no empiezan con / y los prefijos terminan en /.
- Para que el navegador pueda usar la URL presignada:
  - Define PUBLIC_S3_ENDPOINT con el host publico que usara el cliente.
  - No fuerces Content-Type manualmente en el PUT del cliente.

Prefijos y ubicaciones:
- Capturas de cámara y subidas de imágenes de campos personales se guardan con prefijo worker-uploads/ dentro del bucket S3_BUCKET (por defecto indux).
- Para descargar/mostrar, usa /uploads/presign-get con la key devuelta por la subida.

Local:
- Usa PUBLIC_S3_ENDPOINT=http://localhost:9000 (el compose publica 9000 y 9001 por defecto).

Produccion:
- Usa un dominio publico (p. ej. https://s3.downundersolutions.com) y configura Caddy para no strippear el prefijo del bucket.

---

## Caddy (ejemplos)

Requiere que Caddy este unido a `shared_caddy_net` para resolver `api` y `frontend`:
```
docker network connect shared_caddy_net caddy
```

Frontend + API (dos hosts):
```caddy
indux-api.downundersolutions.com {
  encode gzip
  reverse_proxy api:8080
}

indux.downundersolutions.com {
  encode gzip
  reverse_proxy frontend:80
}
```

S3 dedicado (recomendado):
```caddy
s3.downundersolutions.com {
  encode gzip
  reverse_proxy minio:9000 {
    header_up Host {http.request.host}
  }
}
```

---

## Health check

Script de verificacion rapida: `check-health.js`.

- Por defecto consulta `http://localhost:PORT` (PORT de `.env`). Puedes forzar base con `BASE_URL`.
```
node check-health.js              # usa PORT
BASE_URL=http://localhost:8080 node check-health.js
```
- Comprueba `.env`, `/health`, login de usuarios seed, endpoints clave y una subida presignada a MinIO.

---

## Backend Architecture (Controllers/Services)

The API follows a thin-routes, controller/service structure:
- Routes (`api/src/routes/*.ts`) define URLs, auth guards, and delegate to controllers.
- Controllers (`api/src/controllers/*.ts`) parse/validate input (Zod), read `req.user`, call services, and shape responses.
- Services (`api/src/services/*.ts`) contain DB queries and business rules (Mongoose models, MinIO, mail, PDFs). They throw `HttpError` for consistent error handling.
- Global error handling lives in `api/src/middleware/errorHandler.ts` and standardizes responses.

Shared utilities:
- `api/src/utils/pagination.ts`
  - `PaginationQuerySchema` parses optional `page`/`pageSize`.
  - `wrapPaginated(items, total, page, pageSize)` returns a standard listing payload.
- `api/src/utils/response.ts`
  - `ok(data, message?)` helper for success responses when the endpoint returns an object payload.

Optional pagination contract (list endpoints):
- Without `page` and `pageSize`: the API returns a plain array (backward‑compatible behavior).
- With both `page` and `pageSize`: the API returns `{ items, total, page, pageSize }`.

Controllers currently supporting this contract:
- `/submissions` (manager/admin)
- `/projects` (all roles; scoped for non‑admin)
- `/reviews/projects` (manager/admin)
- `/assignments/user/:id`, `/assignments/project/:id`, `/assignments/manager/:id/team`

## Troubleshooting

- CORS/Login:
  - `FRONTEND_URL` debe incluir el origen activo.
  - Rebuild del frontend si cambias `VITE_API_URL`.
  - Preflight: `curl -X OPTIONS http://localhost:8080/auth/login -H "Origin: http://localhost:5173" -i`.
- MinIO 403 (SignatureDoesNotMatch):
  - Revisa `PUBLIC_S3_ENDPOINT` y que Caddy preserve el path del bucket, sin strip.
  - Hora correcta en servidor y URL vigente (10 min por defecto).
- Rebuild limpio: `docker compose build --no-cache api frontend && docker compose up -d`.
- Login redirige al refrescar: el frontend hidrata el estado de autenticación desde `localStorage` al iniciar. Si se borra el storage o el navegador lo bloquea, volverás a `/login`. Asegúrate de no estar en modo privado restrictivo y de que tu dominio esté en `FRONTEND_URL`.
edicion

---

## Arquitectura técnica (Resumen)

### Backend
- Framework: Express + TypeScript (`api/`). Persistencia con MongoDB (Mongoose) y almacenamiento S3‑compatible (MinIO).
- Rutas principales:
  - `/auth` login, refresh, registro y verificación de email.
  - `/projects` CRUD de proyectos y lectura con managers poblados.
  - `/assignments` asigna usuarios a proyectos (rol `manager` o `worker`), lista por usuario/proyecto y borra asignaciones.
  - `/submissions` crea envíos del worker y permite a manager/admin listar y aprobar/declinar.
  - `/reviews` gestiona “Project Reviews” (solicitudes de aprobación de proyecto) para managers/admin.
  - `/uploads` firma URLs para PUT/GET contra S3 y endpoint `/uploads/stream` como fallback mismo origen.
  - `/brand-config` configuración de branding utilizada por el frontend (colores, logo, nombre).
- Modelos:
  - `User` (`role: admin|manager|worker`, `status`, `emailVerified`). Password almacenado como hash bcrypt (campo `password`).
  - `Project` (`name`, `config`, `managers[]`). `config` contiene projectInfo, personalDetails, slides, questions.
  - `Assignment` (`user`, `project`, `role`) con índice único `(user, project)`.
  - `Submission` (`projectId`, `userId`, `personal`, `uploads[]`, `quiz`, `signatureDataUrl`, `status`, `reviewedBy`, `certificateKey`).
  - `ProjectReview` (`projectId`, `data`, `status`, `requestedBy`, `reviewedBy`, `reason`, `message`).
- Autenticación y autorización:
  - JWT Access + Refresh (`services/tokens.ts`). Access TTL configurable, refresh TTL 7d por defecto.
  - `requireAuth` valida access token y estado del usuario (aprobado, no deshabilitado y email verificado).
  - `requireRole(...roles)` limita por rol.
  - `requireProjectManagerOrAdmin` para modificaciones de proyecto.
  - Reglas de negocio adicionales:
    - Managers sólo ven submissions y reviews de proyectos que gestionan.
    - Managers sólo pueden asignar workers a proyectos que gestionan; sólo admin puede asignar managers.
    - No se permite crear una nueva Project Review si ya existe una `approved` para ese proyecto.
- Archivos y presign:
  - MinIO client (`services/minio.ts`): `ensureBucket`, `presignPutUrl`, `presignGetUrl`. Soporta `PUBLIC_S3_ENDPOINT` para firmar URLs públicas.
  - Subidas: frontend obtiene `key,url` vía `/uploads/presign` y hace `PUT` directo; luego consume la `key` en la app.
  - Descargas/preview: `/uploads/presign-get` devuelve URL temporal; `/uploads/stream` sirve como alternativa misma‑origen.
- Validación y errores:
  - Zod en endpoints de entrada (`validators.ts`).
  - Manejo de errores consistente con `status` y mensaje legible. Rate‑limit 300 req/min.
  - CORS con lista de orígenes (`FRONTEND_URL`). `TRUST_PROXY` configurable para cabeceras `X‑Forwarded-*`.
- Otras utilidades:
  - `services/pdf.ts` genera certificados PDF y los guarda en S3 (`certificateKey`).
  - `services/mailer.ts` envíos SMTP (verificación de email, notificaciones).

### Frontend
- Stack: React + Vite + MUI. Estado global con Zustand (`store/auth.js`). Axios centralizado con interceptor de auth/refresh (`utils/api.js`).
- Routing (`src/main.jsx`):
  - Rutas públicas: `/`, `/login`, `/register`, `/pending`, `/slides-viewer`.
  - Worker: `/wizard` (asistente de inducción: datos personales, captura de cámara/firma, slides, quiz, submit).
  - Manager/Admin: `/review` (Project Reviews, Worker Submissions, All Submissions, My Team).
  - Admin: `/admin` con secciones Dashboard, Projects, Reviews, Users, Settings.
- Acceso por rol: `AdminGuard` protege `/admin`. Nav oculta/expone enlaces según `user.role`.
- Branding: hook `useBrandConfig` aplica colores y logo al tema MUI.
- Flujos clave:
  - Creación de proyecto (Admin) y asignación de manager/worker.
  - Envío de Project Review (Admin) y aprobación/declinación (Manager/Admin).
  - Subida de materiales y generación de presign en UI (`utils/upload.js`).
  - Induction Wizard (Worker): completa datos, visualiza slides, realiza quiz y envía Submission.
  - Revisión (Manager): lista submissions de sus proyectos, ve el detalle enriquecido, aprueba o declina.

### Seguridad y arquitectura
- Monolito modular: API Express con rutas separadas y modelos Mongoose; frontend SPA React.
- Puntos sensibles:
  - Tokens en `localStorage` (XSS los expone). Refresh token también en cliente.
  - Endpoints de carga/descarga dependen de presign; clave de objeto se confía desde el cliente (mitigado por expiración y auth requerida para presign).
  - Validación de contenido de archivos no implementada (antivirus/MIME real).
- Controles actuales:
  - RBAC en middleware y reglas de negocio. Filtros por proyecto para managers.
  - Rate‑limit y CORS restringidos.
  - Bucket auto‑creado y presign con expiración corta.

## Recomendaciones
- Seguridad
  - Mover Access/Refresh a cookies `HttpOnly` + CSRF token; o almacenar sólo refresh en cookie y usar rotación/blacklist de refresh.
  - Validar tamaño/MIME real de archivos en S3 (por ejemplo, encabezados `Content‑Type` y `Content‑MD5`), y/o antivirus (ClamAV/Lambda).
  - Namespace por proyecto/tenant en claves S3 (`projects/{id}/...`).
  - Políticas más estrictas: impedir múltiples `approved` por proyecto (ya implementado a nivel de endpoint) y añadir índice único condicional si aplica.
- Código/estructura
  - Separar capas: `controllers/`, `services/`, `repositories/` para aislar negocio de Express.
  - Centralizar manejo de errores/respuestas (middleware `errorHandler`).
  - Añadir tests de integración con supertest y una base Mongo en memoria.
- Escalabilidad
  - Extraer envío de emails y generación de PDFs a workers/colas (BullMQ + Redis).
  - Añadir paginación a listados (`/users`, `/submissions`, `/reviews`).
  - Cache de configuración de marca y proyecto.
- Observabilidad
  - Logs estructurados (pino), trazas (OpenTelemetry) y métricas (Prometheus).
- Multi‑tenancy (futuro)
  - Campo `tenantId` en todos los modelos + índices compuestos `{ tenantId, ... }`.
  - Aislar S3 por tenant (`bucket/tenantId/...`) y CORS por subdominio.
  - Panel de superadmin para gestionar tenants.

## Creación automática de contraseñas

Cuando un administrador crea un usuario desde `/admin/users` y no proporciona el campo `password`, el backend genera automáticamente una contraseña temporal alfanumérica de 8 caracteres. Esta contraseña se encripta con `bcrypt` y se almacena en el campo `password` del documento (que contiene el hash). La creación del usuario continúa normalmente y la respuesta incluye un mensaje informativo.

Detalles:
- Si `password` no está presente en la petición, se genera internamente antes de validar los datos.
- La validación (`zod`) sigue exigiendo que exista una contraseña válida (la generada cumple la longitud mínima).
- Para consultas/listados, el backend excluye el campo `password` para no exponer el hash.
- En caso de error inesperado, el servidor responde con JSON legible y no se cae.

Ejemplo de respuesta al crear un usuario sin `password`:
```
HTTP/1.1 201 Created
{
  "id": "<mongo_id>",
  "email": "nuevo@indux.local",
  "name": "Nuevo Usuario",
  "role": "worker",
  "disabled": false,
  "info": "El campo password era requerido y se generó automáticamente."
}
```

Recomendaciones futuras:
- Enviar la contraseña temporal por correo al usuario (usando `api/src/services/mailer.ts`) o forzar un flujo de “establecer contraseña” mediante enlace de un solo uso.
- Registrar en auditoría que se generó una contraseña automática para trazabilidad.
- Permitir a los administradores copiar/mostrar la contraseña generada una sola vez en el panel, con advertencia de seguridad.

---

## Gestión de usuarios (Admin)

- Toggle Activar/Desactivar: desde el panel, el botón cambia el estado `disabled` del usuario mediante `PUT /users/:id { disabled: true|false }`.
- Eliminar (Delete): el botón realiza un borrado real (`DELETE /users/:id`).
- Seguridad: las respuestas de `GET/PUT` excluyen el campo `password` para evitar exponer hashes.

---

## Manager Team View

Managers can now view their assigned team under the "My Team" tab in the Review panel. The API endpoint `GET /assignments/manager/:id/team` returns all workers linked to the manager’s projects, including their name, email, and project references.

> The team list is now loaded lazily when the manager opens the "My Team" tab, improving performance.

---

## Project Assignments (User ↔ Project)

Conecta usuarios con proyectos mediante una relación controlada.

- Admins y managers pueden asignar usuarios (workers o managers) a proyectos.
- Workers solo pueden ver y participar en sus proyectos asignados.
- Managers solo pueden ver los proyectos y equipos bajo su responsabilidad.

### Modelo

`Assignment`:
- `user`: ObjectId, ref `User`, required
- `project`: ObjectId, ref `Project`, required
- `role`: enum `['manager','worker']`
- `assignedBy`: ObjectId, ref `User`
- `timestamps`: `true`
- Índice único `{ user, project }`

### Endpoints

- `POST /assignments` (admin, manager)
  - Body: `{ user, project, role: 'manager'|'worker' }`
  - Managers solo pueden asignar dentro de proyectos donde son `manager`.

- `GET /assignments/user/:id` (admin, manager, worker)
  - Lista los proyectos asignados a un usuario.
  - Admin: completo. Manager: solo en proyectos que gestiona. Worker: solo si solicita su propio ID.

- `GET /assignments/project/:id` (admin, manager)
  - Lista los usuarios asignados al proyecto.
  - Manager debe estar asignado como `manager` al proyecto.

- `DELETE /assignments/:id` (admin, manager)
  - Elimina la asignación. Manager solo dentro de proyectos que gestiona.

### `GET /projects` (filtrado por rol)

- Ahora requiere autenticación.
- Admin: devuelve todos los proyectos.
- Manager/Worker: devuelve solo proyectos asignados (existe un `Assignment` para el usuario).

### UI (Admin → Projects → “Assigned Users”)

- Nueva pestaña “Assigned Users” al editar un proyecto.
- Lista de asignaciones con nombre y rol.
- Botón “Assign User” abre modal con selector de usuario y rol.
- Cada fila incluye “Remove” para quitar la asignación.
test
