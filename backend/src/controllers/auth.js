import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../db/index.js'

function sign(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

export async function register(req, res, next) {
  try {
    const { email, password, full_name, phone, university_id, field_of_study, arrival_date } = req.body
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'email, password and full_name are required' })
    }
    const exists = await query('SELECT id FROM members WHERE email = $1', [email])
    if (exists.rows.length) return res.status(409).json({ error: 'Email already registered' })

    const hash = await bcrypt.hash(password, 12)
    const { rows } = await query(
      `INSERT INTO members
         (email, password_hash, full_name, phone, university_id, field_of_study, arrival_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, email, full_name, role, phone, field_of_study, arrival_date, joined_at`,
      [email, hash, full_name, phone || null, university_id || null, field_of_study || null, arrival_date || null]
    )
    const user = rows[0]
    res.status(201).json({ token: sign(user), user })
  } catch (err) { next(err) }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })

    const { rows } = await query(
      `SELECT m.*, COALESCE(u.name, m.university_name) AS university_name
       FROM members m LEFT JOIN universities u ON m.university_id = u.id
       WHERE m.email = $1`,
      [email]
    )
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' })

    const user = rows[0]
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const { password_hash: _, ...safe } = user
    res.json({ token: sign(safe), user: safe })
  } catch (err) { next(err) }
}

export async function me(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT m.id, m.email, m.full_name, m.role, m.year_of_study, m.field_of_study,
              m.phone, m.avatar_url, m.bio, m.is_verified, m.joined_at,
              m.arrival_date, m.created_at,
              COALESCE(u.name, m.university_name) AS university_name, u.city, u.state
       FROM members m LEFT JOIN universities u ON m.university_id = u.id
       WHERE m.id = $1`,
      [req.user.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'User not found' })
    res.json({ user: rows[0] })
  } catch (err) { next(err) }
}

export async function updateProfile(req, res, next) {
  try {
    const { full_name, phone, field_of_study, arrival_date } = req.body
    await query(
      `UPDATE members
       SET full_name = COALESCE($1, full_name),
           phone = $2,
           field_of_study = $3,
           arrival_date = $4
       WHERE id = $5`,
      [full_name || null, phone || null, field_of_study || null, arrival_date || null, req.user.id]
    )
    const { rows } = await query(
      `SELECT m.id, m.email, m.full_name, m.role, m.phone, m.field_of_study,
              m.arrival_date, m.is_verified, m.joined_at, m.created_at,
              COALESCE(u.name, m.university_name) AS university_name, u.city, u.state
       FROM members m LEFT JOIN universities u ON m.university_id = u.id
       WHERE m.id = $1`,
      [req.user.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'User not found' })
    res.json({ user: rows[0] })
  } catch (err) { next(err) }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' })
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' })
    }
    const { rows } = await query('SELECT password_hash FROM members WHERE id = $1', [req.user.id])
    if (!rows.length) return res.status(404).json({ error: 'User not found' })

    const ok = await bcrypt.compare(currentPassword, rows[0].password_hash)
    if (!ok) return res.status(401).json({ error: 'Current password is incorrect' })

    const hash = await bcrypt.hash(newPassword, 12)
    await query('UPDATE members SET password_hash = $1 WHERE id = $2', [hash, req.user.id])
    res.json({ message: 'Password updated successfully' })
  } catch (err) { next(err) }
}
