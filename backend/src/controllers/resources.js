import { query } from '../db/index.js'

export async function getAll(req, res, next) {
  try {
    const { category } = req.query
    let sql = 'SELECT * FROM resources'
    const params = []
    if (category) { params.push(category); sql += ' WHERE category = $1' }
    sql += ' ORDER BY category, created_at DESC'
    const { rows } = await query(sql, params)
    res.json({ data: rows })
  } catch (err) { next(err) }
}
