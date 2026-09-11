import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import 'dotenv/config'

// Log any crash reason before process exits
process.on('uncaughtException',  (err) => { console.error('UNCAUGHT EXCEPTION:', err); process.exit(1) })
process.on('unhandledRejection', (r)   => { console.error('UNHANDLED REJECTION:', r);  process.exit(1) })

const __dirname = path.dirname(fileURLToPath(import.meta.url))

import authRoutes          from './src/routes/auth.js'
import eventsRoutes        from './src/routes/events.js'
import membersRoutes       from './src/routes/members.js'
import opportunitiesRoutes from './src/routes/opportunities.js'
import resourcesRoutes     from './src/routes/resources.js'
import universitiesRoutes  from './src/routes/universities.js'
import leadershipRoutes    from './src/routes/leadership.js'
import dashboardRoutes     from './src/routes/dashboard.js'
import applicationsRoutes  from './src/routes/applications.js'
import joinRequestsRoutes  from './src/routes/joinRequests.js'
import innovationsRoutes   from './src/routes/innovations.js'
import uploadRoutes        from './src/routes/upload.js'
import uploadsFileRoutes   from './src/routes/uploads.js'
import contentRoutes       from './src/routes/content.js'

const app = express()
app.set('trust proxy', 1)   // behind Railway's proxy — req.protocol/req.ip need the real values
const PORT = process.env.PORT || 3001
const isProd = process.env.NODE_ENV === 'production'

// Security headers — imgSrc allows https: so external event/avatar images load
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'img-src': ["'self'", 'data:', 'https:'],
    },
  },
}))

// CORS — CLIENT_URL may be a comma-separated list; trailing slashes are ignored
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    // allow non-browser clients (curl, health checks) that send no Origin
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) return cb(null, true)
    cb(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true,
}))
app.use(express.json({ limit: '6mb' }))

// Rate limiting on auth routes — 20 attempts per 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts. Please wait 15 minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth',          authLimiter, authRoutes)
app.use('/api/events',        eventsRoutes)
app.use('/api/members',       membersRoutes)
app.use('/api/opportunities', opportunitiesRoutes)
app.use('/api/resources',     resourcesRoutes)
app.use('/api/universities',  universitiesRoutes)
app.use('/api/leadership',    leadershipRoutes)
app.use('/api/dashboard',     dashboardRoutes)
app.use('/api/applications',  applicationsRoutes)
app.use('/api/join-requests', joinRequestsRoutes)
app.use('/api/innovations',  innovationsRoutes)
app.use('/api/upload',       uploadRoutes)
app.use('/api/uploads',      uploadsFileRoutes)
app.use('/api/content',      contentRoutes)

// Serve built React app only when frontend/dist actually exists (combined deploy).
// When frontend is on Vercel this folder is absent — serve API-only 404 instead.
const distPath = path.join(__dirname, '../frontend/dist')
if (isProd && existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
} else {
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' })
  })
}

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack)
  const isDev = process.env.NODE_ENV !== 'production'
  res.status(500).json({
    error: isDev ? err.message : 'Internal server error',
  })
})

app.listen(PORT, () => {
  console.log(`AUSI API running — port ${PORT} — NODE_ENV=${process.env.NODE_ENV}`)
  console.log(`DB mode: ${process.env.DATABASE_URL ? 'DATABASE_URL' : 'individual vars'}`)
  console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`)
})
