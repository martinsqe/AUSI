import { query } from '../db/index.js'

export async function getAll(req, res, next) {
  try {
    const { type, state, limit } = req.query
    let sql = `
      SELECT e.*, u.name AS university_name,
             COUNT(er.id)::int AS registrations
      FROM events e
      LEFT JOIN universities u     ON e.university_id = u.id
      LEFT JOIN event_registrations er ON er.event_id = e.id
      WHERE e.is_published = true
    `
    const params = []
    if (type)  { params.push(type);  sql += ` AND e.type = $${params.length}` }
    if (state) { params.push(state); sql += ` AND e.state = $${params.length}` }
    sql += ' GROUP BY e.id, u.name ORDER BY e.event_date ASC'
    if (limit) { params.push(parseInt(limit)); sql += ` LIMIT $${params.length}` }

    const { rows } = await query(sql, params)
    res.json({ data: rows })
  } catch (err) { next(err) }
}

export async function getById(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT e.*, u.name AS university_name,
              COUNT(er.id)::int AS registrations
       FROM events e
       LEFT JOIN universities u ON e.university_id = u.id
       LEFT JOIN event_registrations er ON er.event_id = e.id
       WHERE e.id = $1
       GROUP BY e.id, u.name`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    res.json({ data: rows[0] })
  } catch (err) { next(err) }
}

export async function register(req, res, next) {
  try {
    await query(
      'INSERT INTO event_registrations (event_id, member_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [req.params.id, req.user.id]
    )
    res.json({ message: 'Registered successfully' })
  } catch (err) { next(err) }
}

export async function create(req, res, next) {
  try {
    const { title, description, type, location_name, location_city, state,
            university_id, event_date, end_date, capacity, cost_inr, image_url, is_featured } = req.body
    if (!title || !event_date) return res.status(400).json({ error: 'title and event_date are required' })
    const { rows } = await query(`
      INSERT INTO events
        (title, description, type, location_name, location_city, state,
         university_id, event_date, end_date, capacity, cost_inr, image_url, is_featured)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *
    `, [title, description||null, type||'chapter', location_name||null, location_city||null,
        state||null, university_id||null, event_date, end_date||null,
        capacity||null, cost_inr||0, image_url||null, is_featured||false])
    res.status(201).json({ data: rows[0] })
  } catch (err) { next(err) }
}

export async function update(req, res, next) {
  try {
    const allowed = ['title','description','type','location_name','location_city','state',
                     'event_date','end_date','capacity','cost_inr','image_url','is_featured','is_published']
    const sets = []; const params = []
    allowed.forEach(f => {
      if (req.body[f] !== undefined) { params.push(req.body[f]); sets.push(`${f} = $${params.length}`) }
    })
    if (!sets.length) return res.status(400).json({ error: 'No fields to update' })
    params.push(req.params.id)
    const { rows } = await query(
      `UPDATE events SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`, params
    )
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    res.json({ data: rows[0] })
  } catch (err) { next(err) }
}

export async function remove(req, res, next) {
  try {
    const { rows } = await query('DELETE FROM events WHERE id = $1 RETURNING id', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Event deleted' })
  } catch (err) { next(err) }
}
