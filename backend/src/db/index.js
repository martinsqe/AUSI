import pg from 'pg'

const { Pool } = pg

const isRemote = process.env.DB_HOST && !process.env.DB_HOST.includes('localhost')

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'postgres',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl:      isRemote ? { rejectUnauthorized: false } : false,
})

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`DB connected → ${process.env.DB_HOST}`)
  }
})

pool.on('error', (err) => {
  console.error('Unexpected DB pool error:', err.message)
})

export const query = (text, params) => pool.query(text, params)
export default pool
