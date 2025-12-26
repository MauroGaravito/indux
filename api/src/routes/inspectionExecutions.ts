import { Router } from 'express';
import { Types } from 'mongoose';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Assignment } from '../models/Assignment.js';
import { ProjectInspection } from '../models/ProjectInspection.js';
import { InspectionTemplate } from '../models/InspectionTemplate.js';
import { InspectionExecution } from '../models/InspectionExecution.js';

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
  '/project-inspections/:projectInspectionId/executions',
  requireAuth,
  requireRole('admin', 'manager', 'worker'),
  async (req, res) => {
    const { projectInspectionId } = req.params;
    if (!Types.ObjectId.isValid(projectInspectionId)) {
      return res.status(400).json({ error: 'Invalid project inspection id' });
    }

    const projectInspection = await ProjectInspection.findById(projectInspectionId).lean();
    if (!projectInspection) {
      return res.status(404).json({ error: 'Project inspection not found' });
    }

    const access = await hasProjectAccess(
      req.user?.role,
      req.user?.sub,
      projectInspection.projectId.toString()
    );
    if (!access) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const template = await InspectionTemplate.findById(projectInspection.templateId).lean();
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const snapshot = JSON.parse(JSON.stringify(template));

    const execution = await InspectionExecution.create({
      projectInspectionId,
      projectId: projectInspection.projectId,
      templateSnapshot: snapshot,
      executedBy: req.user?.sub as any,
      status: 'draft',
    });

    res.status(201).json(execution);
  }
);

router.get('/inspection-executions/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid execution id' });
  }
  const execution = await InspectionExecution.findById(id).lean();
  if (!execution) {
    return res.status(404).json({ error: 'Execution not found' });
  }
  const access = await hasProjectAccess(
    req.user?.role,
    req.user?.sub,
    execution.projectId.toString()
  );
  if (!access) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(execution);
});

export default router;
