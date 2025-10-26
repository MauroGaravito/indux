import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { LoginSchema } from '../utils/validators.js';
import { User } from '../models/User.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../services/tokens.js';

const router = Router();

router.post('/login', async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = signAccessToken({ _id: (user as any).id as string, role: user.role });
  const refreshToken = signRefreshToken({ _id: (user as any).id as string, role: user.role });
  res.json({ accessToken, refreshToken, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
});

router.post('/refresh', async (req, res) => {
  const schema = z.object({ refreshToken: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const payload = verifyRefreshToken(parsed.data.refreshToken);
    const accessToken = signAccessToken({ _id: payload.sub, role: payload.role });
    res.json({ accessToken });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

export default router;
