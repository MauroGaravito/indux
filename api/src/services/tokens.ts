import jwt from 'jsonwebtoken';
import type { SignOptions, JwtPayload } from 'jsonwebtoken';

type Role = 'admin'|'manager'|'worker';

export function signAccessToken(user: { _id: string; role: Role }) {
  const expiresIn = (process.env.ACCESS_TOKEN_TTL || '15m') as SignOptions['expiresIn'];
  const secret = (process.env.JWT_ACCESS_SECRET || 'devaccesssecretchangeme');
  return jwt.sign({ sub: user._id, role: user.role }, secret, { expiresIn });
}

export function signRefreshToken(user: { _id: string; role: Role }) {
  const expiresIn = (process.env.REFRESH_TOKEN_TTL || '7d') as SignOptions['expiresIn'];
  const secret = (process.env.JWT_REFRESH_SECRET || 'devrefreshsecretchangeme');
  return jwt.sign({ sub: user._id, role: user.role }, secret, { expiresIn });
}

export function verifyRefreshToken(token: string) {
  const secret = (process.env.JWT_REFRESH_SECRET || 'devrefreshsecretchangeme');
  return jwt.verify(token, secret) as JwtPayload & { sub: string; role: Role };
}

export function signEmailToken(userId: string) {
  const expiresIn = (process.env.EMAIL_TOKEN_TTL || '1d') as SignOptions['expiresIn'];
  const secret = (process.env.JWT_EMAIL_SECRET || 'devemailsecretchangeme');
  return jwt.sign({ sub: userId }, secret, { expiresIn });
}

export function verifyEmailToken(token: string) {
  const secret = (process.env.JWT_EMAIL_SECRET || 'devemailsecretchangeme');
  return jwt.verify(token, secret) as JwtPayload & { sub: string };
}
