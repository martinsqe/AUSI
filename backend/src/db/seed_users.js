import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { query } from './index.js'

const DEMO_USERS = [
  {
    full_name: 'AUSI Administrator',
    email:     'admin@ausi.org',
    password:  'Admin@AUSI2025',
    role:      'admin',
  },
  {
    full_name: 'Demo Student',
    email:     'student@ausi.org',
    password:  'Student@123',
    role:      'student',
  },
  {
    full_name: 'Demo Executive',
    email:     'exec@ausi.org',
    password:  'Exec@123',
    role:      'exec',
  },
  {
    full_name: 'Demo President',
    email:     'president@ausi.org',
    password:  'President@123',
    role:      'chapter_president',
  },
  {
    full_name: 'Demo Rep (RK University)',
    email:     'rep@ausi.org',
    password:  'Rep@123',
    role:      'university_rep',
  },
]

async function seed() {
  console.log('Seeding demo users…\n')

  // Get the first university ID to assign to the demo rep
  const { rows: unis } = await query('SELECT id, name FROM universities ORDER BY name LIMIT 1')
  const firstUniId = unis[0]?.id || null
  if (firstUniId) console.log(`  Assigning rep to: ${unis[0].name}\n`)

  for (const u of DEMO_USERS) {
    const hash = await bcrypt.hash(u.password, 12)
    const uniId = u.role === 'university_rep' ? firstUniId : null
    await query(
      `INSERT INTO members (email, password_hash, full_name, role, is_verified, university_id)
       VALUES ($1, $2, $3, $4, true, $5)
       ON CONFLICT (email) DO UPDATE
         SET password_hash = EXCLUDED.password_hash,
             role          = EXCLUDED.role,
             is_verified   = true,
             university_id = EXCLUDED.university_id`,
      [u.email, hash, u.full_name, u.role, uniId]
    )
    console.log(`  ✓  ${u.role.padEnd(20)}  ${u.email}  /  ${u.password}`)
  }
  console.log('\nDone. You can now log in with the credentials above.')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
