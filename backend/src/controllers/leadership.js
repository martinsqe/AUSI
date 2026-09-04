import { query } from '../db/index.js'

export async function getCurrent(req, res, next) {
  try {
    const { rows } = await query(`
      SELECT l.*,
             m.full_name, m.avatar_url, m.bio,
             u.name AS university_name, u.city, u.state
      FROM leadership l
      JOIN members m ON l.member_id = m.id
      LEFT JOIN universities u ON m.university_id = u.id
      WHERE l.is_current = true
      ORDER BY
        CASE l.scope WHEN 'national' THEN 0 ELSE 1 END,
        l.position
    `)
    res.json({ data: rows })
  } catch (err) { next(err) }
}
