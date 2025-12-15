import { Router } from 'express';
import { Document, Types } from 'mongoose';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Project } from '../models/Project.js';
import { InductionModule } from '../models/InductionModule.js';
import { InductionModuleField } from '../models/InductionModuleField.js';
import { Assignment, IAssignment } from '../models/Assignment.js';
import { InductionTemplate } from '../models/InductionTemplate.js';
import { ModuleReview } from '../models/ModuleReview.js';
import { Submission } from '../models/Submission.js';
import {
  InductionModuleCreateSchema,
  InductionModuleUpdateDraftSchema,
} from '../utils/validators.js';

const router = Router();

/* -------------------------------------------------------------------------- */
/*                               DEFAULT FIELDS                               */
/* -------------------------------------------------------------------------- */

const DEFAULT_USER_FIELDS = [
  { key: 'fullName', label: 'Full Name', type: 'text', required: true },
  { key: 'email', label: 'Email', type: 'text', required: true },
  { key: 'phone', label: 'Phone', type: 'text', required: false },
  { key: 'position', label: 'Position', type: 'text', required: false },
  { key: 'companyName', label: 'Company Name', type: 'text', required: false },
  {
    key: 'medicalCondition',
    label: 'Medical Condition',
    type: 'select',
    required: true,
    options: ['Yes', 'No'],
  },
  {
    key: 'medicalConditionDetails',
    label: 'Medical Condition Details',
    type: 'textarea',
    required: false,
    visibleIf: { fieldKey: 'medicalCondition', equals: 'Yes' },
  },
];

/* -------------------------------------------------------------------------- */
/*                               HELPER METHODS                                */
/* -------------------------------------------------------------------------- */

const DEFAULT_MODULE_CONFIG = {
  steps: [],
  slides: [],
  quiz: { questions: [] },
  settings: { passMark: 80, randomizeQuestions: false, allowRetry: true },
};

const cloneConfig = (cfg?: any, fallback?: any) =>
  JSON.parse(JSON.stringify(cfg ?? fallback ?? DEFAULT_MODULE_CONFIG));

async function seedModuleFields(moduleId: Types.ObjectId, sourceFields?: any[]) {
  const fieldsSource =
    Array.isArray(sourceFields) && sourceFields.length
      ? sourceFields
      : DEFAULT_USER_FIELDS;

  const docs = fieldsSource.map((field: any, idx: number) => ({
    key: field.key ?? `field${idx + 1}`,
    label: field.label ?? `Field ${idx + 1}`,
    type: field.type || 'text',
    required: !!field.required,
    order: typeof field.order === 'number' ? field.order : idx + 1,
    step: field.step || 'personal',
    options: field.options || undefined,
    visibleIf: field.visibleIf || undefined,
    moduleId,
  }));

  if (docs.length) {
    await InductionModuleField.insertMany(docs);
  }
}

type AccessResult = true | false | (IAssignment & Document);

async function ensureProjectAccess(
  userRole: string | undefined,
  userId: string | undefined,
  projectId: string,
  roleOverride?: 'manager' | 'worker',
): Promise<AccessResult> {
  if (userRole === 'admin') return true;

  const role =
    roleOverride ||
    (userRole === 'manager'
      ? 'manager'
      : userRole === 'worker'
      ? 'worker'
      : null);

  if (!role || !userId) return false;

  const assignment = await Assignment.findOne({
    user: userId,
    project: projectId,
    role,
  });

  return assignment || false;
}

const workerHasModuleAccess = (assignment: IAssignment | null, moduleId: Types.ObjectId) => {
  if (!assignment) return false;
  if (!assignment.modules || assignment.modules.length === 0) return true;
  const target = moduleId.toString();
  return assignment.modules.some((id) => id.toString() === target);
};

/* -------------------------------------------------------------------------- */
/*                             CREATE INDUCTION MODULE                         */
/* -------------------------------------------------------------------------- */

router.post(
  '/projects/:projectId/modules/induction',
  requireAuth,
  requireRole('admin', 'manager'),
  async (req, res) => {
    const projectId = req.params.projectId;

    if (!Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: 'Invalid project id' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (req.user?.role === 'manager') {
      const assigned = await Assignment.findOne({
        user: req.user.sub,
        project: projectId,
        role: 'manager',
      });

      if (!assigned) {
        return res
          .status(403)
          .json({ error: 'Manager must be assigned to the project to create modules.' });
      }
    }

    const parsed = InductionModuleCreateSchema.safeParse({
      ...req.body,
      projectId,
    });

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    let template: any = null;
    if (parsed.data.templateId) {
      if (!Types.ObjectId.isValid(parsed.data.templateId)) {
        return res.status(400).json({ error: 'Invalid template id' });
      }
      template = await InductionTemplate.findById(parsed.data.templateId);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
    }

    const module = await InductionModule.create({
      projectId,
      type: 'induction',
      name:
        parsed.data.name?.trim() ||
        template?.name ||
        `${project.name} induction`,
      description:
        typeof parsed.data.description !== 'undefined'
          ? parsed.data.description
          : template?.description,
      reviewStatus: 'draft',
      config: cloneConfig(parsed.data.config, template?.config),
      createdBy: req.user?.sub,
      updatedBy: req.user?.sub,
    });

    await seedModuleFields(
      module._id as Types.ObjectId,
      template?.fields,
    );

    res.status(201).json(module);
  },
);

/* -------------------------------------------------------------------------- */
/*                         LIST MODULES FOR A PROJECT                           */
/* -------------------------------------------------------------------------- */

router.get('/projects/:projectId/modules/induction', requireAuth, async (req, res) => {
  const projectId = req.params.projectId;

  if (!Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ error: 'Invalid project id' });
  }

  const access = await ensureProjectAccess(
    req.user?.role,
    req.user?.sub,
    projectId,
  );

  if (!access) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const workerAssignment =
    req.user?.role === 'worker' && access !== true ? (access as IAssignment) : null;

  const modules = await InductionModule.find({
    projectId,
    type: 'induction',
  })
    .sort({ createdAt: 1 })
    .lean();

  let filteredModules = modules;
  if (workerAssignment && workerAssignment.modules && workerAssignment.modules.length) {
    const allowedSet = new Set(workerAssignment.modules.map((id) => id.toString()));
    filteredModules = modules.filter((mod) => allowedSet.has(mod._id.toString()));
  }

  res.json({ modules: filteredModules });
});

/* -------------------------------------------------------------------------- */
/*                        GET MODULE DETAIL + FIELDS                            */
/* -------------------------------------------------------------------------- */

router.get('/modules/:moduleId', requireAuth, async (req, res) => {
  const moduleId = req.params.moduleId;

  if (!Types.ObjectId.isValid(moduleId)) {
    return res.status(400).json({ error: 'Invalid module id' });
  }

  const module = await InductionModule.findById(moduleId).lean();
  if (!module) {
    return res.status(404).json({ error: 'Module not found' });
  }

  const access = await ensureProjectAccess(
    req.user?.role,
    req.user?.sub,
    module.projectId.toString(),
  );

  if (!access) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const workerAssignment =
    req.user?.role === 'worker' && access !== true ? (access as IAssignment) : null;

  if (req.user?.role === 'worker') {
    const canView = workerHasModuleAccess(workerAssignment, module._id as Types.ObjectId);
    if (!canView) {
      return res.status(403).json({ error: 'Module not assigned to worker' });
    }
  }

  const fields = await InductionModuleField.find({ moduleId })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  res.json({ module, fields });
});

/* -------------------------------------------------------------------------- */
/*                           UPDATE MODULE (DRAFT)                              */
/* -------------------------------------------------------------------------- */

router.put(
  '/modules/:moduleId',
  requireAuth,
  requireRole('admin', 'manager'),
  async (req, res) => {
    const moduleId = req.params.moduleId;

    if (!Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({ error: 'Invalid module id' });
    }

    const parsed = InductionModuleUpdateDraftSchema.safeParse(req.body);
    const body = parsed.success ? parsed.data : (req.body as any);

    if (typeof (req.body as any)?.reviewStatus !== 'undefined') {
      return res
        .status(400)
        .json({ error: 'reviewStatus can only be changed via admin review' });
    }

    const mod = await InductionModule.findById(moduleId);
    if (!mod) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (req.user!.role === 'manager') {
      const assignment = await Assignment.findOne({
        user: req.user!.sub,
        project: mod.projectId,
        role: 'manager',
      });

      if (!assignment) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const status = mod.reviewStatus || 'draft';

      if (status === 'approved') {
        return res
          .status(403)
          .json({ error: 'Module cannot be edited in its current state' });
      }
    }

    if (body?.name) mod.name = String(body.name);
    if (typeof body?.description !== 'undefined') {
      mod.description = body.description;
    }
    if (body?.config) {
      mod.config = body.config as any;
    }

    mod.updatedBy = req.user?.sub as any;
    await mod.save();

    if (Array.isArray((req.body as any)?.fields)) {
      await InductionModuleField.deleteMany({ moduleId });

      const docs = (req.body as any).fields.map((f: any) => ({
        moduleId: mod._id,
        key: f.key ?? '',
        label: f.label ?? '',
        type: f.type || 'text',
        required: !!f.required,
        order: f.order ?? 0,
        step: f.step || 'personal',
        options: f.options || undefined,
        visibleIf: f.visibleIf || undefined,
      }));

      if (docs.length) {
        await InductionModuleField.insertMany(docs);
      }
    }

    const fields = await InductionModuleField.find({ moduleId })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    res.json({ module: mod, fields });
  },
);

/* -------------------------------------------------------------------------- */
/*                           DELETE INDUCTION MODULE                           */
/* -------------------------------------------------------------------------- */

router.delete(
  '/modules/:moduleId',
  requireAuth,
  requireRole('admin'),
  async (req, res) => {
    const moduleId = req.params.moduleId;

    if (!Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({ error: 'Invalid module id' });
    }

    const mod = await InductionModule.findById(moduleId);
    if (!mod) {
      return res.status(404).json({ error: 'Module not found' });
    }

    await Promise.all([
      InductionModuleField.deleteMany({ moduleId }),
      ModuleReview.deleteMany({ moduleId }),
      Submission.deleteMany({ moduleId }),
    ]);

    await mod.deleteOne();

    res.json({ ok: true });
  },
);

export default router;
