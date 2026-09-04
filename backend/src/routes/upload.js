import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { uploadPhoto } from '../middleware/upload.js'

const router = Router()

router.post('/photo', requireAuth, uploadPhoto.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  res.json({ url: `/uploads/${req.file.filename}` })
})

export default router
