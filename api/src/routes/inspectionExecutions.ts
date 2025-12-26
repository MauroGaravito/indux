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

router.post(
  '/inspection-executions/:id/submit',
  requireAuth,
  requireRole('admin', 'manager', 'worker'),
  async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid execution id' });
    }

    const execution = await InspectionExecution.findById(id);
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    if (execution.status !== 'draft') {
      return res.status(400).json({ error: 'Execution already submitted' });
    }

    const access = await hasProjectAccess(
      req.user?.role,
      req.user?.sub,
      execution.projectId.toString()
    );
    if (!access) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (Array.isArray(req.body?.results)) {
      execution.results = req.body.results as any;
    }
    if (typeof req.body?.poiRef === 'string') {
      execution.poiRef = req.body.poiRef.trim();
    }
    if (typeof req.body?.signatureDataUrl === 'string') {
      execution.signatureDataUrl = req.body.signatureDataUrl.trim() || req.body.signatureDataUrl;
    }

    const template = execution.templateSnapshot || {};
    const templateItems = Array.isArray(template.items) ? template.items : [];
    if (!templateItems.length) {
      return res.status(400).json({ error: 'Template snapshot missing inspection items.' });
    }

    const results = Array.isArray(execution.results) ? execution.results : [];
    if (!results.length) {
      return res.status(400).json({ error: 'Inspection results are required before submitting.' });
    }

    const resultMap = new Map<string, any>();
    results.forEach((result: any) => {
      if (!result) return;
      const key = typeof result.itemKey === 'string' ? result.itemKey.trim() : '';
      if (key) {
        result.itemKey = key;
        resultMap.set(key, result);
      }
    });

    for (const item of templateItems) {
      const key = typeof item?.key === 'string' ? item.key : '';
      const label = item?.label || key || 'Inspection item';
      if (!key) {
        return res.status(400).json({ error: `Template item "${label}" is missing a key.` });
      }
      const result = resultMap.get(key);
      if (!result) {
        return res.status(400).json({ error: `Missing result for "${label}".` });
      }
      const statusRaw = typeof result.status === 'string' ? result.status.trim() : '';
      if (!statusRaw) {
        return res.status(400).json({ error: `Status is required for "${label}".` });
      }
      const status = statusRaw.toLowerCase();
      result.status = statusRaw;
      const normalizePhotos = () => {
        const photosInput = Array.isArray(result.photos) ? result.photos : [];
        const keys = photosInput
          .map((photo: any) => {
            if (typeof photo === 'string') return photo.trim();
            if (photo && typeof photo.key === 'string') return photo.key.trim();
            return '';
          })
          .filter((v: string) => !!v);
        result.photos = keys.map((keyVal: string) => ({ key: keyVal }));
        return keys;
      };

      if (status === 'fail') {
        const photoKeys = normalizePhotos();
        const requirePhotos = item?.photoRequiredOnFail === true;
        const requireNotes = item?.notesRequiredOnFail === true;
        const requireRisk = item?.enableRiskLevel === true;
        if (requirePhotos && photoKeys.length === 0) {
          return res
            .status(400)
            .json({ error: `At least one photo is required for "${label}" when marked as Fail.` });
        }
        const notesText = typeof result.notes === 'string' ? result.notes.trim() : '';
        if (requireNotes && !notesText) {
          return res
            .status(400)
            .json({ error: `Notes are required for "${label}" when marked as Fail.` });
        }
        const corrective = typeof result.correctiveAction === 'string' ? result.correctiveAction.trim() : '';
        if (!corrective) {
          return res
            .status(400)
            .json({ error: `Corrective action is required for "${label}" when marked as Fail.` });
        }
        result.correctiveAction = corrective;
        const riskLevel = typeof result.riskLevel === 'string' ? result.riskLevel.trim() : '';
        if (requireRisk && !riskLevel) {
          return res
            .status(400)
            .json({ error: `Risk level is required for "${label}" when marked as Fail.` });
        }
        result.riskLevel = riskLevel || result.riskLevel;
        result.notes = notesText;
      } else {
        normalizePhotos();
      }
    }

    const requirePOI = template?.requirePOI === true;
    const requireSignature = template?.requireSignature === true;
    const poiValue = typeof execution.poiRef === 'string' ? execution.poiRef.trim() : '';
    if (poiValue) {
      execution.poiRef = poiValue;
    }
    if (requirePOI && !poiValue) {
      return res.status(400).json({ error: 'Point of interest is required for this inspection.' });
    }
    const signatureValue =
      typeof execution.signatureDataUrl === 'string' ? execution.signatureDataUrl.trim() : '';
    if (signatureValue) {
      execution.signatureDataUrl = signatureValue;
    }
    if (requireSignature && !signatureValue) {
      return res.status(400).json({ error: 'Signature is required for this inspection.' });
    }

    execution.status = 'submitted';
    execution.submittedAt = new Date();
    execution.markModified('results');
    await execution.save();

    res.json(execution);
  }
);

export default router;
