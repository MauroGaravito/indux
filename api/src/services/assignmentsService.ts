import { Types } from 'mongoose'
import { Assignment } from '../models/Assignment.js'
import { Project } from '../models/Project.js'
import { User } from '../models/User.js'
import { HttpError } from '../middleware/errorHandler.js'

export type Role = 'admin'|'manager'|'worker'

export async function isManagerOfProject(managerId: string, projectId: string) {
  if (!Types.ObjectId.isValid(managerId) || !Types.ObjectId.isValid(projectId)) return false
  const found = await Assignment.findOne({ user: managerId, project: projectId, role: 'manager' }).lean()
  return !!found
}

export async function createAssignment(requesterRole: Role, requesterId: string, body: { user: string; project: string; role: 'manager'|'worker' }) {
  const { user, project, role } = body || ({} as any)
  if (!Types.ObjectId.isValid(user) || !Types.ObjectId.isValid(project)) throw new HttpError(400, 'Invalid user or project id')
  if (!['manager','worker'].includes(role)) throw new HttpError(400, 'Invalid role')

  if (role === 'manager') {
    if (requesterRole !== 'admin') throw new HttpError(403, 'Only admins can assign project managers')
    const u = await User.findById(user).select('role')
    if (!u || u.role !== 'manager') throw new HttpError(400, 'Assigned user must have role "manager"')
  } else {
    if (requesterRole !== 'manager') throw new HttpError(403, 'Only managers can assign workers')
    const allowed = await isManagerOfProject(requesterId, project)
    if (!allowed) throw new HttpError(403, 'Forbidden')
    const u = await User.findById(user).select('role')
    if (!u || u.role !== 'worker') throw new HttpError(400, 'Assigned user must have role "worker"')
  }

  try {
    const doc = await Assignment.create({ user, project, role, assignedBy: requesterId })
    if (role === 'manager') {
      await Project.findByIdAndUpdate(project, { $addToSet: { managers: user } })
    }
    const populated = await doc.populate([{ path: 'user', select: '-password' }, { path: 'project' }])
    return populated
  } catch (e: any) {
    if (e?.code === 11000) throw new HttpError(409, 'User already assigned to this project')
    throw e
  }
}

export interface ListQuery { page?: number; pageSize?: number }

export async function listByUser(callerRole: Role, callerId: string, targetUserId: string, query: ListQuery = {}) {
  if (!Types.ObjectId.isValid(targetUserId)) throw new HttpError(400, 'Invalid user id')
  let filter: any = { user: targetUserId }
  if (callerRole === 'manager' && callerId !== targetUserId) {
    const managed = await Assignment.find({ user: callerId, role: 'manager' }).lean()
    const managedProjectIds = managed.map(a => a.project.toString())
    filter.project = { $in: managedProjectIds }
  } else if (!(callerRole === 'admin' || callerId === targetUserId)) {
    throw new HttpError(403, 'Forbidden')
  }

  const q = Assignment.find(filter).populate('project').lean()
  if (query.page && query.pageSize) {
    const [items, total] = await Promise.all([
      q.skip((query.page - 1) * query.pageSize).limit(query.pageSize),
      Assignment.countDocuments(filter)
    ])
    return { items, total, page: query.page, pageSize: query.pageSize }
  }
  const items = await q
  return { items }
}

export async function listByProject(callerRole: Role, callerId: string, projectId: string, query: ListQuery = {}) {
  if (!Types.ObjectId.isValid(projectId)) throw new HttpError(400, 'Invalid project id')
  if (callerRole === 'manager') {
    const allowed = await isManagerOfProject(callerId, projectId)
    if (!allowed) throw new HttpError(403, 'Forbidden')
  }
  const filter = { project: projectId }
  const q = Assignment.find(filter).populate([{ path: 'user', select: '-password' }, { path: 'project' }]).lean()
  if (query.page && query.pageSize) {
    const [items, total] = await Promise.all([
      q.skip((query.page - 1) * query.pageSize).limit(query.pageSize),
      Assignment.countDocuments(filter)
    ])
    return { items, total, page: query.page, pageSize: query.pageSize }
  }
  const items = await q
  return { items }
}

export async function remove(callerRole: Role, callerId: string, id: string) {
  if (!Types.ObjectId.isValid(id)) throw new HttpError(400, 'Invalid assignment id')
  const doc = await Assignment.findById(id).lean()
  if (!doc) throw new HttpError(404, 'Not found')
  if (callerRole === 'manager') {
    const allowed = await isManagerOfProject(callerId, doc.project.toString())
    if (!allowed) throw new HttpError(403, 'Forbidden')
  }
  await Assignment.findByIdAndDelete(id)
  try {
    if ((doc as any).role === 'manager') {
      await Project.findByIdAndUpdate(doc.project, { $pull: { managers: doc.user } })
    }
  } catch {}
  return { ok: true }
}

export async function listManagerTeam(callerRole: Role, callerId: string, managerId: string, query: ListQuery = {}) {
  if (!Types.ObjectId.isValid(managerId)) throw new HttpError(400, 'Invalid manager id')
  if (!(callerRole === 'admin' || callerId === managerId)) throw new HttpError(403, 'Forbidden')

  const managed = await Assignment.find({ user: managerId, role: 'manager' }).lean()
  if (!managed.length) throw new HttpError(404, 'No managed projects found')
  const projectIds = managed.map(a => a.project)
  const workerQ = Assignment.find({ project: { $in: projectIds }, role: 'worker' })
    .populate([{ path: 'user', select: 'name email' }, { path: 'project', select: 'name' }])
    .lean()

  if (query.page && query.pageSize) {
    const [items, total] = await Promise.all([
      workerQ.skip((query.page - 1) * query.pageSize).limit(query.pageSize),
      Assignment.countDocuments({ project: { $in: projectIds }, role: 'worker' })
    ])
    const mapped = items.map(w => ({
      userId: String((w as any).user?._id || w.user),
      name: String((w as any).user?.name || ''),
      email: String((w as any).user?.email || ''),
      projectName: String((w as any).project?.name || ''),
      projectId: String((w as any).project?._id || w.project),
    }))
    return { items: mapped, total, page: query.page, pageSize: query.pageSize }
  }

  const workers = await workerQ
  const out = workers.map(w => ({
    userId: String((w as any).user?._id || w.user),
    name: String((w as any).user?.name || ''),
    email: String((w as any).user?.email || ''),
    projectName: String((w as any).project?.name || ''),
    projectId: String((w as any).project?._id || w.project),
  }))
  return { items: out }
}

