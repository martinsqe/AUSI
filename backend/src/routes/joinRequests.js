import { Router } from 'express'
import { submit, list, accept, decline } from '../controllers/joinRequests.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
const isStaff = requireRole('exec', 'admin', 'chapter_president')

router.post('/',             submit)                      // public — anyone submits a request
router.get('/',              requireAuth, isStaff, list)  // admin/president/exec
router.patch('/:id/accept',  requireAuth, isStaff, accept)
router.patch('/:id/decline', requireAuth, isStaff, decline)

export default router
