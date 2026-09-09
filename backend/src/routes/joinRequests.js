import { Router } from 'express'
import { submit, list, accept, decline, getDocument } from '../controllers/joinRequests.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { uploadJoinDocs } from '../middleware/upload.js'

const router = Router()
const isStaff = requireRole('exec', 'admin', 'chapter_president')

router.post('/',             uploadJoinDocs, submit)          // public — anyone submits a request (multipart)
router.get('/',              requireAuth, isStaff, list)      // admin/president/exec
router.get('/:id/documents/:type', requireAuth, isStaff, getDocument)
router.patch('/:id/accept',  requireAuth, isStaff, accept)
router.patch('/:id/decline', requireAuth, isStaff, decline)

export default router
