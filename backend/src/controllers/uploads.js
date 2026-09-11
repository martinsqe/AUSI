import { query } from '../db/index.js'

// One-time schema setup (runs at startup, never per-request)
try {
  await query(`
    CREATE TABLE IF NOT EXISTS uploaded_files (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      filename   TEXT,
      mime_type  TEXT NOT NULL,
      data       BYTEA NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `)
} catch (err) {
  console.error('[uploads] table setup failed:', err.message)
}

// Persist an uploaded image to Postgres (survives redeploys, unlike disk)
// and hand back an absolute URL so it resolves correctly from any frontend
// origin (Vercel), not just the backend's own.
export async function create(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const { rows } = await query(
      `INSERT INTO uploaded_files (filename, mime_type, data) VALUES ($1,$2,$3) RETURNING id`,
      [req.file.originalname || null, req.file.mimetype, req.file.buffer],
    )
    const base = `${req.protocol}://${req.get('host')}`
    res.json({ url: `${base}/api/uploads/${rows[0].id}`, id: rows[0].id })
  } catch (err) { next(err) }
}

// Public — these are showcase images referenced from public pages
export async function serve(req, res, next) {
  try {
    const { rows } = await query('SELECT mime_type, data FROM uploaded_files WHERE id = $1', [req.params.id])
    if (!rows.length) return res.status(404).end()
    res.setHeader('Content-Type', rows[0].mime_type || 'application/octet-stream')
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.send(rows[0].data)
  } catch (err) { next(err) }
}
