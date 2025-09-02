import { Pool } from 'pg'

// Enable SSL on production/hosted DBs (e.g., Neon)
const isLocalHost = ['localhost', '127.0.0.1'].includes(
  (process.env.DB_HOST || '').toLowerCase()
)

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'fitdb',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: isLocalHost ? undefined : { rejectUnauthorized: false },
})

export default pool

// Helper function สำหรับ query
export async function query(text: string, params?: unknown[]) {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  console.log('Executed query', { text, duration, rows: res.rowCount })
  return res
}
