import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as svc from '../services/reviewsService.js'
import { PaginationQuerySchema, wrapPaginated } from '../utils/pagination.js'

const RequestSchema = z.object({ projectId: z.string().min(1) })
const ListQuery = PaginationQuerySchema.extend({
  status: z.enum(['pending','approved','declined','cancelled','all']).default('pending')
})
const DeclineBody = z.object({ reason: z.string().optional() })

export async function requestProject(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = RequestSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
    const out = await svc.requestProjectReview(parsed.data.projectId, req.user!.sub)
    // Keep legacy behavior: 200 with { ok, message } when updated, 201 with review object when created
    res.status((out as any)?.ok ? 200 : 201).json(out)
  } catch (err) { next(err) }
}

export async function listProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = ListQuery.safeParse(req.query)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
    const result = await svc.listProjectReviews({
      callerRole: req.user!.role,
      callerId: req.user!.sub,
      status: parsed.data.status,
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
    })
    if (!parsed.data.page || !parsed.data.pageSize) return res.json(result.items)
    return res.json(wrapPaginated(result.items, result.total!, parsed.data.page!, parsed.data.pageSize!))
  } catch (err) { next(err) }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const out = await svc.deleteReview(req.params.id)
    res.json(out)
  } catch (err) { next(err) }
}

export async function approveProject(req: Request, res: Response, next: NextFunction) {
  try {
    const out = await svc.approveReview(req.params.id, req.user!.sub)
    res.json(out)
  } catch (err) { next(err) }
}

export async function declineProject(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = DeclineBody.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
    const out = await svc.declineReview(req.params.id, req.user!.sub, parsed.data.reason || 'Not specified')
    res.json(out)
  } catch (err) { next(err) }
}
