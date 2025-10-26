import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { UserCreateSchema, UserUpdateSchema } from '../utils/validators.js';

const router = Router();

// List users (admin)
router.get('/', requireAuth, requireRole('admin'), async (_req, res) => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json(users);
});

// Create user (admin)
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const parsed = UserCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, name, role, password } = parsed.data;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Email already exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, name, role, passwordHash });
  res.status(201).json({ id: user._id, email: user.email, name: user.name, role: user.role, disabled: user.disabled });
});

// Update user (admin)
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const parsed = UserUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const patch: any = { ...parsed.data };
  if (patch.password) {
    patch.passwordHash = await bcrypt.hash(patch.password, 10);
    delete patch.password;
  }
  const updated = await User.findByIdAndUpdate(req.params.id, patch, { new: true }).select('-passwordHash');
  res.json(updated);
});

// Delete user (admin) – soft delete by disabling
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { disabled: true });
  res.json({ ok: true });
});

export default router;

