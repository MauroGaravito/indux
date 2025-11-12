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
}

export async function listSubmissions(params: ListParams) {
  const { callerRole, callerId } = params
  const filter: any = {}
  if (params.status !== 'all') filter.status = params.status

  if (callerRole === 'manager') {
    const managed = await Assignment.find({ user: callerId, role: 'manager' }).lean()
    const ids = managed.map(a => a.project)
    filter.projectId = { $in: ids }
  }

  const q = Submission.find(filter)
    .populate('userId', 'name email')
    .populate('projectId', 'name')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 })

  const page = params.page && params.page > 0 ? params.page : undefined
  const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : undefined

  if (page && pageSize) {
    const [items, total] = await Promise.all([
      q.skip((page - 1) * pageSize).limit(pageSize).lean(),
      Submission.countDocuments(filter)
    ])
    return { items, total, page, pageSize }
  }
  const items = await q.lean()
  return { items }
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
  const existing = await Submission.findById(id)
  if (!existing) throw new HttpError(404, 'Submission not found')
  await Submission.findByIdAndDelete(id)
  return { ok: true, message: 'Submission deleted successfully' }
}

