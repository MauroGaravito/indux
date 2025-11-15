import { Types } from 'mongoose';
import { ProjectField } from '../models/ProjectField.js';
import { Project } from '../models/Project.js';
import { HttpError } from '../middleware/errorHandler.js';
import { ProjectFieldCreateSchema, ProjectFieldUpdateSchema } from '../utils/validators.js';

function ensureObjectId(id: string, label: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new HttpError(400, `Invalid ${label}`);
  }
}

export async function listFields(projectId: string) {
  ensureObjectId(projectId, 'project id');
  const exists = await Project.exists({ _id: projectId });
  if (!exists) throw new HttpError(404, 'Project not found');
  return ProjectField.find({ projectId }).sort({ order: 1, createdAt: 1 }).lean();
}

export async function createField(payload: unknown) {
  const parsed = ProjectFieldCreateSchema.safeParse(payload);
  if (!parsed.success) {
    throw new HttpError(400, 'Invalid field payload', parsed.error.flatten());
  }
  const { projectId, key } = parsed.data;
  ensureObjectId(projectId, 'project id');
  const exists = await Project.exists({ _id: projectId });
  if (!exists) throw new HttpError(404, 'Project not found');
  const dup = await ProjectField.findOne({ projectId, key });
  if (dup) throw new HttpError(409, 'Field key already exists for this project');
  const field = await ProjectField.create(parsed.data);
  return field;
}

export async function updateField(id: string, payload: unknown) {
  ensureObjectId(id, 'field id');
  const existing = await ProjectField.findById(id);
  if (!existing) throw new HttpError(404, 'Field not found');
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

export async function deleteField(id: string) {
  ensureObjectId(id, 'field id');
  const deleted = await ProjectField.findByIdAndDelete(id);
  if (!deleted) throw new HttpError(404, 'Field not found');
  return { ok: true };
}
