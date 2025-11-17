import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { presignPutUrl, presignGetUrl, ensureBucket } from '../services/minio.js';
import * as uploadsController from '../controllers/uploadsController.js';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { Project } from '../models/Project.js';
import { Assignment } from '../models/Assignment.js';

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

// Stream object via API (same-origin fallback to avoid PUBLIC_S3_ENDPOINT/CORS issues)
router.get('/stream', requireAuth, async (req, res) => {
  try {
    const key = String((req.query as any)?.key || '');
    if (!key) return res.status(400).json({ error: 'Missing key' });

    // Authorization: admin/manager always allowed; worker only if assigned to project owning the key
    const role = req.user!.role;
    if (role === 'worker' || role === 'manager') {
      const project = await Project.findOne({
        $or: [
          { 'config.projectMapKey': key },
          { 'config.slides.pptKey': key },
          { 'config.slides.thumbKey': key }
        ]
      }).select('_id').lean();
      if (!project) return res.status(404).json({ error: 'Asset not found' });
      if (role === 'worker') {
        const assignment = await Assignment.findOne({
          user: req.user!.sub,
          project: project._id,
          role: 'worker',
          $or: [{ endedAt: { $exists: false } }, { endedAt: null }]
        }).lean();
        if (!assignment) return res.status(403).json({ error: 'Forbidden' });
      }
    }
    // admins bypass checks
    const ext = (key.split('.').pop() || '').toLowerCase()
    const ct = ext === 'pdf'
      ? 'application/pdf'
      : ext === 'ppt'
        ? 'application/vnd.ms-powerpoint'
        : ext === 'pptx'
          ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
          : 'application/octet-stream'
    res.setHeader('Content-Type', ct)
    res.setHeader('Content-Disposition', 'inline')
    await ensureBucket()
    const { minio, bucket } = await import('../services/minio.js')
    const obj = await minio.getObject(bucket, key)
    obj.on('error', () => { try { res.status(404).end('Not found') } catch {} })
    obj.pipe(res)
  } catch {
    res.status(400).json({ error: 'Stream failed' })
  }
})

// Object metadata
router.get('/meta', requireAuth, uploadsController.getMeta);

export default router;
