import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as svc from '../services/assignmentsService.js'
import { PaginationQuerySchema, wrapPaginated } from '../utils/pagination.js'
import { ok } from '../utils/response.js'

const CreateBody = z.object({
  user: z.string().min(1),
  project: z.string().min(1),
  role: z.enum(['manager','worker'])
})
const PaginatedQuery = PaginationQuerySchema

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = CreateBody.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
    const out = await svc.createAssignment(req.user!.role, req.user!.sub, parsed.data)
    res.status(201).json(ok(out))
  } catch (err) { next(err) }
}

export async function listByUser(req: Request, res: Response, next: NextFunction) {
  try {
    const q = PaginatedQuery.safeParse(req.query)
    if (!q.success) return res.status(400).json({ error: q.error.flatten() })
    const result = await svc.listByUser(req.user!.role, req.user!.sub, req.params.id, { page: q.data.page, pageSize: q.data.pageSize })
    if (!q.data.page || !q.data.pageSize) return res.json(result.items)
    return res.json(ok(wrapPaginated(result.items, result.total!, q.data.page!, q.data.pageSize!)))
  } catch (err) { next(err) }
}

export async function listByProject(req: Request, res: Response, next: NextFunction) {
  try {
    const q = PaginatedQuery.safeParse(req.query)
    if (!q.success) return res.status(400).json({ error: q.error.flatten() })
    const result = await svc.listByProject(req.user!.role, req.user!.sub, req.params.id, { page: q.data.page, pageSize: q.data.pageSize })
    if (!q.data.page || !q.data.pageSize) return res.json(result.items)
    return res.json(ok(wrapPaginated(result.items, result.total!, q.data.page!, q.data.pageSize!)))
  } catch (err) { next(err) }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const out = await svc.remove(req.user!.role, req.user!.sub, req.params.id)
    res.json(ok(out))
  } catch (err) { next(err) }
}

export async function listManagerTeam(req: Request, res: Response, next: NextFunction) {
  try {
    const q = PaginatedQuery.safeParse(req.query)
    if (!q.success) return res.status(400).json({ error: q.error.flatten() })
    const result = await svc.listManagerTeam(req.user!.role, req.user!.sub, req.params.id, { page: q.data.page, pageSize: q.data.pageSize })
    if (!q.data.page || !q.data.pageSize) return res.json(result.items)
    return res.json(ok(wrapPaginated(result.items, result.total!, q.data.page!, q.data.pageSize!)))
  } catch (err) { next(err) }
}
