import { Router } from 'express';
import { Submission } from '../models/Submission.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { SubmissionCreateSchema } from '../utils/validators.js';
import { v4 as uuidv4 } from 'uuid';
import { ensureBucket } from '../services/minio.js';
import { generateCertificate } from '../services/pdf.js';
import { sendMail } from '../services/mailer.js';

const router = Router();

// Worker creates a submission (requires worker login)
router.post('/', requireAuth, requireRole('worker'), async (req, res) => {
  const parsed = SubmissionCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const userId = req.user!.sub;
  const body = parsed.data;
  const sub = await Submission.create({ ...body, userId, status: 'pending' });
  res.status(201).json(sub);
});

// Manager list pending submissions
router.get('/', requireAuth, requireRole('manager', 'admin'), async (_req, res) => {
  const list = await Submission.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(100);
  res.json(list);
});

router.post('/:id/approve', requireAuth, requireRole('manager', 'admin'), async (req, res) => {
  const sub = await Submission.findById(req.params.id);
  if (!sub) return res.status(404).json({ error: 'Not found' });
  const user = await User.findById(sub.userId);
  const project = await Project.findById(sub.projectId);
  if (!user || !project) return res.status(400).json({ error: 'Invalid submission context' });

  await ensureBucket();
  const certKey = `certs/${uuidv4()}.pdf`;
  await generateCertificate(certKey, { workerName: user.name, projectName: project.name });

  sub.status = 'approved';
  sub.reviewedBy = req.user!.sub as any;
  sub.certificateKey = certKey;
  await sub.save();

  try {
    await sendMail({ to: user.email, subject: 'Induction Approved', text: `Your induction for ${project.name} is approved.` });
  } catch {}

  res.json({ ok: true });
});

router.post('/:id/decline', requireAuth, requireRole('manager', 'admin'), async (req, res) => {
  const sub = await Submission.findById(req.params.id);
  if (!sub) return res.status(404).json({ error: 'Not found' });
  sub.status = 'declined';
  sub.reviewReason = (req.body && req.body.reason) || 'Not specified';
  sub.reviewedBy = req.user!.sub as any;
  await sub.save();
  res.json({ ok: true });
});

export default router;

