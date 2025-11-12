import { Assignment } from '../models/Assignment.js'
import { Project } from '../models/Project.js'
import { ProjectReview } from '../models/ProjectReview.js'
import { HttpError } from '../middleware/errorHandler.js'

export type Role = 'admin'|'manager'|'worker'

export interface ListParams {
  callerRole: Role
  callerId: string
  status: 'pending'|'approved'|'declined'|'cancelled'|'all'
  page?: number
  pageSize?: number
}

export async function requestProjectReview(projectId: string, requesterId: string) {
  const project = await Project.findById(projectId).lean()
  if (!project) throw new HttpError(404, 'Project not found')
  const latestData = (project as any)?.config || {}

  const existing = await ProjectReview.findOne({ projectId, status: 'pending' })
  if (existing) {
    ;(existing as any).data = latestData
    ;(existing as any).message = 'Updated with latest project data'
    existing.markModified('data')
    await existing.save()
    return { ok: true, message: 'Existing review updated with latest project data.' }
  }

  const approved = await ProjectReview.findOne({ projectId, status: 'approved' }).lean()
  if (approved) throw new HttpError(409, 'Project already approved. Delete or cancel the previous review to request a new one.')

  const review = await ProjectReview.create({ projectId, requestedBy: requesterId as any, data: latestData, status: 'pending' })
  return review
}

export async function listProjectReviews(params: ListParams) {
  const filter: any = {}
  if (params.status !== 'all') filter.status = params.status
  if (params.callerRole === 'manager') {
    const managed = await Assignment.find({ user: params.callerId, role: 'manager' }).lean()
    const ids = managed.map(a => a.project)
    filter.projectId = { $in: ids }
  }
  const q = ProjectReview.find(filter).populate('projectId', 'name').sort({ createdAt: -1 })
  if (params.page && params.pageSize) {
    const [items, total] = await Promise.all([
      q.skip((params.page - 1) * params.pageSize).limit(params.pageSize).lean(),
      ProjectReview.countDocuments(filter)
    ])
    return { items, total, page: params.page, pageSize: params.pageSize }
  }
  const items = await q.lean()
  return { items }
}

export async function deleteReview(id: string) {
  const review = await ProjectReview.findById(id)
  if (!review) throw new HttpError(404, 'Review not found')
  await review.deleteOne()
  return { ok: true, message: 'Review deleted successfully' }
}

export async function approveReview(id: string, reviewerId: string) {
  const rev = await ProjectReview.findById(id)
  if (!rev) throw new HttpError(404, 'Not found')
  ;(rev as any).status = 'approved'
  ;(rev as any).reviewedBy = reviewerId as any
  await rev.save()
  return { ok: true }
}

export async function declineReview(id: string, reviewerId: string, reason: string) {
  const rev = await ProjectReview.findById(id)
  if (!rev) throw new HttpError(404, 'Not found')
  ;(rev as any).status = 'declined'
  ;(rev as any).reason = reason || 'Not specified'
  ;(rev as any).reviewedBy = reviewerId as any
  await rev.save()
  return { ok: true }
}

