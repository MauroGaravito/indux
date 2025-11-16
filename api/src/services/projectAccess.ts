import { Types } from 'mongoose';
import { Project } from '../models/Project.js';
import type { AuthPayload } from '../middleware/auth.js';

export async function canManagerEditProject(user: AuthPayload | undefined, projectId: string) {
  if (!user) return false;
  if (!Types.ObjectId.isValid(projectId)) return false;
  if (user.role === 'admin') return true;
  if (user.role !== 'manager') return false;

  const project = await Project.findById(projectId).select('managers editableByManagers').lean();
  if (!project) return false;
  if ((project as any).editableByManagers === false) return false;

  const managers = Array.isArray((project as any).managers) ? (project as any).managers : [];
  return managers.some((m: any) => String(m) === user.sub);
}
