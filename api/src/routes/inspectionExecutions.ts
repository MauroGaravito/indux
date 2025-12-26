import { Router } from 'express';
import { Types } from 'mongoose';
import type { FilterQuery, PopulateOptions, SortOrder } from 'mongoose';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Assignment } from '../models/Assignment.js';
import { ProjectInspection } from '../models/ProjectInspection.js';
import { InspectionTemplate } from '../models/InspectionTemplate.js';
import { InspectionExecution } from '../models/InspectionExecution.js';
import type { IInspectionExecution } from '../models/InspectionExecution.js';

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

const RECORD_POPULATE: PopulateOptions[] = [
  { path: 'projectId', select: 'name' },
  { path: 'templateId', select: 'name' },
  { path: 'executedBy', select: 'name role' },
];

const RECORD_SORT: Record<string, SortOrder> = { submittedAt: -1, _id: -1 };

function getQueryValue(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    for (const entry of value) {
      if (typeof entry === 'string' && entry.trim()) return entry.trim();
    }
    return undefined;
  }
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function parseDateParam(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function applyDateRangeFilter(
  filter: FilterQuery<IInspectionExecution>,
  fromRaw?: string,
  toRaw?: string
): string | null {
  const range: Record<string, Date> = {};
  if (fromRaw) {
    const parsed = parseDateParam(fromRaw);
    if (!parsed) return 'Invalid dateFrom';
    range.$gte = parsed;
  }
  if (toRaw) {
    const parsed = parseDateParam(toRaw);
    if (!parsed) return 'Invalid dateTo';
    range.$lte = parsed;
  }
  if (Object.keys(range).length) {
    filter.submittedAt = range as any;
  }
  return null;
}

function toObjectIdString(value: any): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value instanceof Types.ObjectId) return value.toString();
  if (typeof value === 'object' && value !== null) {
    if (value._id instanceof Types.ObjectId) return value._id.toString();
    if (typeof value._id === 'string') return value._id;
  }
  return undefined;
}

function buildRecordPayload(execution: any) {
  const projectDoc: any = execution.projectId;
  const projectId =
    toObjectIdString(projectDoc) ||
    (typeof execution.projectId === 'string' ? execution.projectId : undefined);
  const projectName =
    typeof projectDoc?.name === 'string' && projectDoc.name.trim()
      ? projectDoc.name
      : 'Project';

  const templateDoc: any = execution.templateId;
  const templateId =
    toObjectIdString(templateDoc) ||
    (typeof execution.templateId === 'string' ? execution.templateId : undefined) ||
    (typeof execution.templateSnapshot?._id === 'string'
      ? execution.templateSnapshot._id
      : undefined);
  const templateName =
    typeof templateDoc?.name === 'string' && templateDoc.name.trim()
      ? templateDoc.name
      : typeof execution.templateSnapshot?.name === 'string' && execution.templateSnapshot.name.trim()
      ? execution.templateSnapshot.name
      : 'Inspection Template';

  const executedByDoc: any = execution.executedBy;
  const executedById =
    toObjectIdString(executedByDoc) ||
    (typeof execution.executedBy === 'string' ? execution.executedBy : undefined);
  const executedByName =
    typeof executedByDoc?.name === 'string' && executedByDoc.name.trim()
      ? executedByDoc.name
      : 'User';
  const executedRole =
    execution.executedByRole ||
    (executedByDoc?.role === 'manager' || executedByDoc?.role === 'worker'
      ? executedByDoc.role
      : undefined);

  return {
    id: execution._id.toString(),
    project: {
      id: projectId || null,
      name: projectName,
    },
    template: {
      id: templateId || null,
      name: templateName,
    },
    executedBy: {
      id: executedById || null,
      name: executedByName,
      role: executedRole || executedByDoc?.role || null,
    },
    submittedAt: execution.submittedAt || execution.updatedAt || execution.createdAt || null,
    status: execution.status,
  };
}

async function fetchInspectionRecords(filter: FilterQuery<IInspectionExecution>) {
  const docs = await InspectionExecution.find(filter)
    .sort(RECORD_SORT)
    .populate(RECORD_POPULATE)
    .lean();
  return docs.map(buildRecordPayload);
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
    const executingRole: 'manager' | 'worker' = req.user?.role === 'worker' ? 'worker' : 'manager';

    const execution = await InspectionExecution.create({
      projectInspectionId,
      projectId: projectInspection.projectId,
      templateId: projectInspection.templateId,
      templateSnapshot: snapshot,
      executedBy: req.user!.sub as any,
      executedByRole: executingRole,
      status: 'draft',
    });

    res.status(201).json(execution);
  }
);

router.get(
  '/inspection-records',
  requireAuth,
  requireRole('admin'),
  async (req, res) => {
    const filter: FilterQuery<IInspectionExecution> = { status: 'submitted' };
    const projectIdRaw = getQueryValue(req.query.projectId);
    if (projectIdRaw) {
      if (!Types.ObjectId.isValid(projectIdRaw)) {
        return res.status(400).json({ error: 'Invalid projectId' });
      }
      filter.projectId = new Types.ObjectId(projectIdRaw);
    }
    const userIdRaw = getQueryValue(req.query.userId);
    if (userIdRaw) {
      if (!Types.ObjectId.isValid(userIdRaw)) {
        return res.status(400).json({ error: 'Invalid userId' });
      }
      filter.executedBy = new Types.ObjectId(userIdRaw);
    }
    const templateIdRaw = getQueryValue(req.query.templateId);
    if (templateIdRaw) {
      if (!Types.ObjectId.isValid(templateIdRaw)) {
        return res.status(400).json({ error: 'Invalid templateId' });
      }
      filter.templateId = new Types.ObjectId(templateIdRaw);
    }
    const dateFromRaw = getQueryValue(req.query.dateFrom);
    const dateToRaw = getQueryValue(req.query.dateTo);
    const dateError = applyDateRangeFilter(filter, dateFromRaw, dateToRaw);
    if (dateError) {
      return res.status(400).json({ error: dateError });
    }

    const records = await fetchInspectionRecords(filter);
    res.json({ records });
  }
);

router.get(
  '/projects/:projectId/inspection-records',
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

    const filter: FilterQuery<IInspectionExecution> = {
      status: 'submitted',
      projectId: new Types.ObjectId(projectId),
    };

    const userIdRaw = getQueryValue(req.query.userId);
    if (userIdRaw) {
      if (!Types.ObjectId.isValid(userIdRaw)) {
        return res.status(400).json({ error: 'Invalid userId' });
      }
      filter.executedBy = new Types.ObjectId(userIdRaw);
    }
    const templateIdRaw = getQueryValue(req.query.templateId);
    if (templateIdRaw) {
      if (!Types.ObjectId.isValid(templateIdRaw)) {
        return res.status(400).json({ error: 'Invalid templateId' });
      }
      filter.templateId = new Types.ObjectId(templateIdRaw);
    }
    const dateFromRaw = getQueryValue(req.query.dateFrom);
    const dateToRaw = getQueryValue(req.query.dateTo);
    const dateError = applyDateRangeFilter(filter, dateFromRaw, dateToRaw);
    if (dateError) {
      return res.status(400).json({ error: dateError });
    }

    const records = await fetchInspectionRecords(filter);
    res.json({ records });
  }
);

router.get(
  '/my/inspection-records',
  requireAuth,
  requireRole('worker'),
  async (req, res) => {
    const filter: FilterQuery<IInspectionExecution> = {
      status: 'submitted',
      executedBy: new Types.ObjectId(req.user!.sub),
    };
    const projectIdRaw = getQueryValue(req.query.projectId);
    if (projectIdRaw) {
      if (!Types.ObjectId.isValid(projectIdRaw)) {
        return res.status(400).json({ error: 'Invalid projectId' });
      }
      filter.projectId = new Types.ObjectId(projectIdRaw);
    }
    const templateIdRaw = getQueryValue(req.query.templateId);
    if (templateIdRaw) {
      if (!Types.ObjectId.isValid(templateIdRaw)) {
        return res.status(400).json({ error: 'Invalid templateId' });
      }
      filter.templateId = new Types.ObjectId(templateIdRaw);
    }
    const dateFromRaw = getQueryValue(req.query.dateFrom);
    const dateToRaw = getQueryValue(req.query.dateTo);
    const dateError = applyDateRangeFilter(filter, dateFromRaw, dateToRaw);
    if (dateError) {
      return res.status(400).json({ error: dateError });
    }

    const records = await fetchInspectionRecords(filter);
    res.json({ records });
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

router.get(
  '/inspection-records/:id',
  requireAuth,
  requireRole('admin', 'manager', 'worker'),
  async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid inspection record id' });
    }
    const execution = await InspectionExecution.findById(id)
      .populate(RECORD_POPULATE)
      .lean();
    if (!execution || execution.status !== 'submitted') {
      return res.status(404).json({ error: 'Inspection record not found' });
    }
    const projectId = toObjectIdString(execution.projectId);
    if (!projectId) {
      return res.status(404).json({ error: 'Inspection record not found' });
    }
    const executedById = toObjectIdString(execution.executedBy);

    if (req.user?.role === 'manager') {
      const allowed = await hasProjectAccess(req.user.role, req.user.sub, projectId, 'manager');
      if (!allowed) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    } else if (req.user?.role === 'worker') {
      if (!executedById || executedById !== req.user.sub) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    const projectDoc: any = execution.projectId;
    const templateDoc: any = execution.templateId;
    const executedByDoc: any = execution.executedBy;
    const templateId =
      toObjectIdString(templateDoc) ||
      (typeof execution.templateId === 'string' ? execution.templateId : undefined) ||
      (typeof execution.templateSnapshot?._id === 'string'
        ? execution.templateSnapshot._id
        : undefined);
    const templateName =
      typeof templateDoc?.name === 'string' && templateDoc.name.trim()
        ? templateDoc.name
        : typeof execution.templateSnapshot?.name === 'string' && execution.templateSnapshot.name.trim()
        ? execution.templateSnapshot.name
        : 'Inspection Template';
    const executedByName =
      typeof executedByDoc?.name === 'string' && executedByDoc.name.trim()
        ? executedByDoc.name
        : 'User';
    const executedRole =
      execution.executedByRole ||
      (executedByDoc?.role === 'manager' || executedByDoc?.role === 'worker'
        ? executedByDoc.role
        : undefined);

    const projectInfo = {
      id: projectId,
      name:
        typeof projectDoc?.name === 'string' && projectDoc.name.trim()
          ? projectDoc.name
          : 'Project',
    };

    const templateInfo = {
      id: templateId || null,
      name: templateName,
    };

    const executedByInfo = {
      id: executedById || null,
      name: executedByName,
      role: executedRole || executedByDoc?.role || null,
    };

    res.json({
      id: execution._id.toString(),
      project: projectInfo,
      template: templateInfo,
      templateSnapshot: execution.templateSnapshot,
      results: Array.isArray(execution.results) ? execution.results : [],
      signatureDataUrl: execution.signatureDataUrl || null,
      poi: execution.poiRef || null,
      metadata: {
        status: execution.status,
        submittedAt: execution.submittedAt || null,
        executedAt: execution.executedAt || null,
        executedBy: executedByInfo,
        projectInspectionId: toObjectIdString(execution.projectInspectionId) || null,
        project: projectInfo,
        template: templateInfo,
      },
    });
  }
);

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
