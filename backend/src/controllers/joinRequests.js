import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import pool, { query } from '../db/index.js'
import { sendWelcomeEmail } from '../lib/email.js'

// ── One-time schema setup / migration (runs at startup, never per-request) ──
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

  // New registration-form fields — added idempotently so existing rows survive
  await query(`
    ALTER TABLE join_requests
      ADD COLUMN IF NOT EXISTS surname                         VARCHAR(120),
      ADD COLUMN IF NOT EXISTS middle_name                     VARCHAR(120),
      ADD COLUMN IF NOT EXISTS last_name                       VARCHAR(120),
      ADD COLUMN IF NOT EXISTS sex                             VARCHAR(10),
      ADD COLUMN IF NOT EXISTS date_of_birth                   DATE,
      ADD COLUMN IF NOT EXISTS place_of_birth                  VARCHAR(160),
      ADD COLUMN IF NOT EXISTS marital_status                  VARCHAR(12),
      ADD COLUMN IF NOT EXISTS passport_number                 VARCHAR(60),
      ADD COLUMN IF NOT EXISTS passport_issue_date             DATE,
      ADD COLUMN IF NOT EXISTS passport_issue_place            VARCHAR(160),
      ADD COLUMN IF NOT EXISTS passport_expiry_date            DATE,
      ADD COLUMN IF NOT EXISTS residential_permit_no           VARCHAR(80),
      ADD COLUMN IF NOT EXISTS residential_permit_issue_date   DATE,
      ADD COLUMN IF NOT EXISTS residential_permit_expiry_date  DATE,
      ADD COLUMN IF NOT EXISTS permanent_address_uganda        TEXT,
      ADD COLUMN IF NOT EXISTS present_address_india           TEXT,
      ADD COLUMN IF NOT EXISTS institution_address             TEXT,
      ADD COLUMN IF NOT EXISTS date_of_joining                 DATE,
      ADD COLUMN IF NOT EXISTS expected_completion_date        DATE,
      ADD COLUMN IF NOT EXISTS prev_institution_1              VARCHAR(200),
      ADD COLUMN IF NOT EXISTS prev_institution_2              VARCHAR(200),
      ADD COLUMN IF NOT EXISTS employment_record               TEXT,
      ADD COLUMN IF NOT EXISTS sponsorship_type                VARCHAR(12),
      ADD COLUMN IF NOT EXISTS sponsor_name                    VARCHAR(200),
      ADD COLUMN IF NOT EXISTS guardian_name                   VARCHAR(200),
      ADD COLUMN IF NOT EXISTS guardian_address                TEXT,
      ADD COLUMN IF NOT EXISTS guardian_phone                  VARCHAR(50),
      ADD COLUMN IF NOT EXISTS guardian_email                  VARCHAR(255),
      ADD COLUMN IF NOT EXISTS guardian_occupation             VARCHAR(160)
  `)

  // Uploaded PDFs live in the DB (persistent) — not on the app container disk
  await query(`
    CREATE TABLE IF NOT EXISTS join_request_documents (
      id          SERIAL PRIMARY KEY,
      request_id  INT NOT NULL REFERENCES join_requests(id) ON DELETE CASCADE,
      doc_type    VARCHAR(30) NOT NULL,
      filename    VARCHAR(255),
      mime_type   VARCHAR(100) DEFAULT 'application/pdf',
      byte_size   INT,
      data        BYTEA NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT now(),
      UNIQUE (request_id, doc_type)
    )
  `)
} catch (err) {
  console.error('[joinRequests] schema setup failed:', err.message)
}

// ── Field definitions ─────────────────────────────────────────────────────
const DOC_TYPES = ['passport_photo', 'admission_letter', 'passport', 'visa']

const TEXT_FIELDS = [
  'surname', 'middle_name', 'last_name', 'phone', 'place_of_birth',
  'passport_number', 'passport_issue_place',
  'residential_permit_no', 'permanent_address_uganda', 'present_address_india',
  'university_name', 'field_of_study', 'institution_address',
  'prev_institution_1', 'prev_institution_2', 'employment_record',
  'sponsor_name', 'guardian_name', 'guardian_address', 'guardian_phone',
  'guardian_email', 'guardian_occupation', 'message',
]
const DATE_FIELDS = [
  'date_of_birth', 'passport_issue_date', 'passport_expiry_date',
  'residential_permit_issue_date', 'residential_permit_expiry_date',
  'date_of_joining', 'expected_completion_date',
]

const REQUIRED = [
  'surname', 'last_name', 'email', 'phone', 'sex', 'date_of_birth', 'place_of_birth',
  'marital_status', 'passport_number', 'passport_issue_date', 'passport_issue_place',
  'passport_expiry_date', 'permanent_address_uganda', 'present_address_india',
  'university_name', 'field_of_study', 'institution_address', 'date_of_joining',
  'expected_completion_date', 'prev_institution_1', 'sponsorship_type', 'sponsor_name',
  'guardian_name', 'guardian_address', 'guardian_phone', 'guardian_occupation',
]
const ENUMS = {
  sex: ['Male', 'Female'],
  marital_status: ['Single', 'Married', 'Divorced'],
  sponsorship_type: ['Private', 'Government'],
}

const clean  = (v) => (typeof v === 'string' ? v.trim() : v) || null
const asDate = (v) => (v && String(v).trim() ? String(v).trim() : null)

// Columns persisted on the join_requests row, in a fixed order
const COLUMNS = [
  'surname', 'middle_name', 'last_name', 'full_name', 'email', 'phone', 'sex',
  'date_of_birth', 'place_of_birth', 'marital_status',
  'passport_number', 'passport_issue_date', 'passport_issue_place', 'passport_expiry_date',
  'residential_permit_no', 'residential_permit_issue_date', 'residential_permit_expiry_date',
  'permanent_address_uganda', 'present_address_india',
  'university_id', 'university_name', 'field_of_study', 'institution_address',
  'date_of_joining', 'expected_completion_date',
  'prev_institution_1', 'prev_institution_2', 'employment_record',
  'sponsorship_type', 'sponsor_name',
  'guardian_name', 'guardian_address', 'guardian_phone', 'guardian_email', 'guardian_occupation',
  'message',
]

export async function submit(req, res, next) {
  const client = await pool.connect()
  try {
    const b = req.body || {}
    const files = req.files || {}

    // Normalise incoming values
    const v = {}
    for (const f of TEXT_FIELDS) v[f] = clean(b[f])
    for (const f of DATE_FIELDS) v[f] = asDate(b[f])
    v.email          = (b.email || '').trim().toLowerCase() || null
    v.sex            = clean(b.sex)
    v.marital_status = clean(b.marital_status)
    v.sponsorship_type = clean(b.sponsorship_type)
    v.university_id  = clean(b.university_id)   // usually null — store list ids aren't UUIDs
    v.university_name = clean(b.university_name)
    v.full_name = [v.surname, v.middle_name, v.last_name].filter(Boolean).join(' ') || null

    // Validation
    const missing = REQUIRED.filter((f) => !v[f])
    if (missing.length) {
      return res.status(400).json({ error: `Missing required field(s): ${missing.join(', ')}` })
    }
    if (!/^\S+@\S+\.\S+$/.test(v.email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' })
    }
    if (v.guardian_email && !/^\S+@\S+\.\S+$/.test(v.guardian_email)) {
      return res.status(400).json({ error: 'Please provide a valid parent/guardian email' })
    }
    for (const [field, allowed] of Object.entries(ENUMS)) {
      if (v[field] && !allowed.includes(v[field])) {
        return res.status(400).json({ error: `Invalid value for ${field}` })
      }
    }
    for (const t of DOC_TYPES) {
      const file = files[t]?.[0]
      if (!file) return res.status(400).json({ error: `Missing document: ${t.replace(/_/g, ' ')}` })
      if (file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: `Document "${t.replace(/_/g, ' ')}" must be a PDF` })
      }
    }

    // Duplicate handling
    const dup = await client.query('SELECT id, status FROM join_requests WHERE LOWER(email) = $1', [v.email])
    if (dup.rows.length) {
      const { id, status } = dup.rows[0]
      if (status === 'pending')  return res.status(409).json({ error: 'A request with this email is already awaiting review.' })
      if (status === 'accepted') return res.status(409).json({ error: 'This email has already been approved. Please log in.' })
      // declined — wipe the old request (docs cascade) and let a fresh one through
      await client.query('DELETE FROM join_requests WHERE id = $1', [id])
    }
    const existingMember = await client.query('SELECT id FROM members WHERE email = $1', [v.email])
    if (existingMember.rows.length) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' })
    }

    await client.query('BEGIN')

    const placeholders = COLUMNS.map((_, i) => `$${i + 1}`).join(',')
    const values = COLUMNS.map((c) => v[c] ?? null)
    const { rows } = await client.query(
      `INSERT INTO join_requests (${COLUMNS.join(',')})
       VALUES (${placeholders})
       RETURNING id, full_name, email, status, created_at`,
      values,
    )
    const requestId = rows[0].id

    for (const t of DOC_TYPES) {
      const file = files[t][0]
      await client.query(
        `INSERT INTO join_request_documents (request_id, doc_type, filename, mime_type, byte_size, data)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [requestId, t, file.originalname, file.mimetype, file.size, file.buffer],
      )
    }

    await client.query('COMMIT')
    res.status(201).json({ data: rows[0] })
  } catch (err) {
    try { await client.query('ROLLBACK') } catch { /* ignore */ }
    next(err)
  } finally {
    client.release()
  }
}

export async function list(req, res, next) {
  try {
    const { rows } = await query(`
      SELECT j.*,
        COALESCE(
          (SELECT json_agg(d.doc_type ORDER BY d.doc_type)
             FROM join_request_documents d WHERE d.request_id = j.id),
          '[]'::json
        ) AS documents
      FROM join_requests j
      ORDER BY
        CASE j.status WHEN 'pending' THEN 0 WHEN 'accepted' THEN 1 ELSE 2 END,
        j.created_at DESC
    `)
    res.json({ data: rows })
  } catch (err) { next(err) }
}

export async function getDocument(req, res, next) {
  try {
    const { id, type } = req.params
    if (!DOC_TYPES.includes(type)) return res.status(400).json({ error: 'Unknown document type' })
    const { rows } = await query(
      'SELECT filename, mime_type, data FROM join_request_documents WHERE request_id = $1 AND doc_type = $2',
      [id, type],
    )
    if (!rows.length) return res.status(404).json({ error: 'Document not found' })
    const doc = rows[0]
    res.setHeader('Content-Type', doc.mime_type || 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${(doc.filename || `${type}.pdf`).replace(/"/g, '')}"`)
    res.send(doc.data)
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

    const existing = await query('SELECT id FROM members WHERE email = $1', [jReq.email])
    if (existing.rows.length) {
      await query(`UPDATE join_requests SET status='accepted', updated_at=now() WHERE id=$1`, [req.params.id])
      return res.json({ message: 'Request accepted (account already existed)', user: { id: existing.rows[0].id } })
    }

    let university_id = jReq.university_id || null
    if (!university_id && jReq.university_name) {
      const namePart = jReq.university_name.split(',')[0].trim()
      const uniRes = await query(
        `SELECT id FROM universities WHERE LOWER(name) LIKE LOWER($1) LIMIT 1`,
        [`%${namePart}%`],
      )
      university_id = uniRes.rows[0]?.id || null
    }

    const password = crypto.randomBytes(5).toString('hex')
    const hash = await bcrypt.hash(password, 12)

    const { rows: newMember } = await query(
      `INSERT INTO members (email, password_hash, full_name, phone, field_of_study, university_id, university_name, is_verified)
       VALUES ($1,$2,$3,$4,$5,$6,$7, true)
       RETURNING id`,
      [jReq.email, hash, jReq.full_name, jReq.phone || null, jReq.field_of_study || null, university_id, jReq.university_name || null],
    )
    const memberId = newMember[0]?.id

    await query(`UPDATE join_requests SET status='accepted', updated_at=now() WHERE id=$1`, [req.params.id])

    res.json({ message: 'Request accepted — welcome email sent', user: { id: memberId } })

    sendWelcomeEmail({ to: jReq.email, full_name: jReq.full_name, password })
      .then(() => console.log(`[Email] Welcome sent → ${jReq.email}`))
      .catch((err) => console.error(`[Email error] ${jReq.email}:`, err.message))
  } catch (err) { next(err) }
}

export async function decline(req, res, next) {
  try {
    const { rows } = await query(
      `UPDATE join_requests SET status='declined', updated_at=now()
       WHERE id=$1 RETURNING id`,
      [req.params.id],
    )
    if (!rows.length) return res.status(404).json({ error: 'Request not found' })
    res.json({ message: 'Request declined' })
  } catch (err) { next(err) }
}
