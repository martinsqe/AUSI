import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { query } from '../db/index.js'
import { sendOtpEmail } from '../lib/email.js'

// Create table once at startup
try {
  await query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      email      VARCHAR(255) PRIMARY KEY,
      otp_hash   VARCHAR(255) NOT NULL,
      expires_at TIMESTAMPTZ  NOT NULL,
      created_at TIMESTAMPTZ  DEFAULT now()
    )
  `)
} catch (err) {
  console.error('[passwordReset] table setup failed:', err.message)
}

export async function requestOtp(req, res, next) {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required.' })

    // Only members who exist and are verified can reset
    const { rows } = await query(
      `SELECT id, full_name, is_verified FROM members WHERE email = $1`,
      [email.toLowerCase().trim()]
    )
    if (!rows.length || !rows[0].is_verified) {
      // Return generic message — don't reveal whether the email exists
      return res.json({ message: 'If that email is registered, an OTP has been sent.' })
    }

    // Rate-limit: block if a code was sent in the last 60 s
    const existing = await query(
      `SELECT created_at FROM password_resets WHERE email = $1`,
      [email.toLowerCase().trim()]
    )
    if (existing.rows.length) {
      const age = Date.now() - new Date(existing.rows[0].created_at).getTime()
      if (age < 60_000) {
        return res.status(429).json({ error: 'Please wait a minute before requesting another code.' })
      }
    }

    // Generate & store OTP
    const otp     = String(Math.floor(100000 + Math.random() * 900000)) // 6-digit
    const hash    = await bcrypt.hash(otp, 10)
    const expires = new Date(Date.now() + 10 * 60 * 1000)               // 10 min

    await query(
      `INSERT INTO password_resets (email, otp_hash, expires_at, created_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (email) DO UPDATE
         SET otp_hash = $2, expires_at = $3, created_at = now()`,
      [email.toLowerCase().trim(), hash, expires]
    )

    // Respond first, then send email in background
    res.json({ message: 'If that email is registered, an OTP has been sent.' })

    sendOtpEmail({ to: email.toLowerCase().trim(), full_name: rows[0].full_name, otp })
      .then(() => console.log(`[OTP] Sent → ${email}`))
      .catch(err => console.error(`[OTP error] ${email}:`, err.message))

  } catch (err) { next(err) }
}

export async function resetPassword(req, res, next) {
  try {
    const { email, otp, new_password } = req.body
    if (!email || !otp || !new_password) {
      return res.status(400).json({ error: 'email, otp and new_password are required.' })
    }
    if (new_password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' })
    }

    const { rows } = await query(
      `SELECT otp_hash, expires_at FROM password_resets WHERE email = $1`,
      [email.toLowerCase().trim()]
    )
    if (!rows.length) {
      return res.status(400).json({ error: 'No reset code found. Please request a new one.' })
    }
    if (new Date() > new Date(rows[0].expires_at)) {
      await query(`DELETE FROM password_resets WHERE email = $1`, [email.toLowerCase().trim()])
      return res.status(400).json({ error: 'This code has expired. Please request a new one.' })
    }

    const valid = await bcrypt.compare(String(otp).trim(), rows[0].otp_hash)
    if (!valid) {
      return res.status(400).json({ error: 'Incorrect OTP. Please try again.' })
    }

    const hash = await bcrypt.hash(new_password, 12)
    await query(
      `UPDATE members SET password_hash = $1, updated_at = now() WHERE email = $2`,
      [hash, email.toLowerCase().trim()]
    )
    await query(`DELETE FROM password_resets WHERE email = $1`, [email.toLowerCase().trim()])

    res.json({ message: 'Password reset successfully. You can now log in.' })
  } catch (err) { next(err) }
}
