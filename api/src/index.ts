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
import { seedAll } from './seed.js';

const app = express();

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

// --- Start Server ---
async function start() {
  try {
    await connectDB();

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
