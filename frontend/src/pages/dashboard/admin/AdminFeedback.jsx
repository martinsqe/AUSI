import { useState, useEffect } from 'react'
import { ROLE_LABELS } from '../../../lib/roles'

const SUBJECTS = [
  'General Feedback', 'Event Suggestion', 'Website / Platform Issue',
  'Academic Support Request', 'Housing / FRRO Help', 'Financial Hardship',
  'Community Issue', 'Compliment / Appreciation', 'Other',
]

const STATUS_META = {
  new:     { label: 'New',     bg: 'rgba(220,38,38,.08)',   text: '#b91c1c' },
  read:    { label: 'Read',    bg: 'rgba(37,99,235,.08)',   text: '#1d4ed8' },
  replied: { label: 'Replied', bg: 'rgba(34,197,94,.1)',    text: '#15803d' },
}

export default function AdminFeedback() {
  const [items,   setItems]   = useState([])
  const [filter,  setFilter]  = useState('all')
  const [subjF,   setSubjF]   = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [delId,   setDelId]   = useState(null)

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('ausi_feedback') || '[]')
      setItems(raw)
    } catch { setItems([]) }
  }, [])

  const save = updated => {
    setItems(updated)
    localStorage.setItem('ausi_feedback', JSON.stringify(updated))
  }

  const markStatus = (id, status) =>
    save(items.map(i => i.id === id ? { ...i, status } : i))

  const del = id => {
    save(items.filter(i => i.id !== id))
    setDelId(null)
    if (expanded === id) setExpanded(null)
  }

  const filtered = items.filter(i => {
    if (filter !== 'all' && i.status !== filter) return false
    if (subjF  !== 'all' && i.subject !== subjF)  return false
    return true
  })

  const counts = { new: 0, read: 0, replied: 0 }
  items.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1 })

  return (
    <div style={{ background: 'var(--off)', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding: '36px 0 32px', color: '#fff' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>AUSI · Management</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Feedback Inbox</h1>
          <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>Member feedback and suggestions submitted to leadership</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop:32, paddingBottom:64 }}>

        {/* Summary counts */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:12, marginBottom:28 }}>
          {[
            { label:'Total',   value: items.length,      color:'#111118' },
            { label:'New',     value: counts.new||0,     color:'#b91c1c' },
            { label:'Read',    value: counts.read||0,    color:'#2563eb' },
            { label:'Replied', value: counts.replied||0, color:'#059669' },
          ].map(s => (
            <div key={s.label} style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:12, padding:'16px 18px' }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.6, textTransform:'uppercase', color:'var(--g400)', marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:26, fontWeight:800, color:s.color, fontFamily:'var(--serif)', lineHeight:1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:14, marginBottom:22, flexWrap:'wrap', alignItems:'center' }}>
          <div className="hscroll" style={{ display:'flex', gap:20, borderBottom:'1px solid var(--g100)', paddingBottom:12, overflowX:'auto', flexWrap:'nowrap', flex:1 }}>
            {['all', 'new', 'read', 'replied'].map(f => {
              const active = filter === f
              return (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ background:'none', border:'none', borderBottom:`2px solid ${active ? 'var(--ink)' : 'transparent'}`, cursor:'pointer', padding:'0 0 4px', fontSize:13.5, fontWeight:active ? 800 : 500, color:active ? 'var(--ink)' : 'var(--g400)', transition:'color .15s, border-color .15s', textTransform:'capitalize', whiteSpace:'nowrap' }}>
                  {f === 'all' ? 'All' : STATUS_META[f]?.label}
                </button>
              )
            })}
          </div>
          <select value={subjF} onChange={e => setSubjF(e.target.value)}
            style={{ padding:'8px 12px', border:'1.5px solid var(--g200)', borderRadius:8, fontSize:13, background:'var(--white)', color:'var(--g600)', cursor:'pointer', flexShrink:0 }}>
            <option value="all">All subjects</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'64px', textAlign:'center', color:'var(--g400)', fontSize:14 }}>
            {items.length === 0 ? 'No feedback received yet.' : 'No feedback matches the selected filters.'}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {filtered.map(item => {
              const sm = STATUS_META[item.status] || STATUS_META.new
              const isExp = expanded === item.id
              const preview = item.message?.slice(0, 220)
              return (
                <div key={item.id} style={{ background:'var(--white)', border:`1px solid ${item.status === 'new' ? 'rgba(220,38,38,.25)' : 'var(--g100)'}`, borderRadius:14, overflow:'hidden' }}>
                  <div style={{ padding:'18px 22px', display:'flex', gap:16, alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      {/* Meta row */}
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:10 }}>
                        <span style={{ fontSize:11, fontWeight:700, letterSpacing:.6, textTransform:'uppercase', padding:'2px 9px', borderRadius:4, background:sm.bg, color:sm.text }}>
                          {sm.label}
                        </span>
                        <span style={{ fontSize:12.5, fontWeight:700, color:'var(--ink)' }}>{item.subject}</span>
                        <span style={{ fontSize:12, color:'var(--g400)' }}>·</span>
                        <span style={{ fontSize:12, color:'var(--g500)' }}>
                          {new Date(item.submitted_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                          {' '}
                          {new Date(item.submitted_at).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}
                        </span>
                      </div>

                      {/* Sender */}
                      <div style={{ fontSize:12.5, color:'var(--g500)', marginBottom:10 }}>
                        {item.anonymous
                          ? <em>Anonymous member</em>
                          : <>
                              <strong style={{ color:'var(--ink)' }}>{item.sender_name || 'Unknown'}</strong>
                              {item.sender_email && <> · {item.sender_email}</>}
                              {item.sender_role  && <> · <span style={{ textTransform:'capitalize' }}>{ROLE_LABELS[item.sender_role] || item.sender_role}</span></>}
                            </>
                        }
                      </div>

                      {/* Message preview */}
                      <div style={{ fontSize:13.5, color:'var(--g700)', lineHeight:1.65 }}>
                        {isExp ? item.message : (preview + (item.message?.length > 220 ? '…' : ''))}
                      </div>
                      {item.message?.length > 220 && (
                        <button onClick={() => setExpanded(isExp ? null : item.id)}
                          style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:'var(--g500)', padding:'6px 0 0', textDecoration:'underline' }}>
                          {isExp ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display:'flex', gap:6, flexShrink:0, flexWrap:'wrap' }}>
                      {item.status === 'new' && (
                        <button onClick={() => markStatus(item.id, 'read')}
                          style={{ fontSize:12, fontWeight:700, padding:'6px 12px', border:'1px solid rgba(37,99,235,.3)', borderRadius:7, cursor:'pointer', background:'rgba(37,99,235,.06)', color:'#1d4ed8', whiteSpace:'nowrap' }}>
                          Mark Read
                        </button>
                      )}
                      {item.status !== 'replied' && (
                        <button onClick={() => markStatus(item.id, 'replied')}
                          style={{ fontSize:12, fontWeight:700, padding:'6px 12px', border:'1px solid rgba(34,197,94,.3)', borderRadius:7, cursor:'pointer', background:'rgba(34,197,94,.06)', color:'#15803d', whiteSpace:'nowrap' }}>
                          Mark Replied
                        </button>
                      )}
                      {item.status !== 'new' && (
                        <button onClick={() => markStatus(item.id, 'new')}
                          style={{ fontSize:12, fontWeight:700, padding:'6px 12px', border:'1px solid var(--g200)', borderRadius:7, cursor:'pointer', background:'var(--off)', color:'var(--g600)', whiteSpace:'nowrap' }}>
                          Re-open
                        </button>
                      )}
                      <button onClick={() => setDelId(item.id)}
                        style={{ fontSize:12, fontWeight:700, padding:'6px 12px', border:'1px solid rgba(220,38,38,.3)', borderRadius:7, cursor:'pointer', background:'rgba(220,38,38,.06)', color:'#dc2626', whiteSpace:'nowrap' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {delId && (
        <>
          <div onClick={() => setDelId(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:1000 }} />
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:1001, background:'var(--white)', borderRadius:16, padding:'28px', width:'min(92vw,420px)', boxShadow:'0 24px 80px rgba(0,0,0,.2)' }}>
            <h3 style={{ fontFamily:'var(--serif)', fontSize:18, fontWeight:700, color:'var(--ink)', margin:'0 0 10px' }}>Delete Feedback</h3>
            <p style={{ fontSize:13.5, color:'var(--g600)', marginBottom:22 }}>This feedback will be permanently deleted and cannot be recovered.</p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setDelId(null)} style={{ flex:1, padding:'10px', border:'1px solid var(--g200)', borderRadius:8, background:'transparent', cursor:'pointer', fontWeight:700, fontSize:13.5, color:'var(--g600)' }}>Cancel</button>
              <button onClick={() => del(delId)} style={{ flex:1, padding:'10px', border:'none', borderRadius:8, background:'#dc2626', cursor:'pointer', fontWeight:700, fontSize:13.5, color:'#fff' }}>Delete</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
