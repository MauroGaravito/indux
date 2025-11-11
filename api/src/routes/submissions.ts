import { Router } from 'express';
import { Submission } from '../models/Submission.js';
import { Assignment } from '../models/Assignment.js';
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
  try {
    // Tolerate "uploads" arriving as JSON string and parse it
    if (typeof req.body?.uploads === 'string') {
      try { req.body.uploads = JSON.parse(req.body.uploads); } catch {}
    }
    const parsed = SubmissionCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const userId = req.user!.sub;
    const body = parsed.data;
    // Ensure the worker is assigned to the project
    const assigned = await Assignment.findOne({ user: userId, project: body.projectId }).lean();
    if (!assigned) return res.status(403).json({ error: 'Not assigned to this project' });
    const sub = await Submission.create({ ...body, userId, status: 'pending' });
    res.status(201).json(sub);
  } catch (e: any) {
    const msg = (e && e.message) || 'Submission failed';
    res.status(400).json({ error: msg });
  }
});

// Manager list pending submissions
router.get('/', requireAuth, requireRole('manager', 'admin'), async (req, res) => {
  const raw = (req.query?.status as string | undefined) || 'pending'
  const status = ['pending','approved','declined','all'].includes(raw) ? raw : 'pending'
  const filter = status === 'all' ? {} : { status }
  const list = await Submission
    .find(filter)
    .populate('userId', 'name email')
    .populate('projectId', 'name')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 })
  res.json(list)
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

// Admin-only: delete a submission by ID
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const existing = await Submission.findById(id);
  if (!existing) return res.status(404).json({ error: 'Submission not found' });
  await Submission.findByIdAndDelete(id);
  return res.json({ ok: true, message: 'Submission deleted successfully' });
});

export default router;
