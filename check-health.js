#!/usr/bin/env node
// Indux Health Check Script
// Verifies env, API availability, Mongo via API queries, MinIO via presigned upload, and seeded users.

const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const root = process.cwd();
  const envPath = path.join(root, '.env');
  const requiredEnv = [
    'PORT',
    'MONGO_URI',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'S3_ENDPOINT',
    'S3_BUCKET',
    'S3_ACCESS_KEY',
    'S3_SECRET_KEY',
    'FRONTEND_URL',
    'SEED',
  ];

  const summary = { api: false, mongo: false, minio: false, users: 0, endpoints: false, env: false };
  const advice = [];

  // 1) .env presence and keys
  let env = {};
  try {
    const text = fs.readFileSync(envPath, 'utf8');
    env = Object.fromEntries(
      text
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'))
        .map((l) => {
          const i = l.indexOf('=');
          return [l.slice(0, i), l.slice(i + 1)];
        }),
    );
    const missing = requiredEnv.filter((k) => !env[k] || env[k].length === 0);
    if (missing.length) {
      console.log(`❌ .env found but missing keys: ${missing.join(', ')}`);
      advice.push('Ensure .env exists and includes all required variables. You can copy from .env.example');
    } else {
      console.log('✅ .env present and contains required keys');
      summary.env = true;
    }
  } catch (e) {
    console.log('❌ .env file not found at project root');
    advice.push('Create .env by copying .env.example: cp .env.example .env');
  }

  const API = 'http://localhost:' + (env.PORT || '8080');

  // Helper fetch wrapper
  async function jfetch(url, opts = {}) {
    const res = await fetch(url, opts);
    const ct = res.headers.get('content-type') || '';
    const isJson = ct.includes('application/json');
    const body = isJson ? await res.json().catch(() => ({})) : await res.text();
    return { ok: res.ok, status: res.status, body };
  }

  // 2) API availability
  try {
    const r = await jfetch(`${API}/health`);
    if (r.ok && ((r.body && (r.body.ok === true || r.body.status === 'ok')))) {
      console.log('✅ API reachable');
      summary.api = true;
    } else {
      console.log(`❌ API health unexpected response (status ${r.status})`);
      advice.push('Check API container: docker compose ps and docker compose logs -f api');
    }
  } catch (e) {
    console.log('❌ API not reachable at ' + API);
    advice.push('Ensure API is running: docker compose up -d api');
  }

  // 3) Seeded users (login)
  let adminToken = null;
  let managerToken = null;
  let workerToken = null;
  async function login(email, password) {
    const r = await jfetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (r.ok && r.body && r.body.accessToken) return r.body;
    return null;
  }
  try {
    const admin = await login('admin@indux.local', 'admin123');
    const manager = await login('manager@indux.local', 'manager123');
    const worker = await login('worker@indux.local', 'worker123');
    summary.users = [admin, manager, worker].filter(Boolean).length;
    if (summary.users === 3) console.log('✅ Users seeded (3 found)');
    else {
      console.log(`⚠️ Users seeded (${summary.users}/3 logins ok)`);
      advice.push('If users aren’t seeded, set SEED=true and restart the API');
    }
    adminToken = admin?.accessToken || null;
    managerToken = manager?.accessToken || null;
    workerToken = worker?.accessToken || null;
  } catch (e) {
    console.log('⚠️ Unable to verify seeded users via login');
    advice.push('Check /auth/login endpoint and credentials');
  }

  // 4) Endpoints check (projects, reviews, submissions)
  try {
    const p = await jfetch(`${API}/projects`);
    const rv = await jfetch(`${API}/reviews/projects`, { headers: { Authorization: `Bearer ${adminToken || managerToken || ''}` } });
    const sb = await jfetch(`${API}/submissions`, { headers: { Authorization: `Bearer ${adminToken || managerToken || ''}` } });
    if (p.ok && Array.isArray(p.body) && rv.ok && Array.isArray(rv.body) && sb.ok && Array.isArray(sb.body)) {
      console.log('✅ Endpoints healthy');
      summary.endpoints = true;
      // If we can list projects via API, consider Mongo reachable through API.
      console.log('✅ MongoDB connected (validated via GET /projects)');
      summary.mongo = true;
    } else {
      console.log('❌ One or more endpoints returned unexpected shape');
      advice.push('Verify API routes and auth. Check docker compose logs for api');
    }
  } catch (e) {
    console.log('❌ Failed to query endpoints: ' + e.message);
    advice.push('Ensure API is running and reachable at ' + API);
  }

  // 5) MinIO access: presign + PUT upload test
  try {
    if (!adminToken && !managerToken && !workerToken) throw new Error('No token for presign');
    const token = adminToken || managerToken || workerToken;
    const pres = await jfetch(`${API}/uploads/presign`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ prefix: 'health/' }),
    });
    if (!pres.ok || !pres.body?.url) throw new Error('Presign failed');
    const put = await fetch(pres.body.url, { method: 'PUT', body: Buffer.from('indux-health-check') });
    if (put.ok) {
      console.log('✅ MinIO reachable (presigned upload succeeded)');
      summary.minio = true;
    } else {
      console.log(`❌ MinIO upload failed (HTTP ${put.status})`);
      advice.push('Verify S3 credentials and bucket. Check minio logs and S3_* env');
    }
  } catch (e) {
    console.log('❌ MinIO check failed: ' + e.message);
    advice.push('Ensure MinIO is running and S3 credentials are correct');
  }

  // Summary
  console.log('\n===== Indux Health Summary =====');
  console.log(summary.api ? '✅ API reachable' : '❌ API unreachable');
  console.log(summary.mongo ? '✅ MongoDB connected' : '❌ MongoDB not verified');
  console.log(summary.minio ? '✅ MinIO reachable' : '❌ MinIO unreachable');
  console.log(summary.users === 3 ? '✅ Users seeded (3 found)' : `⚠️ Users seeded (${summary.users}/3)`);
  console.log(summary.endpoints ? '✅ Endpoints healthy' : '❌ Endpoints failed');

  if (advice.length) {
    console.log('\nGuidance:');
    advice.forEach((a) => console.log('- ' + a));
  }
}

main().catch((e) => {
  console.error('Health check error:', e);
  process.exit(1);
});

