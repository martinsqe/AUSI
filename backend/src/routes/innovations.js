import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { getAll, create, update, remove } from '../controllers/innovations.js'

const router = Router()
const isStaff = requireRole('exec', 'admin', 'chapter_president')

router.get('/',       getAll)
router.post('/',      requireAuth, isStaff, create)
router.put('/:id',    requireAuth, isStaff, update)
router.delete('/:id', requireAuth, isStaff, remove)

export default router
