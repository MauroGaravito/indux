# Indux – HammerTech-style Induction Tool (Mono-Repo)

Indux is a single-tenant construction safety induction tool. It provides an admin console, a manager review queue, and a worker induction wizard. This repository includes a TypeScript Node/Express API and a Vite + React frontend, with local development powered by Docker Compose. The same compose file runs on Dokploy without modification.

## Services
- API: Node + Express + TypeScript, MongoDB (Mongoose), JWT auth, MinIO uploads, Nodemailer emails, PDF certificates.
- Frontend: Vite + React + MUI, React Router, Zustand, React Hook Form + Zod, Axios.
- MongoDB: Primary data store.
- MinIO: S3-compatible object storage for uploads and certificates.

## Local Setup

1) Install dependencies (optional locally if you want to run outside Docker)

```
cd api && npm install && cd ../frontend && npm install
```

2) Configure environment

```
cp .env.example .env
```

3) Run with Docker Compose

```
docker compose up -d --build
```

Open:
- Backend: http://localhost:8080
- Frontend: http://localhost:5173
- MinIO: http://localhost:9001 (console)
- Mongo: mongodb://localhost:27017

## Seed Data

The API seeds a demo admin, manager, and worker, one project, and five sample questions on startup if `SEED=true`.

- Admin: admin@indux.local / admin123
- Manager: manager@indux.local / manager123
- Worker: worker@indux.local / worker123

## Environment

See `.env.example` for all variables and sane defaults for local/dev.

## Deploy on Dokploy

- Use the same `docker-compose.yml`.
- Configure environment variables in Dokploy.
- Attach volumes for Mongo and MinIO.

