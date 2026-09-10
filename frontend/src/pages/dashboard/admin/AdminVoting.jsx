import { useState, useEffect } from 'react'
import { lsGet, lsSet } from '../../../lib/syncedStore'
import { useAuth } from '../../../context/AuthContext'

const K_CFG  = 'ausi_election_config'
const K_POS  = 'ausi_election_positions'
const K_CAND = 'ausi_election_candidates'
const K_VOTE = 'ausi_election_votes'

const load = (k, d) => { try { return JSON.parse(lsGet(k)) ?? d } catch { return d } }
const save = (k, v) => lsSet(k, JSON.stringify(v))

const DEF_CFG = { title: 'AUSI Elections 2026/27', voting_open: false }

const inp = { width: '100%', padding: '9px 12px', border: '1.5px solid var(--g200)', borderRadius: 8, fontSize: 13.5, outline: 'none', boxSizing: 'border-box', background: 'var(--white)', color: 'var(--ink)' }
const STATUS = { pending: { label: 'Pending', bg: 'rgba(217,119,6,.1)', text: '#92400e' }, approved: { label: 'Approved', bg: 'rgba(5,150,105,.1)', text: '#065f46' }, rejected: { label: 'Rejected', bg: 'rgba(220,38,38,.1)', text: '#b91c1c' } }

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--g500)', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  )
}

function Badge({ status }) {
  const s = STATUS[status] || STATUS.pending
  return <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 4, background: s.bg, color: s.text }}>{s.label}</span>
}

/* ── POSITIONS TAB ─────────────────────────────────────────────── */
function PositionsTab({ positions, setPositions, candidates }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm]     = useState({ title: '', description: '' })
  const [err, setErr]       = useState('')

  const candCount = id => candidates.filter(c => c.position_id === id).length

  const save_pos = (next) => { setPositions(next); save(K_POS, next) }

  const add = () => {
    if (!form.title.trim()) { setErr('Title required'); return }
    const next = [...positions, { id: Date.now(), title: form.title.trim(), description: form.description.trim(), order: positions.length + 1 }]
    save_pos(next); setForm({ title: '', description: '' }); setAdding(false); setErr('')
  }

  const move = (id, dir) => {
    const arr = [...positions]
    const i = arr.findIndex(p => p.id === id)
    const j = i + dir
    if (j < 0 || j >= arr.length) return
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    arr.forEach((p, k) => { p.order = k + 1 })
    save_pos(arr)
  }

  const del = (id) => {
    if (!window.confirm('Delete this position and all its candidates?')) return
    save_pos(positions.filter(p => p.id !== id))
    const cands = load(K_CAND, []).filter(c => c.position_id !== id)
    save(K_CAND, cands)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 13.5, color: 'var(--g500)' }}>{positions.length} position{positions.length !== 1 ? 's' : ''} defined</div>
        <button onClick={() => setAdding(v => !v)} style={{ padding: '8px 18px', background: adding ? 'var(--g200)' : '#0891b2', color: adding ? 'var(--ink)' : '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          {adding ? 'Cancel' : '+ Add Position'}
        </button>
      </div>

      {adding && (
        <div style={{ background: 'var(--off)', border: '1px solid var(--g200)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          {err && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 10 }}>{err}</div>}
          <Field label="Position Title *">
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. President, Vice President" style={inp} />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Brief role description…" style={{ ...inp, resize: 'vertical' }} />
          </Field>
          <button onClick={add} style={{ padding: '8px 20px', background: '#0891b2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Save Position</button>
        </div>
      )}

      {positions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--g400)', fontSize: 13.5 }}>No positions yet. Add positions above.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...positions].sort((a, b) => a.order - b.order).map((p, i, arr) => (
            <div key={p.id} style={{ background: 'var(--white)', border: '1px solid var(--g100)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
                <button onClick={() => move(p.id, -1)} disabled={i === 0} style={{ width: 24, height: 24, border: '1.5px solid var(--g200)', borderRadius: 4, background: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--g500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▲</button>
                <button onClick={() => move(p.id, 1)} disabled={i === arr.length - 1} style={{ width: 24, height: 24, border: '1.5px solid var(--g200)', borderRadius: 4, background: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--g500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▼</button>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0891b2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{p.order}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 14 }}>{p.title}</div>
                {p.description && <div style={{ fontSize: 12.5, color: 'var(--g500)', marginTop: 2 }}>{p.description}</div>}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 5, background: 'rgba(8,145,178,.1)', color: '#0e7490', flexShrink: 0 }}>
                {candCount(p.id)} candidate{candCount(p.id) !== 1 ? 's' : ''}
              </span>
              <button onClick={() => del(p.id)} style={{ fontSize: 12, color: '#dc2626', background: 'rgba(220,38,38,.07)', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── CANDIDATES TAB ────────────────────────────────────────────── */
function CandidatesTab({ positions, candidates, setCandidates }) {
  const [filter, setFilter]       = useState('all')
  const [posFilter, setPosFilter] = useState('all')

  const save_cands = (next) => { setCandidates(next); save(K_CAND, next) }
  const setStatus  = (id, status) => save_cands(candidates.map(c => c.id === id ? { ...c, status } : c))
  const del        = id => { if (window.confirm('Remove this applicant?')) save_cands(candidates.filter(c => c.id !== id)) }
  const posName    = id => positions.find(p => p.id === id)?.title || 'Unknown'

  const visible = candidates.filter(c => {
    const matchStatus = filter === 'all' || c.status === filter
    const matchPos    = posFilter === 'all' || c.position_id === Number(posFilter)
    return matchStatus && matchPos
  })

  const FILTERS = [['all','All'],['pending','Pending'],['approved','Approved'],['rejected','Rejected']]

  return (
    <div>
      {/* Info banner */}
      <div style={{ background: 'rgba(8,145,178,.06)', border: '1px solid rgba(8,145,178,.18)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--g600)' }}>
        <strong style={{ color: 'var(--ink)' }}>Electoral Commission Review</strong> — Candidates apply through the Voting page in their dashboard. Review applications below and approve or reject each one before opening the ballot.
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: 13.5, color: 'var(--g500)' }}>
          {candidates.filter(c => c.status === 'approved').length} approved &nbsp;·&nbsp;
          {candidates.filter(c => c.status === 'pending').length} pending review &nbsp;·&nbsp;
          {candidates.filter(c => c.status === 'rejected').length} rejected
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTERS.map(([val, lbl]) => (
          <button key={val} onClick={() => setFilter(val)} style={{ padding: '6px 14px', borderRadius: 6, border: '1.5px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: filter === val ? '#0891b2' : 'var(--white)', borderColor: filter === val ? '#0891b2' : 'var(--g200)', color: filter === val ? '#fff' : 'var(--g600)' }}>{lbl}</button>
        ))}
        <select value={posFilter} onChange={e => setPosFilter(e.target.value)} style={{ ...inp, width: 'auto', padding: '6px 12px', fontSize: 12 }}>
          <option value="all">All Positions</option>
          {[...positions].sort((a, b) => a.order - b.order).map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>

      {visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--g400)', fontSize: 13.5 }}>No candidates match this filter.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visible.map(c => (
            <div key={c.id} style={{ background: 'var(--white)', border: `1.5px solid ${c.status === 'approved' ? 'rgba(5,150,105,.25)' : c.status === 'rejected' ? 'rgba(220,38,38,.2)' : 'var(--g100)'}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {c.photo ? <img src={c.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontWeight: 800, fontSize: 18, color: '#6b7280' }}>{c.name.charAt(0)}</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 14 }}>{c.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--g500)' }}>{posName(c.position_id)}{c.university ? ` · ${c.university}` : ''}</div>
                {c.bio && <div style={{ fontSize: 12, color: 'var(--g400)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 380 }}>{c.bio}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <Badge status={c.status} />
                {c.status !== 'approved'  && <button onClick={() => setStatus(c.id, 'approved')}  style={{ padding: '5px 12px', background: 'rgba(5,150,105,.1)',  color: '#065f46', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Approve</button>}
                {c.status !== 'rejected'  && <button onClick={() => setStatus(c.id, 'rejected')}  style={{ padding: '5px 12px', background: 'rgba(220,38,38,.08)', color: '#b91c1c', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Reject</button>}
                {c.status === 'approved'  && <button onClick={() => setStatus(c.id, 'pending')}   style={{ padding: '5px 12px', background: 'rgba(107,114,128,.1)', color: '#374151', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Revoke</button>}
                <button onClick={() => del(c.id)} style={{ padding: '5px 10px', background: 'none', color: 'var(--g400)', border: '1.5px solid var(--g200)', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── ELECTION CONTROL TAB ──────────────────────────────────────── */
function ElectionTab({ config, setConfig, positions, candidates }) {
  const [title, setTitle] = useState(config.title)
  const [confirmReset, setConfirmReset] = useState(false)

  const votes = load(K_VOTE, [])
  const submitted = votes.filter(v => v.submitted)

  const updateCfg = (patch) => {
    const next = { ...config, ...patch }
    setConfig(next); save(K_CFG, next)
  }

  const saveTitle = () => updateCfg({ title })

  const toggleVoting = () => updateCfg({ voting_open: !config.voting_open })

  const resetVotes = () => { save(K_VOTE, []); setConfirmReset(false); window.location.reload() }

  const votesForCandidate = (cid) => submitted.filter(v => Object.values(v.ballot || {}).includes(cid)).length

  const approvedByPos = (pid) => candidates.filter(c => c.position_id === pid && c.status === 'approved')

  return (
    <div>
      {/* Title */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--g100)', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--g400)', marginBottom: 8 }}>Election Title</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input value={title} onChange={e => setTitle(e.target.value)} style={{ ...inp, flex: 1 }} />
          <button onClick={saveTitle} style={{ padding: '9px 18px', background: '#0891b2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Save</button>
        </div>
      </div>

      {/* Toggle */}
      <div style={{ background: config.voting_open ? 'rgba(5,150,105,.06)' : 'var(--white)', border: `1.5px solid ${config.voting_open ? 'rgba(5,150,105,.3)' : 'var(--g100)'}`, borderRadius: 12, padding: '20px 24px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 4 }}>
            {config.voting_open ? '🟢 Voting is OPEN' : '🔴 Voting is CLOSED'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--g500)' }}>
            {config.voting_open ? 'Members can currently cast their ballots.' : 'Voting is not yet open to members.'}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--g400)', marginTop: 4 }}>{submitted.length} ballot{submitted.length !== 1 ? 's' : ''} submitted</div>
        </div>
        <button onClick={toggleVoting}
          style={{ padding: '12px 28px', background: config.voting_open ? '#dc2626' : '#059669', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
          {config.voting_open ? 'Close Voting' : 'Open Voting'}
        </button>
      </div>

      {/* Live results */}
      {positions.length > 0 && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--g100)', borderRadius: 12, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--g400)', marginBottom: 16 }}>Live Results</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[...positions].sort((a, b) => a.order - b.order).map(pos => {
              const cands = approvedByPos(pos.id)
              const total = cands.reduce((s, c) => s + votesForCandidate(c.id), 0)
              return (
                <div key={pos.id}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>{pos.title}</div>
                  {cands.length === 0 ? (
                    <div style={{ fontSize: 12.5, color: 'var(--g400)' }}>No approved candidates</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {cands.sort((a, b) => votesForCandidate(b.id) - votesForCandidate(a.id)).map(c => {
                        const v = votesForCandidate(c.id)
                        const pct = total ? Math.round(v / total * 100) : 0
                        return (
                          <div key={c.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{c.name}</span>
                              <span style={{ fontSize: 12, color: 'var(--g500)' }}>{v} vote{v !== 1 ? 's' : ''} · {pct}%</span>
                            </div>
                            <div style={{ height: 6, background: 'var(--g100)', borderRadius: 99 }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: '#0891b2', borderRadius: 99, transition: 'width .4s ease' }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Reset */}
      <div style={{ background: 'rgba(220,38,38,.04)', border: '1px solid rgba(220,38,38,.15)', borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#b91c1c', marginBottom: 4 }}>Reset All Votes</div>
        <div style={{ fontSize: 12.5, color: 'var(--g500)', marginBottom: 12 }}>Clears all cast ballots. This cannot be undone.</div>
        {!confirmReset
          ? <button onClick={() => setConfirmReset(true)} style={{ padding: '7px 16px', background: 'rgba(220,38,38,.1)', color: '#b91c1c', border: 'none', borderRadius: 7, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Reset Votes</button>
          : <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={resetVotes} style={{ padding: '7px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Yes, Reset</button>
              <button onClick={() => setConfirmReset(false)} style={{ padding: '7px 16px', background: 'var(--g100)', color: 'var(--ink)', border: 'none', borderRadius: 7, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            </div>
        }
      </div>
    </div>
  )
}

/* ── MAIN COMPONENT ────────────────────────────────────────────── */
export default function AdminVoting() {
  const { user } = useAuth()
  const [tab, setTab]           = useState('positions')
  const [config, setConfig]     = useState(() => load(K_CFG, DEF_CFG))
  const [positions, setPositions] = useState(() => load(K_POS, []))
  const [candidates, setCandidates] = useState(() => load(K_CAND, []))

  const TABS = [['positions','Positions'],['candidates','Candidates'],['election','Election Control']]
  const pendingCount = candidates.filter(c => c.status === 'pending').length

  const tabStyle = (t) => ({
    padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none',
    background: tab === t ? '#0891b2' : 'transparent',
    color: tab === t ? '#fff' : 'var(--g500)', borderRadius: 8, transition: 'all .15s', position: 'relative',
  })

  return (
    <div style={{ background: 'var(--off)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding: '36px 0 32px' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', display: 'block', marginBottom: 12 }} />
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 8 }}>AUSI · 2026 / 27</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>Voting &amp; Elections</h1>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.4)', margin: 0 }}>Manage positions, screen candidates, and control the election ballot.</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: config.voting_open ? 'rgba(52,211,153,.8)' : 'rgba(255,255,255,.3)', marginBottom: 3 }}>Voting Status</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: config.voting_open ? '#6ee7b7' : 'rgba(255,255,255,.5)' }}>{config.voting_open ? 'OPEN' : 'CLOSED'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 28, paddingBottom: 64 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '8px', background: 'var(--white)', border: '1px solid var(--g100)', borderRadius: 12, marginBottom: 24, overflowX: 'auto' }} className="hscroll">
          {TABS.map(([val, lbl]) => (
            <button key={val} style={tabStyle(val)} onClick={() => setTab(val)}>
              {lbl}
              {val === 'candidates' && pendingCount > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16, background: '#dc2626', color: '#fff', borderRadius: '50%', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--g100)', borderRadius: 14, padding: 24 }}>
          {tab === 'positions' && <PositionsTab positions={positions} setPositions={setPositions} candidates={candidates} />}
          {tab === 'candidates' && <CandidatesTab positions={positions} candidates={candidates} setCandidates={setCandidates} />}
          {tab === 'election' && <ElectionTab config={config} setConfig={setConfig} positions={positions} candidates={candidates} />}
        </div>
      </div>
    </div>
  )
}
