import { Router } from 'express'
import { getAll, updateRole, toggleVerify, updateProfile, deleteMember } from '../controllers/members.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

const isStaff = requireRole('exec', 'admin', 'chapter_president')

router.get('/',                    requireAuth, getAll)
router.patch('/:id/role',          requireAuth, isStaff, updateRole)
router.patch('/:id/verify',        requireAuth, isStaff, toggleVerify)
router.patch('/:id/profile',       requireAuth, isStaff, updateProfile)
router.delete('/:id',              requireAuth, isStaff, deleteMember)

export default router
