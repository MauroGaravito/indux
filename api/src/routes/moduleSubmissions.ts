import { Router } from 'express';
import { Types } from 'mongoose';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { SubmissionCreateSchema } from '../utils/validators.js';
import { Submission } from '../models/Submission.js';
import { InductionModule } from '../models/InductionModule.js';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { ensureBucket } from '../services/minio.js';
import { generateCertificate } from '../services/pdf.js';
import { v4 as uuidv4 } from 'uuid';
import { Assignment } from '../models/Assignment.js';

const router = Router();

router.post('/modules/:moduleId/submissions', requireAuth, requireRole('worker'), async (req, res) => {
  const moduleId = req.params.moduleId;
  if (!Types.ObjectId.isValid(moduleId)) return res.status(400).json({ error: 'Invalid module id' });

  // Parse uploads JSON string if sent as multipart
  if (typeof req.body?.uploads === 'string') {
    try { req.body.uploads = JSON.parse(req.body.uploads); } catch {}
  }

  const parsed = SubmissionCreateSchema.safeParse({ ...req.body, moduleId });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const mod = await InductionModule.findById(moduleId);
  if (!mod) return res.status(404).json({ error: 'Module not found' });
  if (mod.reviewStatus !== 'approved') return res.status(400).json({ error: 'Module not approved' });
  const project = await Project.findById(mod.projectId);
  if (!project) return res.status(400).json({ error: 'Project not found' });

  // Ensure worker is assigned to the project
  const assigned = await Assignment.findOne({ user: req.user!.sub, project: project._id, role: 'worker' });
  if (!assigned) return res.status(403).json({ error: 'Not assigned to project' });

  const existing = await Submission.findOne({ moduleId, userId: req.user!.sub, status: { $in: ['pending', 'approved'] } });
  if (existing && existing.status === 'approved') {
    return res.status(409).json({ error: 'Submission already approved' });
  }
  if (existing && existing.status === 'pending') {
    await Submission.findByIdAndDelete(existing._id);
  }

  const payload = parsed.data;
  const sub = await Submission.create({
    moduleId,
    projectId: project._id,
    userId: req.user!.sub,
    status: 'pending',
    payload: payload.payload,
    uploads: payload.uploads,
    quiz: payload.quiz,
    signatureDataUrl: payload.signatureDataUrl,
  });

  res.status(201).json(sub);
});

router.get('/modules/:moduleId/submissions', requireAuth, requireRole('manager', 'admin'), async (req, res) => {
  const moduleId = req.params.moduleId;
  if (!Types.ObjectId.isValid(moduleId)) return res.status(400).json({ error: 'Invalid module id' });
  const statusRaw = (req.query?.status as string) || 'pending';
  const status = ['pending', 'approved', 'declined', 'all'].includes(statusRaw) ? statusRaw : 'pending';
  const filter = status === 'all' ? { moduleId } : { moduleId, status };
  const list = await Submission.find(filter)
    .populate('userId', 'name email')
    .populate('projectId', 'name')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });
  res.json(list);
});

router.post('/submissions/:id/approve', requireAuth, requireRole('manager', 'admin'), async (req, res) => {
  const sub = await Submission.findById(req.params.id);
  if (!sub) return res.status(404).json({ error: 'Not found' });
  const user = await User.findById(sub.userId);
  const project = await Project.findById(sub.projectId);
  const mod = await InductionModule.findById(sub.moduleId);
  if (!user || !project || !mod) return res.status(400).json({ error: 'Invalid submission context' });

  await ensureBucket();
  const certKey = `certs/${project._id}/${mod._id}/${uuidv4()}.pdf`;
  await generateCertificate(certKey, { workerName: user.name, projectName: project.name, moduleType: mod.type });

  sub.status = 'approved';
  sub.reviewedBy = req.user!.sub as any;
  sub.certificateKey = certKey;
  await sub.save();

  res.json({ ok: true });
});

router.post('/submissions/:id/decline', requireAuth, requireRole('manager', 'admin'), async (req, res) => {
  const sub = await Submission.findById(req.params.id);
  if (!sub) return res.status(404).json({ error: 'Not found' });
  sub.status = 'declined';
  sub.reviewReason = (req.body && req.body.reason) || 'Not specified';
  sub.reviewedBy = req.user!.sub as any;
  await sub.save();
  res.json({ ok: true });
});

export default router;
