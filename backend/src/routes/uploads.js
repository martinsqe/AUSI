import { Router } from 'express'
import { serve } from '../controllers/uploads.js'

const router = Router()

router.get('/:id', serve)   // public — serves persisted upload bytes

export default router
