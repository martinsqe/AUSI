import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = path.join(__dirname, '../../uploads')

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`)
  },
})

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true)
  else cb(new Error('Only image files are allowed'), false)
}

export const uploadPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
})

// ── Join-request documents ────────────────────────────────────────────────
// Kept in memory so the controller can persist them to Postgres as BYTEA
// (Railway's container filesystem is wiped on every redeploy).
const pdfFilter = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true)
  else cb(new Error(`"${file.fieldname}" must be a PDF file`), false)
}

const _uploadJoinDocs = multer({
  storage: multer.memoryStorage(),
  fileFilter: pdfFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB per file
}).fields([
  { name: 'passport_photo',   maxCount: 1 },
  { name: 'admission_letter', maxCount: 1 },
  { name: 'passport',         maxCount: 1 },
  { name: 'visa',             maxCount: 1 },
])

// Wrap so multer errors return 400 (not the generic 500 error handler)
export function uploadJoinDocs(req, res, next) {
  _uploadJoinDocs(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE'
        ? 'Each document must be under 8 MB'
        : (err.message || 'File upload failed')
      return res.status(400).json({ error: msg })
    }
    next()
  })
}
