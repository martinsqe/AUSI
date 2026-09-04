import { query } from '../db/index.js'

const VALID_ROLES = ['student', 'alumni', 'exec', 'chapter_president', 'patron', 'admin', 'university_rep']

export async function updateRole(req, res, next) {
  try {
    const { role } = req.body
    if (!VALID_ROLES.includes(role)) return res.status(400).json({ error: 'Invalid role' })
    const { rows } = await query(
      `UPDATE members SET role = $1, updated_at = now() WHERE id = $2
       RETURNING id, full_name, email, role`,
      [role, req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Member not found' })
    res.json({ data: rows[0] })
  } catch (err) { next(err) }
}

export async function toggleVerify(req, res, next) {
  try {
    const { rows } = await query(
      `UPDATE members SET is_verified = NOT is_verified, updated_at = now() WHERE id = $1
       RETURNING id, full_name, email, is_verified`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Member not found' })
    res.json({ data: rows[0] })
  } catch (err) { next(err) }
}

export async function updateProfile(req, res, next) {
  try {
    const { full_name, phone, field_of_study, university_id, university_name } = req.body
    const { rows } = await query(
      `UPDATE members
       SET full_name       = COALESCE($1, full_name),
           phone           = COALESCE($2, phone),
           field_of_study  = COALESCE($3, field_of_study),
           university_id   = $4,
           university_name = COALESCE($5, university_name),
           updated_at      = now()
       WHERE id = $6
       RETURNING id, full_name, phone, field_of_study, university_id, university_name`,
      [full_name || null, phone || null, field_of_study || null, university_id || null, university_name || null, req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Member not found' })
    res.json({ data: rows[0] })
  } catch (err) { next(err) }
}

export async function deleteMember(req, res, next) {
  try {
    const { id } = req.params
    // Prevent self-deletion
    if (String(id) === String(req.user.id)) {
      return res.status(403).json({ error: 'You cannot delete your own account.' })
    }
    const { rows } = await query(
      `DELETE FROM members WHERE id = $1 RETURNING id, full_name, email`,
      [id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Member not found' })

    // Remove all join request history so they can apply fresh
    await query(`DELETE FROM join_requests WHERE email = $1`, [rows[0].email])

    res.json({ data: rows[0] })
  } catch (err) {
    if (err.code === '23503') {
      // FK violation — member has related records; cascade-delete them first
      next(Object.assign(err, { message: 'Cannot delete: member has related records. Remove their data first.' }))
    } else {
      next(err)
    }
  }
}

export async function getAll(req, res, next) {
  try {
    const { university_id, state } = req.query
    let sql = `
      SELECT m.id, m.full_name, m.email, m.phone, m.role, m.year_of_study, m.field_of_study,
             m.avatar_url, m.joined_at, m.is_verified,
             COALESCE(u.name, m.university_name) AS university_name, u.city, u.state
      FROM members m
      LEFT JOIN universities u ON m.university_id = u.id
      WHERE m.is_verified = true
    `
    const params = []
    if (university_id) { params.push(university_id); sql += ` AND m.university_id = $${params.length}` }
    if (state)         { params.push(state);          sql += ` AND u.state = $${params.length}` }
    sql += ' ORDER BY m.joined_at DESC'
    const { rows } = await query(sql, params)
    res.json({ data: rows })
  } catch (err) { next(err) }
}
