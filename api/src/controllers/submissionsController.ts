import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { SubmissionCreateSchema } from '../utils/validators.js'
import { PaginationQuerySchema, wrapPaginated } from '../utils/pagination.js'
import * as svc from '../services/submissionsService.js'

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const body = { ...req.body }
    if (typeof body.uploads === 'string') {
      try { body.uploads = JSON.parse(body.uploads) } catch {}
    }
    const parsed = SubmissionCreateSchema.safeParse(body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
    const sub = await svc.createSubmission(req.user!.sub, parsed.data)
    res.status(201).json(sub)
  } catch (err) { next(err) }
}

const ListQuery = PaginationQuerySchema.extend({
  status: z.enum(['pending','approved','declined','all']).default('pending'),
  projectId: z.string().optional()
})

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const q = ListQuery.safeParse(req.query)
    if (!q.success) return res.status(400).json({ error: q.error.flatten() })
    const result = await svc.listSubmissions({
      callerRole: req.user!.role,
      callerId: req.user!.sub,
      status: q.data.status,
      page: q.data.page,
      pageSize: q.data.pageSize,
      projectId: q.data.projectId,
    })
    // Backwards compatible: if no page/pageSize specified, return array only
    if (!q.data.page || !q.data.pageSize) return res.json(result.items)
    return res.json(wrapPaginated(result.items, result.total!, q.data.page!, q.data.pageSize!))
  } catch (err) { next(err) }
}

export async function approve(req: Request, res: Response, next: NextFunction) {
  try {
    const out = await svc.approveSubmission(req.params.id, req.user!.sub, req.user!.role)
    res.json(out)
  } catch (err) { next(err) }
}

const DeclineBody = z.object({ reason: z.string().optional() })
export async function decline(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = DeclineBody.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
    const out = await svc.declineSubmission(req.params.id, req.user!.sub, req.user!.role, parsed.data.reason || 'Not specified')
    res.json(out)
  } catch (err) { next(err) }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const out = await svc.deleteSubmission(req.params.id)
    res.json(out)
  } catch (err) { next(err) }
}
