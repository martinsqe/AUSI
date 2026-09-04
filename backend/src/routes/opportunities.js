import { Router } from 'express'
import { getAll, getById } from '../controllers/opportunities.js'

const router = Router()

router.get('/',    getAll)
router.get('/:id', getById)

export default router
