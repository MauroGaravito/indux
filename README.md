# Indux - Induction Tool (Monorepo)

Indux es una herramienta de induccion de seguridad para construccion (single-tenant).
Incluye:
- API Node/Express en TypeScript
- Frontend React + Vite
- MongoDB y almacenamiento S3-compatible (MinIO)
- Orquestado con Docker Compose; el mismo `docker-compose.yml` sirve para produccion con Caddy/Dokploy.

---

## Produccion

- App: https://indux.downundersolutions.com/
- API (via Caddy): https://indux-api.downundersolutions.com/

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

# Seed inicial
SEED=true
```

Notas:
- `PUBLIC_S3_ENDPOINT` ahora es soportado por `api/src/services/minio.ts` y se usa para firmar URLs presignadas accesibles desde el navegador. Si no lo defines, se firma contra el endpoint interno y los uploads pueden fallar desde el browser.
- `VITE_API_URL` lo consume el frontend en build/preview/dev (ver `frontend/src/utils/api.js`).

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

## Usuarios de demo (seed)

- Admin: `admin@indux.local` / `admin123`
- Manager: `manager@indux.local` / `manager123`
- Worker: `worker@indux.local` / `worker123`

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
- `GET /submissions` (manager/admin)
- `POST /submissions/:id/approve|decline` (manager/admin)
- `POST /reviews/projects` (admin)
- `GET /reviews/projects` (manager/admin)
- `POST /reviews/projects/:id/approve|decline` (manager/admin)

---

## Subidas a MinIO (presign)

- El backend asegura el bucket y firma URLs con MinIO SDK. Las claves no empiezan con `/` y los prefijos terminan en `/`.
- Para que el navegador pueda usar la URL presignada:
  - Define `PUBLIC_S3_ENDPOINT` con el host publico que usara el cliente.
  - No fuerces `Content-Type` manualmente en el `PUT` del cliente.

Local:
- Usa `PUBLIC_S3_ENDPOINT=http://localhost:9000` (el compose publica 9000 y 9001 por defecto).

Produccion:
- Usa un dominio publico (p. ej. `https://s3.downundersolutions.com`) y configura Caddy para no strippear el prefijo del bucket.

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

## Troubleshooting

- CORS/Login:
  - `FRONTEND_URL` debe incluir el origen activo.
  - Rebuild del frontend si cambias `VITE_API_URL`.
  - Preflight: `curl -X OPTIONS http://localhost:8080/auth/login -H "Origin: http://localhost:5173" -i`.
- MinIO 403 (SignatureDoesNotMatch):
  - Revisa `PUBLIC_S3_ENDPOINT` y que Caddy preserve el path del bucket, sin strip.
  - Hora correcta en servidor y URL vigente (10 min por defecto).
- Rebuild limpio: `docker compose build --no-cache api frontend && docker compose up -d`.
edicion
