import { Router } from 'express';
import { Types } from 'mongoose';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ProjectInspection } from '../models/ProjectInspection.js';
import { InspectionTemplate } from '../models/InspectionTemplate.js';
import { Assignment } from '../models/Assignment.js';

const router = Router();

async function hasProjectAccess(
  userRole: string | undefined,
  userId: string | undefined,
  projectId: string,
  requiredRole?: 'manager' | 'worker'
) {
  if (userRole === 'admin') return true;
  if (!userId) return false;
  const role =
    requiredRole ||
    (userRole === 'manager' ? 'manager' : userRole === 'worker' ? 'worker' : null);
  if (!role) return false;
  const assignment = await Assignment.findOne({ user: userId, project: projectId, role });
  return !!assignment;
}

router.post(
  '/projects/:projectId/inspections',
  requireAuth,
  requireRole('admin', 'manager'),
  async (req, res) => {
    const { projectId } = req.params;
    if (!Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: 'Invalid project id' });
    }
    if (
      req.user?.role === 'manager' &&
      !(await hasProjectAccess(req.user?.role, req.user?.sub, projectId, 'manager'))
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { templateId, type } = req.body || {};
    if (!Types.ObjectId.isValid(templateId)) {
      return res.status(400).json({ error: 'Invalid template id' });
    }

    const template = await InspectionTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const normalizedType =
      typeof type === 'string' && ['daily', 'weekly', 'adhoc'].includes(type) ? type : 'daily';

    const existing = await ProjectInspection.findOne({
      projectId,
      templateId,
      type: normalizedType,
      active: true,
    });
    if (existing) {
      return res.status(400).json({
        error: 'This template and inspection type is already active for this project.',
      });
    }

    const inspection = await ProjectInspection.create({
      projectId,
      templateId,
      type: normalizedType,
      createdBy: req.user?.sub as any,
    });

    res.status(201).json(inspection);
  }
);

router.get('/projects/:projectId/inspections', requireAuth, async (req, res) => {
  const { projectId } = req.params;
  if (!Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ error: 'Invalid project id' });
  }
  const access = await hasProjectAccess(req.user?.role, req.user?.sub, projectId);
  if (!access) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const inspections = await ProjectInspection.find({ projectId, active: true })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ inspections });
});

router.patch(
  '/project-inspections/:id/deactivate',
  requireAuth,
  requireRole('admin', 'manager'),
  async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid project inspection id' });
    }
    const inspection = await ProjectInspection.findById(id);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    if (
      req.user?.role === 'manager' &&
      !(await hasProjectAccess(
        req.user?.role,
        req.user?.sub,
        inspection.projectId.toString(),
        'manager'
      ))
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (!inspection.active) {
      return res.status(400).json({ error: 'Inspection already inactive.' });
    }
    inspection.active = false;
    inspection.archivedAt = new Date();
    await inspection.save();
    res.json(inspection);
  }
);

export default router;
