import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getAll, create, update, remove } from '../controllers/innovations.js'

const router = Router()

router.get('/',       getAll)
router.post('/',      requireAuth, create)
router.put('/:id',   requireAuth, update)
router.delete('/:id', requireAuth, remove)

export default router
