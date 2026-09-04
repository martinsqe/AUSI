import { Router } from 'express'
import { getAll, getById, getChapterSummary, getStats } from '../controllers/universities.js'

const router = Router()

router.get('/',         getAll)
router.get('/stats',    getStats)
router.get('/chapters', getChapterSummary)
router.get('/:id',      getById)

export default router
