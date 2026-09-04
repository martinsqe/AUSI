import { query } from '../db/index.js'

export async function submit(req, res, next) {
  try {
    const { full_name, dob, nationality, phone, email, level, course, universities } = req.body
    if (!full_name || !email || !level || !course) {
      return res.status(400).json({ error: 'full_name, email, level and course are required' })
    }
    const { rows } = await query(`
      INSERT INTO applications (full_name, dob, nationality, phone, email, level, course, universities)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id, full_name, email, status, created_at
    `, [
      full_name,
      dob || null,
      nationality || 'Ugandan',
      phone || null,
      email,
      level,
      course,
      Array.isArray(universities) ? universities : [],
    ])
    res.status(201).json({ data: rows[0], message: 'Application submitted successfully' })
  } catch (err) { next(err) }
}

export async function getAll(req, res, next) {
  try {
    const { status } = req.query
    let sql = 'SELECT * FROM applications'
    const params = []
    if (status) { params.push(status); sql += ' WHERE status = $1' }
    sql += ' ORDER BY created_at DESC'
    const { rows } = await query(sql, params)
    res.json({ data: rows })
  } catch (err) { next(err) }
}

export async function getById(req, res, next) {
  try {
    const { rows } = await query('SELECT * FROM applications WHERE id = $1', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    res.json({ data: rows[0] })
  } catch (err) { next(err) }
}

export async function updateStatus(req, res, next) {
  try {
    const { status, notes } = req.body
    const valid = ['pending', 'reviewed', 'accepted', 'rejected']
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' })
    const { rows } = await query(`
      UPDATE applications SET status = $1, notes = COALESCE($2, notes), updated_at = now()
      WHERE id = $3 RETURNING *
    `, [status, notes || null, req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    res.json({ data: rows[0] })
  } catch (err) { next(err) }
}
