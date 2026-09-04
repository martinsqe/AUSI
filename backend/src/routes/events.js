import { Router } from 'express'
import { getAll, getById, register, create, update, remove } from '../controllers/events.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

const isStaff = requireRole('exec', 'admin', 'chapter_president')

router.get('/',              getAll)
router.post('/',             requireAuth, isStaff, create)
router.get('/:id',           getById)
router.patch('/:id',         requireAuth, isStaff, update)
router.delete('/:id',        requireAuth, isStaff, remove)
router.post('/:id/register', requireAuth, register)

export default router
