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

    const inspection = await ProjectInspection.create({
      projectId,
      templateId,
      type: typeof type === 'string' && ['daily', 'weekly', 'adhoc'].includes(type) ? type : 'daily',
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
  const inspections = await ProjectInspection.find({ projectId }).sort({ createdAt: -1 }).lean();
  res.json({ inspections });
});

export default router;
