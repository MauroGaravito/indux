import { Assignment } from '../models/Assignment.js'
import { Project } from '../models/Project.js'
import { ProjectReview } from '../models/ProjectReview.js'
import { ProjectField } from '../models/ProjectField.js'
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
  const project = await Project.findById(projectId)
  if (!project) throw new HttpError(404, 'Project not found')
  const latestConfig = (project as any)?.config || {}
  const fields = await ProjectField.find({ projectId }).sort({ order: 1, createdAt: 1 }).lean()
  const snapshot = {
    config: latestConfig,
    fields: fields.map((field) => ({
      _id: field._id,
      key: field.key,
      label: field.label,
      type: field.type,
      required: field.required,
      order: field.order,
      helpText: field.helpText,
      options: field.options
    }))
  }

  const existing = await ProjectReview.findOne({ projectId, status: 'pending' })
  if (existing) {
    ;(existing as any).data = snapshot
    ;(existing as any).message = 'Updated with latest project data'
    existing.markModified('data')
    await existing.save()
    await Project.findByIdAndUpdate(projectId, { reviewStatus: 'pending', reviewedAt: null, reviewedBy: null })
    return { ok: true, message: 'Existing review updated with latest project data.' }
  }

  const review = await ProjectReview.create({ projectId, requestedBy: requesterId as any, data: snapshot, status: 'pending' })
  await Project.findByIdAndUpdate(projectId, { reviewStatus: 'pending', reviewedAt: null, reviewedBy: null })
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
  const q = ProjectReview.find(filter).populate('projectId', 'name reviewStatus reviewedAt reviewedBy').sort({ createdAt: -1 })
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
  if (rev.status !== 'pending') throw new HttpError(409, 'Review is not pending')
  ;(rev as any).status = 'approved'
  ;(rev as any).reviewedBy = reviewerId as any
  await rev.save()
  await Project.findByIdAndUpdate(rev.projectId, {
    reviewStatus: 'approved',
    reviewedAt: new Date(),
    reviewedBy: reviewerId
  })
  return { ok: true }
}

export async function declineReview(id: string, reviewerId: string, reason: string) {
  const rev = await ProjectReview.findById(id)
  if (!rev) throw new HttpError(404, 'Not found')
  if (rev.status !== 'pending') throw new HttpError(409, 'Review is not pending')
  ;(rev as any).status = 'declined'
  ;(rev as any).reason = reason || 'Not specified'
  ;(rev as any).reviewedBy = reviewerId as any
  await rev.save()
  await Project.findByIdAndUpdate(rev.projectId, {
    reviewStatus: 'declined',
    reviewedAt: new Date(),
    reviewedBy: reviewerId
  })
  return { ok: true }
}
