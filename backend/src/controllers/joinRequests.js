import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { query } from '../db/index.js'
import { sendWelcomeEmail } from '../lib/email.js'

// Run once at startup — never per-request
try {
  await query(`
    CREATE TABLE IF NOT EXISTS join_requests (
      id              SERIAL PRIMARY KEY,
      full_name       VARCHAR(255) NOT NULL,
      email           VARCHAR(255) NOT NULL,
      phone           VARCHAR(50),
      university_id   UUID,
      university_name VARCHAR(255),
      field_of_study  VARCHAR(255),
      message         TEXT,
      status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
      created_at      TIMESTAMPTZ DEFAULT now(),
      updated_at      TIMESTAMPTZ DEFAULT now()
    )
  `)
} catch (err) {
  console.error('[joinRequests] table setup failed:', err.message)
}

export async function submit(req, res, next) {
  try {
    const { full_name, email, phone, university_name, field_of_study, message } = req.body
    if (!full_name || !email) {
      return res.status(400).json({ error: 'full_name and email are required' })
    }

    // Block duplicate requests
    const existingReq = await query('SELECT id, status FROM join_requests WHERE email = $1', [email])
    if (existingReq.rows.length) {
      const { status } = existingReq.rows[0]
      if (status === 'pending')  return res.status(409).json({ error: 'A request with this email is already awaiting review.' })
      if (status === 'accepted') return res.status(409).json({ error: 'This email has already been approved. Please log in.' })
      // declined — allow re-submission
      const { rows } = await query(
        `UPDATE join_requests
         SET full_name=$1, phone=$2, university_name=$3, field_of_study=$4,
             message=$5, status='pending', updated_at=now()
         WHERE email=$6
         RETURNING id, full_name, email, status, created_at`,
        [full_name, phone||null, university_name||null, field_of_study||null, message||null, email]
      )
      return res.status(201).json({ data: rows[0] })
    }

    // Block if account already exists
    const existing = await query('SELECT id FROM members WHERE email = $1', [email])
    if (existing.rows.length) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' })
    }

    const { university_id } = req.body
    const { rows } = await query(
      `INSERT INTO join_requests (full_name, email, phone, university_id, university_name, field_of_study, message)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, full_name, email, status, created_at`,
      [full_name, email, phone||null, university_id||null, university_name||null, field_of_study||null, message||null]
    )
    res.status(201).json({ data: rows[0] })
  } catch (err) { next(err) }
}

export async function list(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT * FROM join_requests ORDER BY
         CASE status WHEN 'pending' THEN 0 WHEN 'accepted' THEN 1 ELSE 2 END,
         created_at DESC`
    )
    res.json({ data: rows })
  } catch (err) { next(err) }
}

export async function accept(req, res, next) {
  try {
    const { rows } = await query('SELECT * FROM join_requests WHERE id = $1', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Request not found' })

    const jReq = rows[0]
    if (jReq.status === 'accepted') {
      return res.status(409).json({ error: 'Already accepted' })
    }

    // If account already exists, just mark as accepted
    const existing = await query('SELECT id FROM members WHERE email = $1', [jReq.email])
    if (existing.rows.length) {
      await query(`UPDATE join_requests SET status='accepted', updated_at=now() WHERE id=$1`, [req.params.id])
      return res.json({ message: 'Request accepted (account already existed)', user: { id: existing.rows[0].id } })
    }

    // Use university_id from join request directly (saved when student submitted form)
    // If not present (older requests), try to look up by name
    let university_id = jReq.university_id || null
    if (!university_id && jReq.university_name) {
      const namePart = jReq.university_name.split(',')[0].trim()
      const uniRes = await query(
        `SELECT id FROM universities WHERE LOWER(name) LIKE LOWER($1) LIMIT 1`,
        [`%${namePart}%`]
      )
      university_id = uniRes.rows[0]?.id || null
    }

    // Generate temporary password
    const password = crypto.randomBytes(5).toString('hex')
    const hash = await bcrypt.hash(password, 12)

    // Create member — is_verified=true (admin vouching), save university_name as text fallback too
    const { rows: newMember } = await query(
      `INSERT INTO members (email, password_hash, full_name, phone, field_of_study, university_id, university_name, is_verified)
       VALUES ($1,$2,$3,$4,$5,$6,$7, true)
       RETURNING id`,
      [jReq.email, hash, jReq.full_name, jReq.phone||null, jReq.field_of_study||null, university_id, jReq.university_name||null]
    )
    const memberId = newMember[0]?.id

    // Mark request as accepted
    await query(`UPDATE join_requests SET status='accepted', updated_at=now() WHERE id=$1`, [req.params.id])

    // Respond immediately — email goes in the background so admin isn't blocked
    res.json({ message: 'Request accepted — welcome email sent', user: { id: memberId } })

    // Fire-and-forget: send welcome email after response is already out
    sendWelcomeEmail({ to: jReq.email, full_name: jReq.full_name, password })
      .then(() => console.log(`[Email] Welcome sent → ${jReq.email}`))
      .catch(err => console.error(`[Email error] ${jReq.email}:`, err.message))
  } catch (err) { next(err) }
}

export async function decline(req, res, next) {
  try {
    const { rows } = await query(
      `UPDATE join_requests SET status='declined', updated_at=now()
       WHERE id=$1 RETURNING id`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Request not found' })
    res.json({ message: 'Request declined' })
  } catch (err) { next(err) }
}
