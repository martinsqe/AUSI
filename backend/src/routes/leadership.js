import { Router } from 'express'
import { getCurrent } from '../controllers/leadership.js'

const router = Router()

router.get('/', getCurrent)

export default router
