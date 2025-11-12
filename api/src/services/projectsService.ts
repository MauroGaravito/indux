import { Assignment } from '../models/Assignment.js'
import { Project } from '../models/Project.js'
import { ProjectReview } from '../models/ProjectReview.js'
import { HttpError } from '../middleware/errorHandler.js'

export type Role = 'admin'|'manager'|'worker'

export interface ListParams {
  callerRole: Role
  callerId: string
  page?: number
  pageSize?: number
}

export async function listProjects(params: ListParams) {
  const { callerRole, callerId } = params
  let query: any = {}
  if (callerRole !== 'admin') {
    const assignments = await Assignment.find({ user: callerId, $or: [{ endedAt: { $exists: false } }, { endedAt: null }] }).lean()
    const ids = assignments.map(a => a.project)
    query = { _id: { $in: ids } }
  }
  const q = Project.find(query).sort({ createdAt: -1 })
  const { page, pageSize } = params
  if (page && pageSize) {
    const [items, total] = await Promise.all([
      q.skip((page - 1) * pageSize).limit(pageSize).lean(),
      Project.countDocuments(query)
    ])
    return { items, total, page, pageSize }
  }
  const items = await q.lean()
  return { items }
}

export async function createProject(data: any) {
  const proj = await Project.create(data)
  return proj
}

export async function getProject(id: string) {
  const p = await Project.findById(id).populate('managers', 'name email role')
  if (!p) throw new HttpError(404, 'Project not found')
  return p
}

export async function updateProject(id: string, patch: any) {
  const proj = await Project.findByIdAndUpdate(id, patch, { new: true })
  if (!proj) throw new HttpError(404, 'Project not found')
  return proj
}

export async function deleteProject(id: string) {
  const existing = await Project.findById(id)
  if (!existing) throw new HttpError(404, 'Project not found')

  await Project.findByIdAndDelete(id)
  await Assignment.deleteMany({ project: id })
  try {
    await ProjectReview.updateMany(
      { projectId: id, status: 'pending' },
      { $set: { status: 'cancelled', message: 'Project deleted by admin' } }
    )
  } catch {}
  return { ok: true, message: 'Project deleted successfully' }
}

