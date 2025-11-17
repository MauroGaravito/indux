import { Types } from 'mongoose';
import { ProjectField } from '../models/ProjectField.js';
import { Project } from '../models/Project.js';
import { Assignment } from '../models/Assignment.js';
import { HttpError } from '../middleware/errorHandler.js';
import { ProjectFieldCreateSchema, ProjectFieldUpdateSchema } from '../utils/validators.js';
import type { AuthPayload } from '../middleware/auth.js';
import { canManagerEditProject } from './projectAccess.js';

function ensureObjectId(id: string, label: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new HttpError(400, `Invalid ${label}`);
  }
}

const ACTIVE_ASSIGNMENT_CLAUSE = [{ endedAt: { $exists: false } }, { endedAt: null }];

function serializeField(field: any) {
  return {
    _id: String(field._id),
    key: field.key,
    label: field.label,
    type: field.type,
    required: field.required,
    order: field.order,
    helpText: field.helpText,
    options: field.options
  };
}

async function ensureFieldAccess(user: AuthPayload | undefined, projectId: string) {
  if (!user) throw new HttpError(401, 'Unauthorized');
  const project = await Project.findById(projectId).select('reviewStatus').lean();
  if (!project) throw new HttpError(404, 'Project not found');
  if (user.role === 'admin') return project;
  if (user.role === 'manager') {
    const assignment = await Assignment.findOne({
      user: user.sub,
      project: projectId,
      role: 'manager',
      $or: ACTIVE_ASSIGNMENT_CLAUSE
    }).lean();
    if (!assignment) throw new HttpError(403, 'Forbidden');
    return project;
  }
  if (user.role === 'worker') {
    if (project.reviewStatus !== 'approved') throw new HttpError(403, 'Project not available');
    const assignment = await Assignment.findOne({
      user: user.sub,
      project: projectId,
      role: 'worker',
      $or: ACTIVE_ASSIGNMENT_CLAUSE
    }).lean();
    if (!assignment) throw new HttpError(403, 'Forbidden');
    return project;
  }
  throw new HttpError(403, 'Forbidden');
}

export async function listFields(projectId: string, user?: AuthPayload) {
  ensureObjectId(projectId, 'project id');
  await ensureFieldAccess(user, projectId);
  const fields = await ProjectField.find({ projectId }).sort({ order: 1, createdAt: 1 }).lean();
  return fields.map(serializeField);
}

export async function createField(payload: unknown, user: AuthPayload) {
  const parsed = ProjectFieldCreateSchema.safeParse(payload);
  if (!parsed.success) {
    throw new HttpError(400, 'Invalid field payload', parsed.error.flatten());
  }
  const { projectId, key } = parsed.data;
  ensureObjectId(projectId, 'project id');
  const exists = await Project.exists({ _id: projectId });
  if (!exists) throw new HttpError(404, 'Project not found');
  const canEdit = await canManagerEditProject(user, projectId);
  if (!canEdit) throw new HttpError(403, 'Not allowed to edit fields for this project');
  const dup = await ProjectField.findOne({ projectId, key });
  if (dup) throw new HttpError(409, 'Field key already exists for this project');
  const field = await ProjectField.create(parsed.data);
  return field;
}

export async function updateField(id: string, payload: unknown, user: AuthPayload) {
  ensureObjectId(id, 'field id');
  const existing = await ProjectField.findById(id);
  if (!existing) throw new HttpError(404, 'Field not found');
  const canEdit = await canManagerEditProject(user, existing.projectId.toString());
  if (!canEdit) throw new HttpError(403, 'Not allowed to edit fields for this project');
  const parsed = ProjectFieldUpdateSchema.safeParse({
    ...(payload as Record<string, unknown>),
    projectId: (payload as any)?.projectId || existing.projectId.toString()
  });
  if (!parsed.success) {
    throw new HttpError(400, 'Invalid field payload', parsed.error.flatten());
  }
  if (existing.projectId.toString() !== parsed.data.projectId) {
    throw new HttpError(400, 'Project mismatch for field');
  }
  if (parsed.data.key && parsed.data.key !== existing.key) {
    const dup = await ProjectField.findOne({ projectId: existing.projectId, key: parsed.data.key });
    if (dup) throw new HttpError(409, 'Field key already exists for this project');
  }
  Object.assign(existing, { ...parsed.data, projectId: existing.projectId });
  await existing.save();
  return existing;
}

export async function deleteField(id: string, user: AuthPayload) {
  ensureObjectId(id, 'field id');
  const existing = await ProjectField.findById(id);
  if (!existing) throw new HttpError(404, 'Field not found');
  const canEdit = await canManagerEditProject(user, existing.projectId.toString());
  if (!canEdit) throw new HttpError(403, 'Not allowed to edit fields for this project');
  await ProjectField.findByIdAndDelete(id);
  return { ok: true };
}
