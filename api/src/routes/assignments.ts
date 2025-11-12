import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import * as controller from '../controllers/assignmentsController.js'

const router = Router()

// Create assignment (admin or manager)
router.post('/', requireAuth, requireRole('admin', 'manager'), controller.create)

// List projects for a user (respect caller perms)
router.get('/user/:id', requireAuth, requireRole('admin', 'manager', 'worker'), controller.listByUser)

// List users in a project
router.get('/project/:id', requireAuth, requireRole('admin', 'manager'), controller.listByProject)

// Delete assignment
router.delete('/:id', requireAuth, requireRole('admin', 'manager'), controller.remove)

// Manager team across all managed projects
router.get('/manager/:id/team', requireAuth, requireRole('admin', 'manager'), controller.listManagerTeam)

export default router

