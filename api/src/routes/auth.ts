import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { LoginSchema, RegisterSchema } from '../utils/validators.js';
import { User } from '../models/User.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken, signEmailToken, verifyEmailToken } from '../services/tokens.js';
import { sendMail } from '../services/mailer.js';

const router = Router();

router.post('/login', async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  if (user.disabled || user.status === 'disabled') return res.status(403).json({ error: 'Account disabled' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  if (!user.emailVerified) return res.status(403).json({ error: 'Email not verified' });
  if (user.status !== 'approved') return res.status(403).json({ error: 'Account pending approval' });

  user.lastLoginAt = new Date();
  await user.save();

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

// Public worker registration
router.post('/register', async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, name, password } = parsed.data;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Email already exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, name, role: 'worker', password: passwordHash, status: 'pending', emailVerified: false });
  try {
    const token = signEmailToken(String(user._id));
    const verifyUrl = `${process.env.FRONTEND_URL?.split(',')[0] || 'http://localhost:5173'}/login?verify=${token}`;
    await sendMail({ to: email, subject: 'Verify your email', text: `Click to verify: ${verifyUrl}` });
  } catch {}
  res.status(201).json({ ok: true });
});

// Verify email (accepts POST { token } or GET ?token=)
router.post('/verify-email', async (req, res) => {
  const schema = z.object({ token: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const payload = verifyEmailToken(parsed.data.token);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(400).json({ error: 'Invalid token' });
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: 'Invalid token' });
  }
});

router.get('/verify-email', async (req, res) => {
  const token = String(req.query.token || '');
  if (!token) return res.status(400).json({ error: 'Missing token' });
  try {
    const payload = verifyEmailToken(token);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(400).json({ error: 'Invalid token' });
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: 'Invalid token' });
  }
});

router.post('/resend-verification', async (req, res) => {
  const schema = z.object({ email: z.string().email() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = await User.findOne({ email: parsed.data.email });
  if (!user) return res.status(404).json({ error: 'Not found' });
  if (user.emailVerified) return res.json({ ok: true });
  try {
    const token = signEmailToken(String(user._id));
    const verifyUrl = `${process.env.FRONTEND_URL?.split(',')[0] || 'http://localhost:5173'}/login?verify=${token}`;
    await sendMail({ to: user.email, subject: 'Verify your email', text: `Click to verify: ${verifyUrl}` });
  } catch {}
  res.json({ ok: true });
});

export default router;
