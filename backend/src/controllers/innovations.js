import { query } from '../db/index.js'

try {
  await query(`
    CREATE TABLE IF NOT EXISTS innovations (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      student_name TEXT NOT NULL,
      university   TEXT NOT NULL,
      photo_url    TEXT,
      description  TEXT NOT NULL,
      project_link TEXT,
      images       TEXT[],
      created_at   TIMESTAMPTZ DEFAULT now()
    )
  `)
} catch (err) {
  console.error('[innovations] table setup failed:', err.message)
}

export async function getAll(_req, res, next) {
  try {
    const { rows } = await query(
      `SELECT * FROM innovations ORDER BY created_at DESC`
    )
    res.json({ data: rows })
  } catch (err) { next(err) }
}

export async function create(req, res, next) {
  try {
    const { student_name, university, photo_url, description, project_link, images } = req.body
    if (!student_name || !university || !description)
      return res.status(400).json({ error: 'student_name, university and description are required' })

    const { rows } = await query(
      `INSERT INTO innovations (student_name, university, photo_url, description, project_link, images)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [student_name, university, photo_url || null, description, project_link || null, images || null]
    )
    res.status(201).json({ data: rows[0] })
  } catch (err) { next(err) }
}

export async function update(req, res, next) {
  try {
    const allowed = ['student_name','university','photo_url','description','project_link','images']
    const fields = []
    const vals   = []
    let   idx    = 1
    for (const key of allowed) {
      if (key in req.body) { fields.push(`${key} = $${idx++}`); vals.push(req.body[key]) }
    }
    if (!fields.length) return res.status(400).json({ error: 'No valid fields to update' })
    vals.push(req.params.id)
    const { rows } = await query(
      `UPDATE innovations SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      vals
    )
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    res.json({ data: rows[0] })
  } catch (err) { next(err) }
}

export async function remove(req, res, next) {
  try {
    const { rows } = await query(
      `DELETE FROM innovations WHERE id = $1 RETURNING id`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
}
