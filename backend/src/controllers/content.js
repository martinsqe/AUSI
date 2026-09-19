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

// ── One-time (idempotent) seed merge for 'universities' ────────────────────
// The saved content in the DB is what the Join form actually reads — code
// changes to the frontend's default list never reach it once an admin has
// saved anything. This merges in any canonical university missing from the
// saved list (by name) and fixes a known bad manual entry (wrong region),
// without touching anything else an admin has customised (images, fields,
// descriptions, positions). Safe to re-run on every boot — once everything
// is present it's a no-op.
const CANONICAL_UNIVERSITIES = [
  { name: 'RK University', city: 'Rajkot', region: 'West India' },
  { name: 'Gujarat University', city: 'Ahmedabad', region: 'West India' },
  { name: 'Marwadi University', city: 'Rajkot', region: 'West India' },
  { name: 'Parul University', city: 'Vadodara', region: 'West India' },
  { name: 'Symbiosis International University', city: 'Pune', region: 'West India' },
  { name: 'DY Patil University', city: 'Pune', region: 'West India' },
  { name: 'Savitribai Phule Pune University', city: 'Pune', region: 'West India' },
  { name: 'Mumbai University', city: 'Mumbai', region: 'West India' },
  { name: 'Bharati Vidyapeeth University', city: 'Pune', region: 'West India' },
  { name: 'MATS University', city: 'Raipur', region: 'West India' },
  { name: 'GITAM University', city: 'Visakhapatnam', region: 'South India' },
  { name: 'Andhra University', city: 'Visakhapatnam', region: 'South India' },
  { name: 'KL University', city: 'Vijayawada', region: 'South India' },
  { name: "Vignan's Foundation University", city: 'Guntur', region: 'South India' },
  { name: 'University of Hyderabad', city: 'Hyderabad', region: 'South India' },
  { name: 'Osmania University', city: 'Hyderabad', region: 'South India' },
  { name: 'BITS Pilani Hyderabad', city: 'Hyderabad', region: 'South India' },
  { name: 'IIT Hyderabad', city: 'Hyderabad', region: 'South India' },
  { name: 'Cochin University of Science and Technology', city: 'Kochi', region: 'South India' },
  { name: 'Kerala University', city: 'Thiruvananthapuram', region: 'South India' },
  { name: 'SRM University', city: 'Chennai', region: 'South India' },
  { name: 'Saveetha University', city: 'Chennai', region: 'South India' },
  { name: 'REVA University', city: 'Bengaluru', region: 'South India' },
  { name: 'Christ University', city: 'Bengaluru', region: 'South India' },
  { name: 'Manipal Academy of Higher Education', city: 'Manipal', region: 'South India' },
  { name: 'PES University', city: 'Bengaluru', region: 'South India' },
  { name: 'VIT University', city: 'Vellore', region: 'South India' },
  { name: 'Royal Global University', city: 'Guwahati', region: 'East India' },
  { name: 'Gauhati University', city: 'Guwahati', region: 'East India' },
  { name: 'KIIT University', city: 'Bhubaneswar', region: 'East India' },
  { name: 'Delhi University', city: 'New Delhi', region: 'North India' },
  { name: 'IIT Delhi', city: 'New Delhi', region: 'North India' },
  { name: 'AIIMS New Delhi', city: 'New Delhi', region: 'North India' },
  { name: 'Jamia Millia Islamia', city: 'New Delhi', region: 'North India' },
  { name: 'Amity University', city: 'Noida', region: 'North India' },
  { name: 'Lovely Professional University', city: 'Phagwara', region: 'North India' },
  { name: 'Sharda University', city: 'Greater Noida', region: 'North India' },
  { name: 'Chandigarh University', city: 'Chandigarh', region: 'North India' },
  { name: 'Graphic Era University', city: 'Dehradun', region: 'North India' },
  { name: 'LNCT University', city: 'Bhopal', region: 'North India' },
  { name: 'University of Lucknow', city: 'Lucknow', region: 'North India' },
]

// Old names already saved under a different spelling than the canonical
// list — renamed in place rather than left as a near-duplicate entry.
const RENAME_ALIASES = {
  'aiims': 'AIIMS New Delhi',
  'srm institute of science and technology': 'SRM University',
}
const richness = (u) => ['imageUrl', 'description', 'website', 'position', 'fields']
  .filter((k) => u && u[k] && (!Array.isArray(u[k]) || u[k].length)).length

try {
  const { rows } = await query(`SELECT data FROM site_content WHERE key = 'universities'`)
  if (rows.length) {
    let list = Array.isArray(rows[0].data) ? rows[0].data : []
    let changed = false

    // Fix the one known bad manual entry: wrong region + inconsistent casing
    list = list.map((u) => {
      if (u && typeof u.name === 'string' && u.name.trim().toLowerCase() === 'mats university'
          && (u.name !== 'MATS University' || u.region !== 'West India')) {
        changed = true
        return { ...u, name: 'MATS University', region: 'West India' }
      }
      return u
    })

    // Rename known aliases to their canonical spelling
    list = list.map((u) => {
      if (!u || typeof u.name !== 'string') return u
      const canonical = RENAME_ALIASES[u.name.trim().toLowerCase()]
      if (canonical && u.name !== canonical) { changed = true; return { ...u, name: canonical } }
      return u
    })

    // De-duplicate by name (renames above can produce two entries for the
    // same university) — keep whichever copy has more admin customisation
    const named = list.filter((u) => u && u.name)
    const unnamed = list.filter((u) => !u || !u.name)
    const byName = new Map()
    for (const u of named) {
      const key = u.name.trim().toLowerCase()
      const prev = byName.get(key)
      if (!prev || richness(u) > richness(prev)) byName.set(key, u)
    }
    if (byName.size !== named.length) changed = true
    list = [...byName.values(), ...unnamed]

    const existingNames = new Set(
      list.filter((u) => u && u.name).map((u) => u.name.trim().toLowerCase()),
    )
    let nextId = Date.now()
    for (const uni of CANONICAL_UNIVERSITIES) {
      if (!existingNames.has(uni.name.toLowerCase())) {
        list.push({ id: nextId++, ...uni })
        existingNames.add(uni.name.toLowerCase())
        changed = true
      }
    }

    if (changed) {
      await query(
        `UPDATE site_content SET data = $1::jsonb, updated_at = now(), updated_by = 'system:seed'
         WHERE key = 'universities'`,
        [JSON.stringify(list)],
      )
      console.log(`[content] universities seed merge applied — ${list.length} total`)
    }
  }

  // Any records already saved against a mis-typed/renamed entry should
  // follow the correction, not stay orphaned under the old name.
  const renameMap = {
    'Mats University': 'MATS University',
    'AIIMS': 'AIIMS New Delhi',
    'SRM Institute of Science and Technology': 'SRM University',
  }
  let totalFixed = 0
  for (const [oldName, newName] of Object.entries(renameMap)) {
    const r1 = await query(`UPDATE members SET university_name = $1 WHERE university_name = $2`, [newName, oldName])
    const r2 = await query(`UPDATE join_requests SET university_name = $1 WHERE university_name = $2`, [newName, oldName])
    totalFixed += r1.rowCount + r2.rowCount
  }
  if (totalFixed > 0) {
    console.log(`[content] corrected university_name on ${totalFixed} record(s)`)
  }
} catch (err) {
  console.error('[content] universities seed merge failed:', err.message)
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
// Per-key override — universities editing is admin-only, not the broader staff set
const KEY_ROLES = { universities: ['admin'] }
const MAX_BYTES = 6 * 1024 * 1024

// Called from the join-request flow when an applicant types a university
// that isn't in the dropdown. Appends it to the shared 'universities'
// content (so it shows on every dashboard and the public page right away)
// under a placeholder region for admin to fix up. Returns true only when a
// genuinely new entry was added, so the caller knows whether to notify admin.
export async function addUniversityIfNew(rawName) {
  const name = String(rawName || '').trim()
  if (!name) return false
  try {
    const { rows } = await query(`SELECT data FROM site_content WHERE key = 'universities'`)
    const list = Array.isArray(rows[0]?.data) ? rows[0].data : []
    const exists = list.some((u) => u && typeof u.name === 'string' && u.name.trim().toLowerCase() === name.toLowerCase())
    if (exists) return false

    const next = [...list, { id: Date.now(), name, city: '', region: 'Central India' }]
    await query(
      `INSERT INTO site_content (key, data, updated_at, updated_by)
       VALUES ('universities', $1::jsonb, now(), 'system:join-request')
       ON CONFLICT (key) DO UPDATE
         SET data = EXCLUDED.data, updated_at = now(), updated_by = EXCLUDED.updated_by`,
      [JSON.stringify(next)],
    )
    return true
  } catch (err) {
    console.error('[content] addUniversityIfNew failed:', err.message)
    return false
  }
}

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
    if (STAFF_KEYS.has(key)) {
      const allowedRoles = KEY_ROLES[key] || STAFF_ROLES
      if (!allowedRoles.includes(req.user?.role)) {
        return res.status(403).json({ error: 'Not authorized to edit this content.' })
      }
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
