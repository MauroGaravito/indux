import { Types } from 'mongoose'
import { Assignment } from '../models/Assignment.js'
import { Submission } from '../models/Submission.js'
import { User } from '../models/User.js'
import { Project } from '../models/Project.js'
import { ensureBucket } from '../services/minio.js'
import { generateCertificate } from '../services/pdf.js'
import { sendMail } from '../services/mailer.js'
import { HttpError } from '../middleware/errorHandler.js'

export type Role = 'admin'|'manager'|'worker'

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
  if (params.projectId) {
    if (!Types.ObjectId.isValid(params.projectId)) {
      throw new HttpError(400, 'Invalid project id')
    }
    filter.projectId = params.projectId
  }

  if (callerRole === 'manager') {
    const managed = await Assignment.find({ user: callerId, role: 'manager' }).lean()
    const ids = managed.map(a => a.project)
    if (params.projectId) {
      const allowed = ids.some(p => p?.toString() === params.projectId)
      if (!allowed) {
        filter.projectId = { $in: [] }
      }
    } else {
      filter.projectId = { $in: ids }
    }
  }

  const q = Submission.find(filter)
    .populate('userId', 'name email')
    .populate('projectId', 'name')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 })

  const page = params.page && params.page > 0 ? params.page : undefined
  const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : undefined

  const annotateOrphans = async (entries: any[]) => {
    const ids = Array.from(new Set(entries
      .map(item => item?.projectId)
      .filter(Boolean)
      .map(id => id.toString())))
    const existing = ids.length
      ? await Project.find({ _id: { $in: ids } }).select('_id').lean()
      : []
    const existingSet = new Set(existing.map(doc => doc._id.toString()))
    return entries.map(item => {
      const pid = item?.projectId ? item.projectId.toString() : undefined
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
  if (!Types.ObjectId.isValid(body.projectId)) throw new HttpError(400, 'Invalid project id')
  const assigned = await Assignment.findOne({ user: workerId, project: body.projectId }).lean()
  if (!assigned) throw new HttpError(403, 'Not assigned to this project')
  const sub = await Submission.create({ ...body, userId: workerId, status: 'pending' })
  return sub
}

async function ensureManagerCanAct(callerRole: Role, callerId: string, projectId: any) {
  if (callerRole !== 'manager') return
  const allowed = await Assignment.findOne({ user: callerId, project: projectId, role: 'manager' }).lean()
  if (!allowed) throw new HttpError(403, 'Forbidden')
}

export async function approveSubmission(id: string, callerId: string, callerRole: Role) {
  const sub = await Submission.findById(id)
  if (!sub) throw new HttpError(404, 'Not found')
  await ensureManagerCanAct(callerRole, callerId, sub.projectId)

  const user = await User.findById(sub.userId)
  const project = await Project.findById(sub.projectId)
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
  await ensureManagerCanAct(callerRole, callerId, sub.projectId)

  sub.status = 'declined'
  ;(sub as any).reviewReason = reason || 'Not specified'
  ;(sub as any).reviewedBy = callerId as any
  await sub.save()
  return { ok: true }
}

export async function deleteSubmission(id: string) {
  const submission = await Submission.findById(id)
  if (!submission) throw new HttpError(404, 'Submission not found')
  const projectExists = submission.projectId
    ? await Project.exists({ _id: submission.projectId })
    : null
  const isOrphaned = !projectExists
  await Submission.findByIdAndDelete(id)
  return { ok: true, orphaned: isOrphaned, message: 'Submission deleted' }
}
