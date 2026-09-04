import { Router } from 'express'
import { memberDashboard, adminDashboard, presidentDashboard, repDashboard } from '../controllers/dashboard.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/member',    requireAuth, memberDashboard)
router.get('/rep',       requireAuth, requireRole('university_rep', 'admin', 'chapter_president'), repDashboard)
router.get('/admin',     requireAuth, requireRole('exec', 'admin'), adminDashboard)
router.get('/president', requireAuth, requireRole('chapter_president', 'admin'), presidentDashboard)

export default router
