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
import { seedAll } from './seed.js';

const app = express();

const PORT = Number(process.env.PORT || 8080);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 60_000, max: 300 });
app.use(limiter);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'indux-api' });
});

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/submissions', submissionRoutes);
app.use('/uploads', uploadRoutes);
app.use('/reviews', reviewRoutes);

async function start() {
  await connectDB();
  if ((process.env.SEED || '').toLowerCase() === 'true') {
    await seedAll();
  }
  app.listen(PORT, () => {
    console.log(`API listening on :${PORT}`);
  });
}

start().catch((err) => {
  console.error('Fatal start error', err);
  process.exit(1);
});
