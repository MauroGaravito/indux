import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import submissionRoutes from './routes/submissions.js';
import uploadRoutes from './routes/uploads.js';
import reviewRoutes from './routes/reviews.js';
import userRoutes from './routes/users.js';
import assignmentsRoutes from './routes/assignments.js';
import brandConfigRoutes from './routes/brandConfigRoutes.js';
import { seedAll } from './seed.js';
import { ensureBucket } from './services/minio.js';

const app = express();

// Trust reverse proxies when X-Forwarded-* is present
// Configure via TRUST_PROXY (true/false/number/IP). Defaults to 1 in non-dev.
(() => {
  const tp = process.env.TRUST_PROXY;
  if (tp != null && tp !== '') {
    let val: any = tp;
    if (tp === 'true') val = true;
    else if (tp === 'false') val = false;
    else if (!Number.isNaN(Number(tp))) val = Number(tp);
    app.set('trust proxy', val as any);
  } else if ((process.env.NODE_ENV || '').toLowerCase() !== 'development') {
    app.set('trust proxy', 1);
  }
})();

// --- Server port ---
const PORT = Number(process.env.PORT || 8080);

// --- Allowed Origins (CORS) ---
const rawOrigins = process.env.FRONTEND_URL;
const allowedOrigins = rawOrigins
  ? rawOrigins.split(',').map(s => s.trim())
  : ['https://indux.downundersolutions.com', 'http://localhost:5173'];

console.log('✅ Allowed CORS origins:', allowedOrigins);

const corsOptions: cors.CorsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    // Permitir peticiones internas o sin "origin" (por ejemplo, health checks)
    if (!origin) return callback(null, true);

    // Validar contra la lista permitida
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`❌ Blocked CORS origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
};

// --- Middlewares ---
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Rate limiter (300 req/min por IP) ---
const limiter = rateLimit({ windowMs: 60_000, max: 300 });
app.use(limiter);

// --- Health check ---
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'indux-api' });
});

// --- Routes ---
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/submissions', submissionRoutes);
app.use('/uploads', uploadRoutes);
app.use('/reviews', reviewRoutes);
app.use('/users', userRoutes);
app.use('/assignments', assignmentsRoutes);
app.use('/brand-config', brandConfigRoutes);

// --- Start Server ---
async function start() {
  try {
    await connectDB();

    // Ensure S3 bucket exists before serving requests that presign
    try {
      await ensureBucket();
    } catch (e) {
      console.warn('S3 bucket ensure failed (continuing):', (e as Error)?.message);
    }

    // Seed inicial (solo si SEED=true)
    if ((process.env.SEED || '').toLowerCase() === 'true') {
      await seedAll();
    }

    app.listen(PORT, () => {
      console.log(`🚀 API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Fatal start error:', err);
    process.exit(1);
  }
}

start();
