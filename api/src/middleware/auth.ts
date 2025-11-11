import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export interface AuthPayload {
  sub: string;
  role: 'admin' | 'manager' | 'worker';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as AuthPayload;
    // Fetch user to enforce status/disabled and avoid trusting client role blindly
    const user = await User.findById(payload.sub).lean();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (user.disabled || user.status !== 'approved' || !user.emailVerified) {
      return res.status(403).json({ error: user.disabled ? 'Account disabled' : (user.status !== 'approved' ? 'Account pending approval' : 'Email not verified') });
    }
    req.user = { sub: String(user._id), role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(...roles: Array<'admin'|'manager'|'worker'>) {
  return function(req: Request, res: Response, next: NextFunction) {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
