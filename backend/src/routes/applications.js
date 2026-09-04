import { Router } from 'express'
import { submit, getAll, getById, updateStatus } from '../controllers/applications.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

const isStaff = requireRole('exec', 'admin', 'chapter_president')

router.post('/',               submit)
router.get('/',                requireAuth, isStaff, getAll)
router.get('/:id',             requireAuth, isStaff, getById)
router.patch('/:id/status',    requireAuth, isStaff, updateStatus)

export default router
