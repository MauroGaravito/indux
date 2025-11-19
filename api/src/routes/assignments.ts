import { Router } from 'express';
import { Types } from 'mongoose';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Assignment } from '../models/Assignment.js';

const router = Router();

// Helper: check if a manager is assigned as manager to a given project
async function isManagerOfProject(managerId: string, projectId: string) {
  if (!Types.ObjectId.isValid(managerId) || !Types.ObjectId.isValid(projectId)) return false;
  const found = await Assignment.findOne({ user: managerId, project: projectId, role: 'manager' }).lean();
  return !!found;
}

// POST /assignments → create assignment (admin or manager)
router.post('/', requireAuth, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { user, project, role } = req.body || {};
    if (!Types.ObjectId.isValid(user) || !Types.ObjectId.isValid(project)) {
      return res.status(400).json({ error: 'Invalid user or project id' });
    }
    if (!['manager', 'worker'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (req.user!.role === 'manager') {
      const allowed = await isManagerOfProject(req.user!.sub, project);
      if (!allowed) return res.status(403).json({ error: 'Forbidden' });
    }

    const doc = await Assignment.create({ user, project, role, assignedBy: req.user!.sub });
    const populated = await doc.populate([{ path: 'user', select: '-password' }, { path: 'project' }]);
    return res.status(201).json(populated);
  } catch (e: any) {
    if (e?.code === 11000) return res.status(409).json({ error: 'User already assigned to this project' });
    return res.status(500).json({ error: e?.message || 'Failed to create assignment' });
  }
});

// GET /assignments/user/:id → list user’s projects (filtered by caller perms)
router.get('/user/:id', requireAuth, requireRole('admin', 'manager', 'worker'), async (req, res) => {
  const targetUserId = req.params.id;
  if (!Types.ObjectId.isValid(targetUserId)) return res.status(400).json({ error: 'Invalid user id' });

  try {
    if (req.user!.role === 'admin' || req.user!.sub === targetUserId) {
      const list = await Assignment.find({ user: targetUserId })
        .populate([
          { path: 'project' },
          { path: 'user', select: '-password' },
        ])
        .lean();
      return res.json(list);
    }

    // Manager: only assignments in projects they manage
    if (req.user!.role === 'manager') {
      const managed = await Assignment.find({ user: req.user!.sub, role: 'manager' }).lean();
      const managedProjectIds = managed.map(a => a.project.toString());
      const list = await Assignment.find({ user: targetUserId, project: { $in: managedProjectIds } })
        .populate([
          { path: 'project' },
          { path: 'user', select: '-password' },
        ])
        .lean();
      return res.json(list);
    }

    return res.status(403).json({ error: 'Forbidden' });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Failed to list assignments' });
  }
});

// GET /assignments/project/:id → list project’s users
router.get('/project/:id', requireAuth, requireRole('admin', 'manager'), async (req, res) => {
  const projectId = req.params.id;
  if (!Types.ObjectId.isValid(projectId)) return res.status(400).json({ error: 'Invalid project id' });
  try {
    if (req.user!.role === 'manager') {
      const allowed = await isManagerOfProject(req.user!.sub, projectId);
      if (!allowed) return res.status(403).json({ error: 'Forbidden' });
    }
    const list = await Assignment.find({ project: projectId })
      .populate([{ path: 'user', select: '-password' }, { path: 'project' }])
      .lean();
    return res.json(list);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Failed to list assignments' });
  }
});

// DELETE /assignments/:id → delete assignment
router.delete('/:id', requireAuth, requireRole('admin', 'manager'), async (req, res) => {
  const id = req.params.id;
  if (!Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid assignment id' });
  try {
    const doc = await Assignment.findById(id).lean();
    if (!doc) return res.status(404).json({ error: 'Not found' });

    if (req.user!.role === 'manager') {
      const allowed = await isManagerOfProject(req.user!.sub, doc.project.toString());
      if (!allowed) return res.status(403).json({ error: 'Forbidden' });
    }
    await Assignment.findByIdAndDelete(id);
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Failed to delete assignment' });
  }
});

export default router;

// --- Manager Team View ---
// GET /assignments/manager/:id/team
// Returns workers assigned to any project managed by :id
router.get('/manager/:id/team', requireAuth, requireRole('admin', 'manager'), async (req, res) => {
  const managerId = req.params.id;
  try {
    if (!Types.ObjectId.isValid(managerId)) return res.status(400).json({ error: 'Invalid manager id' });
    // Only the manager themself or an admin can view
    if (!(req.user!.role === 'admin' || req.user!.sub === managerId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Find projects where this user is manager
    const managed = await Assignment.find({ user: managerId, role: 'manager' }).lean();
    if (!managed.length) return res.status(404).json({ error: 'No managed projects found' });
    const projectIds = managed.map(a => a.project);

    // Find workers assigned to those projects
    const workers = await Assignment.find({ project: { $in: projectIds }, role: 'worker' })
      .populate([{ path: 'user', select: 'name email' }, { path: 'project', select: 'name' }])
      .lean();

    const out = workers.map(w => ({
      userId: String((w as any).user?._id || w.user),
      name: String((w as any).user?.name || ''),
      email: String((w as any).user?.email || ''),
      projectName: String((w as any).project?.name || ''),
      projectId: String((w as any).project?._id || w.project),
    }));
    return res.json(out);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Failed to fetch team' });
  }
});
