import { Router } from 'express';
import { requireAuth, AuthPayload } from '../middleware/auth.js';
import { presignPutUrl, presignGetUrl, ensureBucket } from '../services/minio.js';
import { verifyUploadAccessToken, signUploadAccessToken } from '../services/tokens.js';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { Submission } from '../models/Submission.js';
import { InductionModule } from '../models/InductionModule.js';
import { Assignment } from '../models/Assignment.js';

const router = Router();

interface OwnershipInfo {
  projectId?: string;
  submissionUserId?: string;
}

function getContentType(nameOrKey: string) {
  const ext = (nameOrKey.split('.').pop() || '').toLowerCase();
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'ppt') return 'application/vnd.ms-powerpoint';
  if (ext === 'pptx') return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  if (ext === 'doc') return 'application/msword';
  if (ext === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (ext === 'xls') return 'application/vnd.ms-excel';
  if (ext === 'xlsx') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  return 'application/octet-stream';
}

function sanitizeFilename(filename?: string) {
  if (!filename) return '';
  return filename.replace(/[^\w.\- ]+/g, '_').trim();
}

async function resolveFileOwnership(key: string): Promise<OwnershipInfo | null> {
  const submission = await Submission.findOne({
    $or: [{ certificateKey: key }, { 'uploads.key': key }],
  })
    .select('projectId userId')
    .lean();

  if (submission) {
    return {
      projectId: submission.projectId ? String(submission.projectId) : undefined,
      submissionUserId: submission.userId ? String(submission.userId) : undefined,
    };
  }

  const moduleOwner = await InductionModule.findOne({
    $or: [
      { 'config.slides.fileKey': key },
      { 'config.slides.thumbKey': key },
      { 'config.projectMapKey': key },
    ],
  })
    .select('projectId')
    .lean();

  if (moduleOwner) {
    return {
      projectId: moduleOwner.projectId ? String(moduleOwner.projectId) : undefined,
    };
  }

  return null;
}

async function canDownloadKey(user: AuthPayload, key: string): Promise<boolean> {
  if (user.role === 'admin') return true;

  const ownership = await resolveFileOwnership(key);
  if (!ownership) return false;

  if (user.role === 'worker' && ownership.submissionUserId && ownership.submissionUserId === user.sub) {
    return true;
  }

  if (!ownership.projectId) return false;

  if (user.role === 'manager') {
    const assignment = await Assignment.findOne({
      user: user.sub,
      project: ownership.projectId,
      role: 'manager',
    }).lean();
    return Boolean(assignment);
  }

  if (user.role === 'worker') {
    const assignment = await Assignment.findOne({
      user: user.sub,
      project: ownership.projectId,
      role: 'worker',
    }).lean();
    return Boolean(assignment);
  }

  return false;
}

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
  const allowed = await canDownloadKey(req.user!, key);
  if (!allowed) return res.status(403).json({ error: 'Forbidden', code: 403 });
  try {
    const url = await presignGetUrl(key);
    res.json({ url });
  } catch (e) {
    res.status(400).json({ error: 'Could not presign get URL' });
  }
});

router.post('/view-url', requireAuth, async (req, res) => {
  const schema = z.object({
    key: z.string().min(1),
    filename: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { key, filename } = parsed.data;
  const allowed = await canDownloadKey(req.user!, key);
  if (!allowed) return res.status(403).json({ error: 'Forbidden', code: 403 });

  const token = signUploadAccessToken({ key, filename: sanitizeFilename(filename) || undefined });
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.json({ url: `${baseUrl}/uploads/public/${encodeURIComponent(token)}` });
});

// Stream object via API (same-origin fallback to avoid PUBLIC_S3_ENDPOINT/CORS issues)
router.get('/stream', requireAuth, async (req, res) => {
  const key = String((req.query as any)?.key || '');
  if (!key) return res.status(400).json({ error: 'Missing key' });
  const allowed = await canDownloadKey(req.user!, key);
  if (!allowed) return res.status(403).json({ error: 'Forbidden', code: 403 });
  try {
    res.setHeader('Content-Type', getContentType(key));
    res.setHeader('Content-Disposition', 'inline');
    await ensureBucket();
    const { minio, bucket } = await import('../services/minio.js');
    const obj = await minio.getObject(bucket, key);
    obj.on('error', () => { try { res.status(404).end('Not found') } catch {} });
    obj.pipe(res);
  } catch {
    res.status(400).json({ error: 'Stream failed' });
  }
});

router.get('/public/:token', async (req, res) => {
  const token = String(req.params.token || '');
  if (!token) return res.status(400).json({ error: 'Missing token' });

  try {
    const payload = verifyUploadAccessToken(token);
    const key = payload.key;
    const filename = sanitizeFilename(payload.filename);

    await ensureBucket();
    res.setHeader('Content-Type', getContentType(filename || key));
    res.setHeader(
      'Content-Disposition',
      filename ? `inline; filename="${filename}"` : 'inline'
    );
    res.setHeader('Cache-Control', 'private, max-age=600');

    const { minio, bucket } = await import('../services/minio.js');
    const obj = await minio.getObject(bucket, key);
    obj.on('error', () => { try { res.status(404).end('Not found') } catch {} });
    obj.pipe(res);
  } catch {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
});
