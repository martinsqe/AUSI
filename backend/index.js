import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'

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

const app = express()
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

// CORS — in production allow CLIENT_URL; in dev allow localhost
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173'
app.use(cors({ origin: allowedOrigin, credentials: true }))
app.use(express.json({ limit: '2mb' }))

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

// Serve built React app in production (combined deployment)
if (isProd) {
  const distPath = path.join(__dirname, '../frontend/dist')
  app.use(express.static(distPath))
  // SPA fallback — all non-API routes serve index.html
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
} else {
  // 404 for API-only dev mode
  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' })
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
  console.log(`AUSI API running on http://localhost:${PORT}`)
})
