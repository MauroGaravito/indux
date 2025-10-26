import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { presignPutUrl } from '../services/minio.js';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const router = Router();

router.post('/presign', requireAuth, async (req, res) => {
  const schema = z.object({ prefix: z.string().default('uploads/') });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const key = `${parsed.data.prefix}${uuidv4()}`;
  const url = await presignPutUrl(key);
  res.json({ key, url });
});

export default router;
