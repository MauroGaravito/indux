import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createBrandConfig, getBrandConfig, updateBrandConfig } from '../controllers/brandConfigController.js';

const router = Router();

// Public read endpoint (branding can be read by any client/UI)
router.get('/', getBrandConfig);

// Admin-only writes
router.post('/', requireAuth, requireRole('admin'), createBrandConfig);
router.put('/:id', requireAuth, requireRole('admin'), updateBrandConfig);

export default router;

