import { query } from '../db/index.js'

// One-time schema setup (runs at startup, never per-request)
try {
  await query(`
    CREATE TABLE IF NOT EXISTS site_content (
      key        VARCHAR(60) PRIMARY KEY,
      data       JSONB NOT NULL DEFAULT '[]'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT now(),
      updated_by VARCHAR(255)
    )
  `)
} catch (err) {
  console.error('[content] schema setup failed:', err.message)
}

// Staff-authored content — full replace, staff roles only
const STAFF_KEYS = new Set([
  'cabinet', 'universities', 'announcements', 'events', 'resources',
  'embassy', 'government', 'immigration', 'crisis',
])
// Member-submitted collections — any signed-in user may append; staff may replace
const MEMBER_KEYS = new Set(['feedback', 'anon_reports', 'rep_reports', 'marketplace'])

export const ALLOWED_KEYS = new Set([...STAFF_KEYS, ...MEMBER_KEYS])
const STAFF_ROLES = ['exec', 'admin', 'chapter_president']
const MAX_BYTES = 6 * 1024 * 1024

export async function getAll(_req, res, next) {
  try {
    const { rows } = await query('SELECT key, data FROM site_content')
    const out = {}
    for (const r of rows) out[r.key] = r.data
    res.json({ data: out })
  } catch (err) { next(err) }
}

export async function getOne(req, res, next) {
  try {
    const { key } = req.params
    if (!ALLOWED_KEYS.has(key)) return res.status(404).json({ error: 'Unknown content key' })
    const { rows } = await query('SELECT data, updated_at FROM site_content WHERE key = $1', [key])
    res.json({ data: rows[0]?.data ?? null, updated_at: rows[0]?.updated_at ?? null })
  } catch (err) { next(err) }
}

export async function putOne(req, res, next) {
  try {
    const { key } = req.params
    if (!ALLOWED_KEYS.has(key)) return res.status(404).json({ error: 'Unknown content key' })

    const isStaff = STAFF_ROLES.includes(req.user?.role)
    if (STAFF_KEYS.has(key) && !isStaff) {
      return res.status(403).json({ error: 'Staff only' })
    }

    const { data } = req.body || {}
    if (data === undefined) return res.status(400).json({ error: 'Missing "data"' })

    // Non-staff writes to a member collection may only ADD new entries (by id) —
    // they cannot modify or remove entries submitted by others.
    let finalData = data
    if (MEMBER_KEYS.has(key) && !isStaff && Array.isArray(data)) {
      const { rows } = await query('SELECT data FROM site_content WHERE key = $1', [key])
      const existing = Array.isArray(rows[0]?.data) ? rows[0].data : []
      const ids = new Set(existing.map((e) => e && e.id))
      const additions = data.filter((e) => e && !ids.has(e.id))
      finalData = [...existing, ...additions]
    }

    const json = JSON.stringify(finalData)
    if (json.length > MAX_BYTES) return res.status(413).json({ error: 'Content too large' })

    const { rows } = await query(
      `INSERT INTO site_content (key, data, updated_at, updated_by)
       VALUES ($1, $2::jsonb, now(), $3)
       ON CONFLICT (key) DO UPDATE
         SET data = EXCLUDED.data, updated_at = now(), updated_by = EXCLUDED.updated_by
       RETURNING data, updated_at`,
      [key, json, req.user?.email || req.user?.id || null],
    )
    res.json({ data: rows[0].data, updated_at: rows[0].updated_at })
  } catch (err) { next(err) }
}
