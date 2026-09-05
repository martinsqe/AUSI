import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
})

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('DB connected')
  }
})

pool.on('error', (err) => {
  console.error('Unexpected DB pool error:', err.message)
})

export const query = (text, params) => pool.query(text, params)
export default pool

