import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

const K_CFG  = 'ausi_election_config'
const K_POS  = 'ausi_election_positions'
const K_CAND = 'ausi_election_candidates'
const K_VOTE = 'ausi_election_votes'

const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v))

const STATUS_STYLE = {
  pending:  { label: 'Application Pending',  bg: 'rgba(217,119,6,.1)',  text: '#92400e' },
  approved: { label: 'Application Approved', bg: 'rgba(5,150,105,.1)',  text: '#065f46' },
  rejected: { label: 'Application Rejected', bg: 'rgba(220,38,38,.1)',  text: '#b91c1c' },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending
  return (
    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase',
      padding: '4px 10px', borderRadius: 5, background: s.bg, color: s.text }}>
      {s.label}
    </span>
  )
}

/* ── Apply form ───────────────────────────────────────────────── */
function ApplyForm({ position, onSubmit, onCancel }) {
  const [manifesto, setManifesto] = useState('')
  const [photo, setPhoto]         = useState('')
  const [err, setErr]             = useState('')

  const handlePhoto = e => {
    const file = e.target.files[0]; if (!file) return
    const r = new FileReader(); r.onload = ev => setPhoto(ev.target.result); r.readAsDataURL(file)
  }

  const submit = () => {
    if (!manifesto.trim()) { setErr('Please write your manifesto / reason for contesting.'); return }
    onSubmit({ manifesto, photo })
  }

  return (
    <div style={{ background: 'rgba(8,145,178,.04)', border: '1.5px solid rgba(8,145,178,.2)', borderRadius: 12, padding: '20px', marginTop: 14 }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>Apply to contest: {position.title}</div>
      <div style={{ fontSize: 12.5, color: 'var(--g500)', marginBottom: 16 }}>Your application will be reviewed by the Electoral Commission before approval.</div>
      {err && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 10 }}>{err}</div>}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--g500)', marginBottom: 5 }}>Manifesto / Why you are contesting *</label>
        <textarea value={manifesto} onChange={e => setManifesto(e.target.value)} rows={4}
          placeholder="Write your manifesto, your vision for this role, and why members should vote for you…"
          style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--g200)', borderRadius: 8, fontSize: 13.5, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--g500)', marginBottom: 5 }}>Photo (optional)</label>
        <input type="file" accept="image/*" onChange={handlePhoto} style={{ fontSize: 13 }} />
        {photo && <img src={photo} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', display: 'block', marginTop: 8 }} />}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={submit} style={{ padding: '10px 24px', background: '#0891b2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>Submit Application</button>
        <button onClick={onCancel} style={{ padding: '10px 18px', background: 'transparent', color: 'var(--g500)', border: '1.5px solid var(--g200)', borderRadius: 8, fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  )
}

/* ── Candidate card (ballot phase) ───────────────────────────── */
function CandidateCard({ candidate, selected, onSelect, locked }) {
  return (
    <div onClick={() => !locked && onSelect(candidate.id)}
      style={{ width: 200, minWidth: 200, borderRadius: 14, padding: '20px 16px 16px', flexShrink: 0,
        border: `2px solid ${selected ? '#0891b2' : 'var(--g100)'}`,
        background: selected ? 'rgba(8,145,178,.06)' : 'var(--white)',
        cursor: locked ? 'default' : 'pointer', transition: 'all .18s',
        boxShadow: selected ? '0 0 0 3px rgba(8,145,178,.15)' : '0 2px 8px rgba(0,0,0,.04)' }}>
      {/* Avatar */}
      {candidate.photo
        ? <img src={candidate.photo} alt={candidate.name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto 12px' }} />
        : <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#0891b2,#0e7490)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{candidate.name.charAt(0)}</span>
          </div>
      }
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 3, lineHeight: 1.3 }}>{candidate.name}</div>
        {candidate.university && <div style={{ fontSize: 11.5, color: 'var(--g500)', marginBottom: 3 }}>{candidate.university}</div>}
        {candidate.programme  && <div style={{ fontSize: 11, color: 'var(--g400)', marginBottom: 8 }}>{candidate.programme}</div>}
        {candidate.bio && (
          <p style={{ fontSize: 11.5, color: 'var(--g600)', lineHeight: 1.6, margin: 0,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {candidate.bio}
          </p>
        )}
        {selected && (
          <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 5, background: '#0891b2', color: '#fff', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700 }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Selected
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Main component ───────────────────────────────────────────── */
export default function Voting() {
  const { user } = useAuth()
  const [config, setConfig]       = useState(() => load(K_CFG, { voting_open: false, title: 'AUSI Elections 2026/27' }))
  const [positions, setPositions] = useState(() => load(K_POS, []))
  const [candidates, setCandidates] = useState(() => load(K_CAND, []))
  const [applying, setApplying]   = useState(null) // position.id being applied for
  const [ballot, setBallot]       = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [success, setSuccess]     = useState('')

  // Poll for config/positions/candidates changes (admin may update while page is open)
  useEffect(() => {
    const refresh = () => {
      setConfig(load(K_CFG, { voting_open: false, title: 'AUSI Elections 2026/27' }))
      setPositions(load(K_POS, []))
      setCandidates(load(K_CAND, []))
    }
    refresh()
    const id = setInterval(refresh, 4000)
    return () => clearInterval(id)
  }, [])

  // Load this user's existing ballot
  useEffect(() => {
    if (!user) return
    const votes = load(K_VOTE, [])
    const mine  = votes.find(v => v.voter_id === user.id || v.voter_email === user.email)
    if (mine) { setBallot(mine.ballot || {}); setSubmitted(mine.submitted || false) }
  }, [user])

  const orderedPositions = [...positions].sort((a, b) => a.order - b.order)
  const approved = candidates.filter(c => c.status === 'approved')

  // Current user's applications
  const myApplications = candidates.filter(c =>
    c.applicant_id === user?.id || c.applicant_email === user?.email
  )
  const myAppForPos = (pid) => myApplications.find(a => a.position_id === pid)

  // Submit application
  const submitApplication = ({ manifesto, photo }) => {
    const all = load(K_CAND, [])
    const newEntry = {
      id:              Date.now(),
      position_id:     applying,
      name:            user?.full_name || 'Unknown',
      university:      user?.university || '',
      programme:       user?.field_of_study || '',
      bio:             manifesto,
      photo:           photo || '',
      status:          'pending',
      applicant_id:    user?.id,
      applicant_email: user?.email,
      created_at:      new Date().toISOString(),
    }
    const updated = [...all, newEntry]
    save(K_CAND, updated)
    setCandidates(updated)
    setApplying(null)
    setSuccess('Your application has been submitted and is under review by the Electoral Commission.')
    setTimeout(() => setSuccess(''), 6000)
  }

  // Select candidate in ballot
  const select = (position_id, candidate_id) => {
    if (submitted) return
    const next = { ...ballot }
    if (next[position_id] === candidate_id) delete next[position_id]
    else next[position_id] = candidate_id
    setBallot(next)
    const votes = load(K_VOTE, [])
    const idx   = votes.findIndex(v => v.voter_id === user?.id || v.voter_email === user?.email)
    const entry = { voter_id: user?.id, voter_email: user?.email, ballot: next, submitted: false }
    save(K_VOTE, idx >= 0 ? votes.map((v, i) => i === idx ? entry : v) : [...votes, entry])
  }

  // Submit ballot
  const submitBallot = () => {
    const votes = load(K_VOTE, [])
    const idx   = votes.findIndex(v => v.voter_id === user?.id || v.voter_email === user?.email)
    const entry = { voter_id: user?.id, voter_email: user?.email, ballot, submitted: true, submitted_at: new Date().toISOString() }
    save(K_VOTE, idx >= 0 ? votes.map((v, i) => i === idx ? entry : v) : [...votes, entry])
    setSubmitted(true); setConfirming(false)
  }

  const ballotPositions = orderedPositions.filter(p => approved.some(c => c.position_id === p.id))
  const selCount        = Object.keys(ballot).length
  const posName = pid => positions.find(p => p.id === pid)?.title || ''
  const candName = cid => candidates.find(c => c.id === cid)?.name || ''

  return (
    <div style={{ background: 'var(--off)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding: '36px 0 32px' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', display: 'block', marginBottom: 12 }} />
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 8 }}>AUSI · 2026 / 27</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
            {config.title || 'Voting & Elections'}
          </h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.4)', margin: 0 }}>
            {config.voting_open
              ? 'Voting is open — select your candidate for each position and submit your ballot.'
              : orderedPositions.length > 0
                ? 'Positions have been declared. Apply to contest a role below.'
                : 'No election has been announced yet.'}
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 96 }}>

        {/* Success banner */}
        {success && (
          <div style={{ background: 'rgba(5,150,105,.08)', border: '1.5px solid rgba(5,150,105,.25)', borderRadius: 10, padding: '12px 18px', marginBottom: 24, fontSize: 13.5, color: '#065f46', fontWeight: 600 }}>
            ✓ {success}
          </div>
        )}

        {/* ── NO POSITIONS DECLARED ── */}
        {orderedPositions.length === 0 && (
          <div style={{ background: 'var(--white)', border: '1px solid var(--g100)', borderRadius: 16, padding: '64px 32px', textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗳️</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>No Election Announced</div>
            <div style={{ fontSize: 14, color: 'var(--g500)', lineHeight: 1.7 }}>
              When AUSI leadership declares election positions, they will appear here and you'll be able to apply to contest.
            </div>
          </div>
        )}

        {/* ── APPLY PHASE (positions declared, voting not open) ── */}
        {orderedPositions.length > 0 && !config.voting_open && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--g400)', marginBottom: 20 }}>
              Declared Positions — Apply to Contest
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {orderedPositions.map(pos => {
                const myApp    = myAppForPos(pos.id)
                const totalApp = candidates.filter(c => c.position_id === pos.id).length
                const isApplying = applying === pos.id

                return (
                  <div key={pos.id} style={{ background: 'var(--white)', border: `1.5px solid ${myApp?.status === 'approved' ? 'rgba(5,150,105,.3)' : myApp ? 'var(--g200)' : 'var(--g100)'}`, borderRadius: 14, padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#0891b2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{pos.order}</div>
                          <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>{pos.title}</div>
                          {myApp && <StatusBadge status={myApp.status} />}
                        </div>
                        {pos.description && <div style={{ fontSize: 13, color: 'var(--g500)', marginBottom: 6, paddingLeft: 42 }}>{pos.description}</div>}
                        <div style={{ fontSize: 12, color: 'var(--g400)', paddingLeft: 42 }}>
                          {totalApp} applicant{totalApp !== 1 ? 's' : ''} so far
                        </div>
                      </div>

                      {!myApp && (
                        <button onClick={() => setApplying(isApplying ? null : pos.id)}
                          style={{ padding: '10px 22px', background: isApplying ? 'var(--g200)' : '#0891b2', color: isApplying ? 'var(--ink)' : '#fff',
                            border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', flexShrink: 0 }}>
                          {isApplying ? 'Cancel' : 'Apply to Contest'}
                        </button>
                      )}

                      {myApp?.status === 'pending' && (
                        <div style={{ fontSize: 12.5, color: '#92400e', background: 'rgba(217,119,6,.08)', borderRadius: 8, padding: '8px 14px', flexShrink: 0 }}>
                          Under review by Electoral Commission
                        </div>
                      )}
                      {myApp?.status === 'approved' && (
                        <div style={{ fontSize: 12.5, color: '#065f46', background: 'rgba(5,150,105,.08)', borderRadius: 8, padding: '8px 14px', flexShrink: 0 }}>
                          You are approved to contest this position
                        </div>
                      )}
                      {myApp?.status === 'rejected' && (
                        <div style={{ fontSize: 12.5, color: '#b91c1c', background: 'rgba(220,38,38,.06)', borderRadius: 8, padding: '8px 14px', flexShrink: 0 }}>
                          Application was not approved
                        </div>
                      )}
                    </div>

                    {isApplying && !myApp && (
                      <ApplyForm position={pos} onSubmit={submitApplication} onCancel={() => setApplying(null)} />
                    )}
                  </div>
                )
              })}
            </div>

            <div style={{ marginTop: 28, padding: '16px 20px', background: 'rgba(8,145,178,.05)', border: '1px solid rgba(8,145,178,.15)', borderRadius: 10, fontSize: 13, color: 'var(--g600)' }}>
              <strong style={{ color: 'var(--ink)' }}>How it works:</strong> Apply for any position you'd like to contest. Your application is reviewed by the Electoral Commission and approved by the AUSI President or Admin. Once all candidates are approved, voting will be opened for all members.
            </div>
          </>
        )}

        {/* ── BALLOT SUBMITTED ── */}
        {config.voting_open && submitted && (
          <div>
            <div style={{ background: 'rgba(5,150,105,.08)', border: '1.5px solid rgba(5,150,105,.25)', borderRadius: 14, padding: '20px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: 32, flexShrink: 0 }}>✅</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#065f46', marginBottom: 2 }}>Your ballot has been submitted</div>
                <div style={{ fontSize: 13, color: '#047857' }}>Thank you for voting. Your choices are final and cannot be changed.</div>
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--g400)', marginBottom: 16 }}>Your Votes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ballotPositions.map(pos => (
                <div key={pos.id} style={{ background: 'var(--white)', border: '1px solid var(--g100)', borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ fontSize: 13, color: 'var(--g500)', fontWeight: 600 }}>{pos.title}</div>
                  <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 14 }}>
                    {ballot[pos.id] ? candName(ballot[pos.id]) : <span style={{ color: 'var(--g400)', fontStyle: 'italic', fontWeight: 400 }}>Abstained</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BALLOT OPEN — CAST VOTE ── */}
        {config.voting_open && !submitted && ballotPositions.length > 0 && (
          <>
            {ballotPositions.map(pos => {
              const cands = approved.filter(c => c.position_id === pos.id)
              return (
                <div key={pos.id} style={{ marginBottom: 44 }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#0891b2', marginBottom: 4 }}>Position</div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{pos.title}</div>
                    {pos.description && <div style={{ fontSize: 13, color: 'var(--g500)', marginTop: 3 }}>{pos.description}</div>}
                    <div style={{ fontSize: 12, color: 'var(--g400)', marginTop: 5 }}>
                      {ballot[pos.id] ? `✓ You selected ${candName(ballot[pos.id])}` : 'Click a card to select · click again to deselect'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }} className="hscroll">
                    {cands.map(c => (
                      <CandidateCard key={c.id} candidate={c} selected={ballot[pos.id] === c.id} onSelect={cid => select(pos.id, cid)} locked={false} />
                    ))}
                  </div>
                  <div style={{ height: 1, background: 'var(--g100)', marginTop: 24 }} />
                </div>
              )
            })}
          </>
        )}

        {config.voting_open && !submitted && ballotPositions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '56px 0', color: 'var(--g400)', fontSize: 14 }}>
            No approved candidates yet. Check back soon.
          </div>
        )}

      </div>

      {/* Sticky submit bar */}
      {config.voting_open && !submitted && ballotPositions.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 250, right: 0, background: '#fff', borderTop: '1.5px solid var(--g100)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, zIndex: 50, flexWrap: 'wrap' }} className="db-submit-bar">
          <div style={{ fontSize: 13.5, color: 'var(--g600)' }}>
            <span style={{ fontWeight: 700, color: selCount > 0 ? '#0891b2' : 'var(--g400)' }}>{selCount}</span>
            <span style={{ color: 'var(--g400)' }}> / {ballotPositions.length} position{ballotPositions.length !== 1 ? 's' : ''} selected</span>
          </div>
          {!confirming
            ? <button onClick={() => setConfirming(true)} disabled={selCount === 0}
                style={{ padding: '11px 28px', background: selCount > 0 ? '#0891b2' : 'var(--g200)', color: selCount > 0 ? '#fff' : 'var(--g400)', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: selCount > 0 ? 'pointer' : 'not-allowed' }}>
                Submit Ballot
              </button>
            : <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: '#b45309', fontWeight: 600 }}>This cannot be undone.</span>
                <button onClick={submitBallot} style={{ padding: '10px 22px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>Confirm &amp; Submit</button>
                <button onClick={() => setConfirming(false)} style={{ padding: '10px 16px', background: 'var(--g100)', color: 'var(--ink)', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              </div>
          }
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .db-submit-bar { left: 0 !important; } }
      `}</style>
    </div>
  )
}
