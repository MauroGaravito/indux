import jwt from 'jsonwebtoken';
import type { SignOptions, JwtPayload } from 'jsonwebtoken';

type Role = 'admin'|'manager'|'worker';
type UploadAccessPayload = JwtPayload & { key: string; filename?: string; purpose: 'upload-access' };

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

export function signUploadAccessToken(payload: { key: string; filename?: string }) {
  const expiresIn = (process.env.UPLOAD_URL_TTL || '10m') as SignOptions['expiresIn'];
  const secret = process.env.UPLOAD_URL_SECRET || process.env.JWT_ACCESS_SECRET || 'devaccesssecretchangeme';
  return jwt.sign({ ...payload, purpose: 'upload-access' }, secret, { expiresIn });
}

export function verifyUploadAccessToken(token: string) {
  const secret = process.env.UPLOAD_URL_SECRET || process.env.JWT_ACCESS_SECRET || 'devaccesssecretchangeme';
  return jwt.verify(token, secret) as UploadAccessPayload;
}
