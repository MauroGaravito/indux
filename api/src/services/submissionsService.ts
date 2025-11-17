import { Types } from 'mongoose'
import { Assignment } from '../models/Assignment.js'
import { Submission } from '../models/Submission.js'
import { User } from '../models/User.js'
import { Project } from '../models/Project.js'
import { ProjectField } from '../models/ProjectField.js'
import { ensureBucket } from '../services/minio.js'
import { generateCertificate } from '../services/pdf.js'
import { sendMail } from '../services/mailer.js'
import { HttpError } from '../middleware/errorHandler.js'

export type Role = 'admin'|'manager'|'worker'

const normalizeId = (value: any): any => {
  if (!value) return value
  if (typeof value === 'string') return value
  if (value instanceof Types.ObjectId) return value.toString()
  if (typeof value === 'object') {
    if ('_id' in value) return normalizeId((value as any)._id)
    if (typeof value.toString === 'function') {
      const str = value.toString()
      return str === '[object Object]' ? undefined : str
    }
  }
  return String(value)
}

const ACTIVE_ASSIGNMENT_CLAUSE = [{ endedAt: { $exists: false } }, { endedAt: null }]

const serializeField = (field: any) => ({
  _id: String(field._id),
  key: field.key,
  label: field.label,
  type: field.type,
  required: field.required,
  order: field.order,
  helpText: field.helpText,
  options: field.options
})

export interface ListParams {
  callerRole: Role
  callerId: string
  status: 'pending'|'approved'|'declined'|'all'
  page?: number
  pageSize?: number
  projectId?: string
}

export async function listSubmissions(params: ListParams) {
  const { callerRole, callerId } = params
  const filter: any = {}
  if (params.status !== 'all') filter.status = params.status
  const normalizedProjectId = normalizeId(params.projectId)
  if (normalizedProjectId && !Types.ObjectId.isValid(normalizedProjectId)) {
    throw new HttpError(400, 'Invalid project id')
  }

  const page = params.page && params.page > 0 ? params.page : undefined
  const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : undefined
  const emptyResult = () => {
    if (page && pageSize) return { items: [], total: 0, page, pageSize }
    return { items: [] }
  }

  if (callerRole === 'worker') {
    filter.userId = callerId
    const assignments = await Assignment.find({ user: callerId, role: 'worker', $or: ACTIVE_ASSIGNMENT_CLAUSE }).lean()
    if (!assignments.length) return emptyResult()
    const projectIds = assignments.map(a => a.project)
    const approved = await Project.find({ _id: { $in: projectIds }, reviewStatus: 'approved' }).select('_id').lean()
    const allowedDocs = approved.map(doc => doc._id)
    const allowedStrings = allowedDocs.map(id => id.toString())
    if (!allowedDocs.length) return emptyResult()
    if (normalizedProjectId) {
      if (!allowedStrings.includes(normalizedProjectId)) throw new HttpError(403, 'Forbidden')
      filter.projectId = new Types.ObjectId(normalizedProjectId)
    } else {
      filter.projectId = { $in: allowedDocs }
    }
  } else if (callerRole === 'manager') {
    const managed = await Assignment.find({ user: callerId, role: 'manager', $or: ACTIVE_ASSIGNMENT_CLAUSE }).lean()
    const managedDocs = managed.map(a => new Types.ObjectId(a.project))
    const managedStrings = managedDocs.map(id => id.toString())
    if (!managedDocs.length) return emptyResult()
    if (normalizedProjectId) {
      if (!managedStrings.includes(normalizedProjectId)) throw new HttpError(403, 'Forbidden')
      filter.projectId = new Types.ObjectId(normalizedProjectId)
    } else {
      filter.projectId = { $in: managedDocs }
    }
  } else if (normalizedProjectId) {
    filter.projectId = new Types.ObjectId(normalizedProjectId)
  }

  const q = Submission.find(filter)
    .populate('userId', 'name email')
    .populate('projectId', 'name reviewStatus')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 })

  const annotateOrphans = async (entries: any[]) => {
    const ids = Array.from(new Set(entries
      .map(item => normalizeId(item?.projectId))
      .filter((id): id is string => Boolean(id))))
    const existing = ids.length
      ? await Project.find({ _id: { $in: ids } }).select('_id').lean()
      : []
    const existingSet = new Set(existing.map(doc => doc._id.toString()))
    return entries.map(item => {
      const pid = normalizeId(item?.projectId)
      const projectExists = pid ? existingSet.has(pid) : false
      return { ...item, orphaned: !projectExists }
    })
  }

  if (page && pageSize) {
    const [items, total] = await Promise.all([
      q.skip((page - 1) * pageSize).limit(pageSize).lean(),
      Submission.countDocuments(filter)
    ])
    return { items: await annotateOrphans(items), total, page, pageSize }
  }
  const items = await q.lean()
  return { items: await annotateOrphans(items) }
}

export async function createSubmission(workerId: string, body: any) {
  const projectId = normalizeId(body.projectId)
  if (!Types.ObjectId.isValid(projectId)) throw new HttpError(400, 'Invalid project id')
  body.projectId = projectId
  const assignment = await Assignment.findOne({ user: workerId, project: projectId, role: 'worker', $or: ACTIVE_ASSIGNMENT_CLAUSE }).lean()
  if (!assignment) throw new HttpError(403, 'Not assigned to this project')
  const project = await Project.findById(projectId).select('reviewStatus')
  if (!project) throw new HttpError(404, 'Project not found')
  if (project.reviewStatus !== 'approved') throw new HttpError(403, 'Project not available')

  const existing = await Submission.findOne({ projectId, userId: workerId }).sort({ createdAt: -1 })
  if (existing && existing.status === 'approved') {
    throw new HttpError(409, 'Submission already approved')
  }

  const payload = {
    projectId,
    userId: workerId,
    personal: body.personal,
    uploads: body.uploads,
    quiz: body.quiz,
    signatureDataUrl: body.signatureDataUrl,
    status: 'pending',
    reviewedBy: undefined,
    reviewReason: undefined,
    certificateKey: undefined
  }

  if (existing) {
    existing.set(payload)
    await existing.save()
    return existing
  }

  const sub = await Submission.create(payload)
  return sub
}

async function ensureManagerCanAct(callerRole: Role, callerId: string, projectId: any) {
  if (callerRole !== 'manager') return
  const normalized = normalizeId(projectId)
  if (!normalized) throw new HttpError(400, 'Invalid project id')
  const allowed = await Assignment.findOne({ user: callerId, project: normalized, role: 'manager', $or: ACTIVE_ASSIGNMENT_CLAUSE }).lean()
  if (!allowed) throw new HttpError(403, 'Forbidden')
}

export async function approveSubmission(id: string, callerId: string, callerRole: Role) {
  const sub = await Submission.findById(id)
  if (!sub) throw new HttpError(404, 'Not found')
  const projectId = normalizeId(sub.projectId)
  await ensureManagerCanAct(callerRole, callerId, projectId)

  const user = await User.findById(sub.userId)
  const project = await Project.findById(projectId)
  if (!user || !project) throw new HttpError(400, 'Invalid submission context')

  await ensureBucket()
  const { v4: uuidv4 } = await import('uuid')
  const certKey = `certs/${uuidv4()}.pdf`
  await generateCertificate(certKey, { workerName: user.name, projectName: project.name })

  sub.status = 'approved'
  ;(sub as any).reviewedBy = callerId as any
  ;(sub as any).certificateKey = certKey
  await sub.save()

  try {
    await sendMail({ to: user.email, subject: 'Induction Approved', text: `Your induction for ${project.name} is approved.` })
  } catch {}
  return { ok: true }
}

export async function declineSubmission(id: string, callerId: string, callerRole: Role, reason: string) {
  const sub = await Submission.findById(id)
  if (!sub) throw new HttpError(404, 'Not found')
  const projectId = normalizeId(sub.projectId)
  await ensureManagerCanAct(callerRole, callerId, projectId)

  sub.status = 'declined'
  ;(sub as any).reviewReason = reason || 'Not specified'
  ;(sub as any).reviewedBy = callerId as any
  await sub.save()
  return { ok: true }
}

export async function deleteSubmission(id: string) {
  const submission = await Submission.findById(id)
  if (!submission) throw new HttpError(404, 'Submission not found')
  const normalizedProjectId = normalizeId(submission.projectId)
  const projectExists = normalizedProjectId
    ? await Project.exists({ _id: normalizedProjectId })
    : null
  const isOrphaned = !projectExists
  await Submission.findByIdAndDelete(id)
  return { ok: true, orphaned: isOrphaned, message: 'Submission deleted' }
}

export async function getSubmissionById(id: string, callerRole: Role, callerId: string) {
  if (!Types.ObjectId.isValid(id)) throw new HttpError(400, 'Invalid submission id')
  const submission = await Submission.findById(id)
    .populate('userId', 'name email')
    .populate('projectId', 'name reviewStatus')
    .populate('reviewedBy', 'name')
  if (!submission) throw new HttpError(404, 'Submission not found')
  const projectId = normalizeId(submission.projectId)
  if (!projectId || !Types.ObjectId.isValid(projectId)) throw new HttpError(400, 'Invalid project reference')
  if (callerRole === 'manager') {
    await ensureManagerCanAct(callerRole, callerId, projectId)
  } else if (callerRole === 'worker') {
    if (normalizeId(submission.userId) !== callerId) throw new HttpError(403, 'Forbidden')
    const project = await Project.findById(projectId).select('reviewStatus')
    if (!project || project.reviewStatus !== 'approved') throw new HttpError(403, 'Project not available')
  }
  const fields = await ProjectField.find({ projectId }).sort({ order: 1, createdAt: 1 }).lean()
  const out = submission.toObject()
  ;(out as any).fields = fields.map(serializeField)
  return out
}
