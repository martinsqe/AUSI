import { Router } from 'express'
import { getAll, getOne, putOne } from '../controllers/content.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/',      getAll)                 // public — bulk fetch for app bootstrap
router.get('/:key',  getOne)                 // public — single blob
router.put('/:key',  requireAuth, putOne)    // signed-in — role checks are per-key in the controller

export default router
