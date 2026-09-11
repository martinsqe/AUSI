import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { uploadPhoto } from '../middleware/upload.js'
import { create } from '../controllers/uploads.js'

const router = Router()

router.post('/photo', requireAuth, uploadPhoto.single('photo'), create)

export default router
