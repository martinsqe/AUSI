import { query } from '../db/index.js'

export async function getAll(req, res, next) {
  try {
    const { state, chapter } = req.query
    let sql = 'SELECT * FROM universities'
    const params = []
    const where = []
    if (state)   { params.push(state);   where.push(`state = $${params.length}`) }
    if (chapter) { params.push(chapter); where.push(`chapter = $${params.length}`) }
    if (where.length) sql += ' WHERE ' + where.join(' AND ')
    sql += ' ORDER BY state, member_count DESC'
    const { rows } = await query(sql, params)
    res.json({ data: rows })
  } catch (err) { next(err) }
}

export async function getById(req, res, next) {
  try {
    const { rows } = await query('SELECT * FROM universities WHERE id = $1', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    res.json({ data: rows[0] })
  } catch (err) { next(err) }
}

export async function getChapterSummary(req, res, next) {
  try {
    const { rows } = await query(`
      SELECT chapter, state,
             COUNT(*)::int        AS university_count,
             SUM(member_count)::int AS total_members,
             array_agg(name ORDER BY member_count DESC) AS universities
      FROM universities
      GROUP BY chapter, state
      ORDER BY total_members DESC
    `)
    res.json({ data: rows })
  } catch (err) { next(err) }
}

export async function getStats(req, res, next) {
  try {
    const { rows } = await query(`
      SELECT
        COUNT(*)::int               AS total_universities,
        SUM(member_count)::int      AS total_students,
        COUNT(DISTINCT state)::int  AS total_states,
        COUNT(DISTINCT chapter)::int AS total_chapters
      FROM universities
    `)
    res.json({ data: rows[0] })
  } catch (err) { next(err) }
}
