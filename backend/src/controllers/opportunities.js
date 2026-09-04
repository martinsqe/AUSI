import { query } from '../db/index.js'

export async function getAll(req, res, next) {
  try {
    const { type, state } = req.query
    let sql = 'SELECT * FROM opportunities WHERE is_published = true'
    const params = []
    if (type)  { params.push(type);  sql += ` AND type = $${params.length}` }
    if (state) { params.push(state); sql += ` AND state = $${params.length}` }
    sql += ' ORDER BY deadline ASC NULLS LAST'
    const { rows } = await query(sql, params)
    res.json({ data: rows })
  } catch (err) { next(err) }
}

export async function getById(req, res, next) {
  try {
    const { rows } = await query('SELECT * FROM opportunities WHERE id = $1', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    res.json({ data: rows[0] })
  } catch (err) { next(err) }
}
