import api from './api'

/**
 * Synced localStorage layer.
 *
 * The admin dashboard historically kept all its data in `localStorage`, which is
 * private to one browser on one device. These helpers keep that exact API shape
 * (`lsGet` / `lsSet` behave like `localStorage.getItem` / `setItem`) but for the
 * keys listed below they also mirror the value to Postgres via `/api/content`,
 * so every device and visitor sees the same content.
 *
 * `bootstrapSyncedContent()` pulls the server copy into localStorage BEFORE the
 * app renders, so existing `useState(() => JSON.parse(localStorage...))` code
 * picks up the shared data with no component changes.
 */

// localStorage keys whose value is shared site content (synced to the server).
// NOTE: election data (ausi_election_*) is intentionally excluded — voting is
// multi-writer and needs its own dedicated backend, not a last-write-wins blob.
const SYNCED = new Set([
  'ausi_announcements', 'ausi_embassy', 'ausi_events', 'ausi_feedback',
  'ausi_government', 'ausi_immigration', 'ausi_resources', 'ausi_marketplace',
  'ausi_rep_reports', 'ausi_anon_reports', 'ausi_crisis', 'ausi_universities',
  'ausi_cabinet_data',
])

// localStorage key -> server content key
const toApiKey = (lsKey) =>
  lsKey.replace(/^ausi_/, '').replace(/^cabinet_data$/, 'cabinet')

export function lsGet(key) {
  try { return localStorage.getItem(key) } catch { return null }
}

const timers = {}
export function lsSet(key, value) {
  try { localStorage.setItem(key, value) } catch { /* quota / private mode */ }
  if (!SYNCED.has(key)) return
  clearTimeout(timers[key])
  timers[key] = setTimeout(() => push(key, value), 400)
}

async function push(key, value, attempt = 0) {
  let data
  try { data = JSON.parse(value) } catch { return }
  try {
    await api.put(`/content/${toApiKey(key)}`, { data })
  } catch (err) {
    const s = err?.response?.status
    if (s === 401 || s === 403 || s === 413 || s === 404) return  // not staff / rejected — give up quietly
    if (attempt < 2) setTimeout(() => push(key, value, attempt + 1), 1500 * (attempt + 1))
  }
}

let ready = false
export const isSyncReady = () => ready

/**
 * Push every locally-held content blob up to the server, letting the server
 * merge (member keys) or replace (staff keys). Safe to call on every login —
 * non-permitted PUTs are rejected harmlessly. This is what guarantees edits
 * made on a device before this feature existed reach the server.
 */
export async function pushLocalContent() {
  const jobs = []
  for (const lsKey of SYNCED) {
    const local = lsGet(lsKey)
    if (local && local !== 'null' && local !== '[]' && local !== '{}') {
      let data
      try { data = JSON.parse(local) } catch { continue }
      jobs.push(api.put(`/content/${toApiKey(lsKey)}`, { data }).catch(() => {}))
    }
  }
  await Promise.allSettled(jobs)
}

/** Re-pull server content into localStorage (no render side-effects). */
export async function refreshSyncedContent() {
  try {
    const res = await api.get('/content')
    const all = res?.data?.data || {}
    for (const lsKey of SYNCED) {
      const k = toApiKey(lsKey)
      if (all[k] != null) {
        try { localStorage.setItem(lsKey, JSON.stringify(all[k])) } catch { /* ignore */ }
      }
    }
  } catch { /* ignore */ }
}

/** Pull all shared content into localStorage. Resolves even if the API is down. */
export async function bootstrapSyncedContent(timeoutMs = 4000) {
  try {
    const res = await Promise.race([
      api.get('/content'),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), timeoutMs)),
    ])
    const all = res?.data?.data || {}
    const migrations = []

    for (const lsKey of SYNCED) {
      const k = toApiKey(lsKey)
      if (all[k] != null) {
        // server wins
        try { localStorage.setItem(lsKey, JSON.stringify(all[k])) } catch { /* ignore */ }
      } else {
        // server has nothing yet — push up any edits already made on this device
        const local = lsGet(lsKey)
        if (local && local !== 'null' && local !== '[]' && local !== '{}') {
          try { migrations.push(api.put(`/content/${k}`, { data: JSON.parse(local) })) } catch { /* ignore */ }
        }
      }
    }
    // fire-and-forget; a non-staff visitor's PUTs 403 harmlessly
    if (migrations.length) Promise.allSettled(migrations)
  } catch {
    // offline / slow / cold backend — fall through with whatever is local
  } finally {
    ready = true
  }
}
