import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { ProjectSchema } from '../utils/validators.js'
import * as svc from '../services/projectsService.js'
import { PaginationQuerySchema, wrapPaginated } from '../utils/pagination.js'

const ListQuery = PaginationQuerySchema

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = ListQuery.safeParse(req.query)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
    const result = await svc.listProjects({
      callerRole: req.user!.role,
      callerId: req.user!.sub,
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
    })
    if (!parsed.data.page || !parsed.data.pageSize) return res.json(result.items)
    return res.json(wrapPaginated(result.items, result.total!, parsed.data.page!, parsed.data.pageSize!))
  } catch (err) { next(err) }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = ProjectSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
    const out = await svc.createProject(parsed.data)
    res.status(201).json(out)
  } catch (err) { next(err) }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const p = await svc.getProject(req.params.id)
    res.json(p)
  } catch (err) { next(err) }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = ProjectSchema.partial().safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
    const p = await svc.updateProject(req.params.id, parsed.data)
    res.json(p)
  } catch (err) { next(err) }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const out = await svc.deleteProject(req.params.id)
    res.json(out)
  } catch (err) { next(err) }
}
