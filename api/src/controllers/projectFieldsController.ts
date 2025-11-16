import type { Request, Response, NextFunction } from 'express';
import * as svc from '../services/projectFieldsService.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const fields = await svc.listFields(req.params.projectId);
    res.json(fields);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = { ...req.body, projectId: req.params.projectId, step: req.body?.step || 'personal' };
    const field = await svc.createField(payload, req.user!);
    res.status(201).json(field);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const field = await svc.updateField(req.params.id, req.body, req.user!);
    res.json(field);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const outcome = await svc.deleteField(req.params.id, req.user!);
    res.json(outcome);
  } catch (err) { next(err); }
}
