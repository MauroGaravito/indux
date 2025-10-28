import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { presignPutUrl, presignGetUrl, ensureBucket } from '../services/minio.js';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const router = Router();

router.post('/presign', requireAuth, async (req, res) => {
  const schema = z.object({ prefix: z.string().default('uploads/') });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  // Normalize prefix: remove leading slashes and ensure trailing slash
  const raw = parsed.data.prefix || 'uploads/';
  const normalizedPrefix = (raw.replace(/^\/+/, '') || 'uploads/').replace(/([^/])$/, '$1/');

  // Ensure bucket exists before signing; prevents 404 NoSuchBucket on PUT
  await ensureBucket();
  const key = `${normalizedPrefix}${uuidv4()}`; // keys never start with '/'
  const url = await presignPutUrl(key);
  res.json({ key, url });
});

export default router;
// Presign GET for existing object keys
router.post('/presign-get', requireAuth, async (req, res) => {
  const schema = z.object({ key: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { key } = parsed.data;
  try {
    const url = await presignGetUrl(key);
    res.json({ url });
  } catch (e) {
    res.status(400).json({ error: 'Could not presign get URL' });
  }
});
