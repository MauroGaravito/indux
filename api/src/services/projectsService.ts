import { Assignment } from '../models/Assignment.js'
import { Project } from '../models/Project.js'
import { ProjectField } from '../models/ProjectField.js'
import { Submission } from '../models/Submission.js'
import { ProjectReview } from '../models/ProjectReview.js'
import { HttpError } from '../middleware/errorHandler.js'

export type Role = 'admin'|'manager'|'worker'

export interface ListParams {
  callerRole: Role
  callerId: string
  page?: number
  pageSize?: number
}

const ACTIVE_ASSIGNMENT_CLAUSE = [{ endedAt: { $exists: false } }, { endedAt: null }]

async function ensureProjectVisibility(project: any, callerRole: Role, callerId: string) {
  if (callerRole === 'admin') return
  const roleFilter = callerRole === 'manager' ? 'manager' : 'worker'
  const assignment = await Assignment.findOne({
    user: callerId,
    project: project._id,
    role: roleFilter,
    $or: ACTIVE_ASSIGNMENT_CLAUSE
  }).lean()
  if (!assignment) throw new HttpError(403, 'Forbidden')
  if (callerRole === 'worker' && project.reviewStatus !== 'approved') {
    throw new HttpError(403, 'Project not available')
  }
}

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
  }
}

export async function listProjects(params: ListParams) {
  const { callerRole, callerId } = params
  let query: any = {}
  if (callerRole === 'manager') {
    const assignments = await Assignment.find({
      user: callerId,
      role: 'manager',
      $or: ACTIVE_ASSIGNMENT_CLAUSE
    }).lean()
    const ids = assignments.map(a => a.project)
    query = { _id: { $in: ids } }
  } else if (callerRole === 'worker') {
    const assignments = await Assignment.find({
      user: callerId,
      role: 'worker',
      $or: ACTIVE_ASSIGNMENT_CLAUSE
    }).lean()
    const ids = assignments.map(a => a.project)
    query = { _id: { $in: ids }, reviewStatus: 'approved' }
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

export async function getProject(id: string, callerRole: Role, callerId: string) {
  const p = await Project.findById(id).populate('managers', 'name email role')
  if (!p) throw new HttpError(404, 'Project not found')
  await ensureProjectVisibility(p, callerRole, callerId)
  const fields = await ProjectField.find({ projectId: p._id }).sort({ order: 1, createdAt: 1 }).lean()
  const out = p.toObject()
  ;(out as any).fields = fields.map(serializeField)
  return out
}

export async function updateProject(id: string, patch: any) {
  const proj = await Project.findById(id)
  if (!proj) throw new HttpError(404, 'Project not found')
  Object.assign(proj, patch)
  if (Object.prototype.hasOwnProperty.call(patch || {}, 'config')) {
    proj.reviewStatus = 'draft'
    proj.reviewedAt = undefined
    ;(proj as any).reviewedBy = undefined
  }
  await proj.save()
  return proj
}

export async function deleteProject(id: string) {
  const existing = await Project.findById(id)
  if (!existing) throw new HttpError(404, 'Project not found')

  // Delete submissions linked to this project
  await Submission.deleteMany({ projectId: existing._id })
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
