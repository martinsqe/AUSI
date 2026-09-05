import pg from 'pg'

const { Pool } = pg

// Prefer DATABASE_URL (Railway / Neon / Supabase all provide this).
// Fall back to individual vars for local development.
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME     || 'ausi_db',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl:      false,
    })

pool.on('error', (err) => {
  console.error('Unexpected DB pool error:', err.message)
})

export const query = (text, params) => pool.query(text, params)
export default pool
