import { Router } from 'express'
import { register, login, me, updateProfile, changePassword } from '../controllers/auth.js'
import { requestOtp, resetPassword } from '../controllers/passwordReset.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/register',         register)
router.post('/login',            login)
router.get('/me',                requireAuth, me)
router.patch('/profile',         requireAuth, updateProfile)
router.post('/change-password',  requireAuth, changePassword)
router.post('/forgot-password',  requestOtp)
router.post('/reset-password',   resetPassword)

export default router
