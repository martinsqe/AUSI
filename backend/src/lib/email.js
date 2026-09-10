import nodemailer from 'nodemailer'

// Sender address, e.g. "AUSI <noreply@ausi.community>"
function fromAddress() {
  return process.env.EMAIL_FROM
    || process.env.SMTP_FROM
    || `AUSI <${process.env.SMTP_USER || 'onboarding@resend.dev'}>`
}

let _transport = null

function getTransport() {
  if (_transport) return _transport
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null
  const port = parseInt(SMTP_PORT || '465')
  _transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,          // 465 = SSL from start, 587 = STARTTLS
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { rejectUnauthorized: false },
  })
  return _transport
}

// Send via Resend HTTP API → SMTP → console (in that order of preference)
async function sendEmail({ to, subject, html, text }) {
  const from = fromAddress()

  if (process.env.RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, html, text }),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Resend API ${res.status}: ${body}`)
    }
    return
  }

  const transport = getTransport()
  if (transport) {
    await transport.sendMail({ from, to, subject, html, text })
    return
  }

  console.log(`[EMAIL - not configured] To: ${to} | Subject: ${subject}`)
}

export async function sendWelcomeEmail({ to, full_name, password }) {
  const loginUrl = `${(process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim()}/login`

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f9f9f7;border:1px solid #e5e5e3;border-radius:12px;overflow:hidden">
      <div style="background:#111118;padding:28px 32px">
        <div style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#e8c96a;letter-spacing:.5px">AUSI</div>
        <div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:2px;letter-spacing:2px;text-transform:uppercase">Association of Ugandan Students in India</div>
      </div>
      <div style="padding:32px 32px 28px">
        <h2 style="font-family:Georgia,serif;font-size:20px;color:#111118;margin:0 0 8px">Welcome, ${full_name}!</h2>
        <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 24px">
          Your request to join AUSI has been approved. You can now access the member portal using the credentials below.
        </p>
        <div style="background:#fff;border:1px solid #e5e5e3;border-radius:10px;padding:20px 24px;margin-bottom:24px">
          <div style="margin-bottom:14px">
            <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#999;margin-bottom:4px">Email</div>
            <div style="font-size:15px;font-weight:600;color:#111118">${to}</div>
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#999;margin-bottom:4px">Temporary Password</div>
            <div style="font-size:18px;font-weight:800;color:#111118;letter-spacing:2px;font-family:monospace">${password}</div>
          </div>
        </div>
        <p style="font-size:13px;color:#888;margin:0 0 20px">
          Please change your password after your first login via <strong>Settings → Change Password</strong>.
        </p>
        <a href="${loginUrl}" style="display:inline-block;background:#111118;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 24px;border-radius:8px">
          Sign In to AUSI →
        </a>
      </div>
      <div style="padding:16px 32px;border-top:1px solid #e5e5e3;font-size:12px;color:#aaa">
        This email was sent because your join request was approved by an AUSI administrator.
      </div>
    </div>
  `

  const text = `Welcome to AUSI, ${full_name}!\n\nYour request has been approved.\n\nEmail: ${to}\nPassword: ${password}\n\nLogin at: ${loginUrl}\n\nPlease change your password after first login.`

  await sendEmail({ to, subject: 'Welcome to AUSI — Your account is ready', html, text })
}

export async function sendOtpEmail({ to, full_name, otp }) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f9f9f7;border:1px solid #e5e5e3;border-radius:12px;overflow:hidden">
      <div style="background:#111118;padding:28px 32px">
        <div style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#e8c96a;letter-spacing:.5px">AUSI</div>
        <div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:2px;letter-spacing:2px;text-transform:uppercase">Association of Ugandan Students in India</div>
      </div>
      <div style="padding:32px 32px 28px">
        <h2 style="font-family:Georgia,serif;font-size:20px;color:#111118;margin:0 0 8px">Password Reset</h2>
        <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 24px">
          Hi ${full_name}, we received a request to reset your AUSI account password.
          Use the one-time code below — it expires in <strong>10 minutes</strong>.
        </p>
        <div style="background:#fff;border:1px solid #e5e5e3;border-radius:10px;padding:28px 24px;margin-bottom:24px;text-align:center">
          <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#999;margin-bottom:12px">Your OTP Code</div>
          <div style="font-size:36px;font-weight:800;color:#111118;letter-spacing:8px;font-family:monospace">${otp}</div>
        </div>
        <p style="font-size:13px;color:#888;margin:0 0 8px">
          If you did not request a password reset, you can safely ignore this email.
          Your password will not change.
        </p>
        <p style="font-size:12px;color:#aaa;margin:0">This code expires in 10 minutes and can only be used once.</p>
      </div>
      <div style="padding:16px 32px;border-top:1px solid #e5e5e3;font-size:12px;color:#aaa">
        This email was sent because a password reset was requested for your AUSI account.
      </div>
    </div>
  `

  const text = `Hi ${full_name},\n\nYour AUSI password reset code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, ignore this email.`

  await sendEmail({ to, subject: 'AUSI — Your password reset code', html, text })
}
