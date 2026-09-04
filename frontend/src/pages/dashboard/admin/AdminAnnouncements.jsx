import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'

const TYPES = ['general', 'event', 'urgent', 'academic']
const TYPE_LABELS = { general:'General', event:'Event', urgent:'Urgent', academic:'Academic' }

const TYPE_STYLE = {
  general:  { bg:'rgba(37,99,235,.08)',   text:'#1d4ed8' },
  event:    { bg:'rgba(217,119,6,.08)',   text:'#92400e' },
  urgent:   { bg:'rgba(220,38,38,.08)',   text:'#b91c1c' },
  academic: { bg:'rgba(5,150,105,.08)',   text:'#065f46' },
}

const SEED = [
  {
    id: 1,
    title: 'Welcome to the AUSI Member Portal',
    body: 'The AUSI digital platform is now live! You can access your dashboard, explore resources, connect with fellow Ugandan students, and stay updated on all AUSI activities. More features are being added regularly.',
    author: 'AUSI Secretariat',
    date: '2025-07-01',
    type: 'general',
    pinned: true,
  },
]

const inp = { width:'100%', padding:'10px 14px', border:'1.5px solid var(--g200)', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box' }
const lbl = { display:'block', fontSize:11.5, fontWeight:700, color:'var(--g500)', marginBottom:6, letterSpacing:.5, textTransform:'uppercase' }

function Modal({ title, onClose, children }) {
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:1000 }} />
      <div data-lenis-prevent style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:1001, background:'var(--white)', borderRadius:18, width:'min(94vw,600px)', maxHeight:'90vh', overflow:'auto', overscrollBehavior:'contain', boxShadow:'0 32px 100px rgba(0,0,0,.25)' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--g100)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'var(--white)', zIndex:1 }}>
          <h3 style={{ fontFamily:'var(--serif)', fontSize:18, fontWeight:700, color:'var(--ink)', margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, color:'var(--g400)', padding:'0 4px' }}>×</button>
        </div>
        <div style={{ padding:'24px' }}>{children}</div>
      </div>
    </>
  )
}

export default function AdminAnnouncements() {
  const { user } = useAuth()

  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ausi_announcements') || 'null') || SEED }
    catch { return SEED }
  })
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [typeFilter, setTypeFilter] = useState('all')

  const BLANK = {
    title: '', body: '',
    author: user?.full_name || 'AUSI Secretariat',
    date: new Date().toISOString().split('T')[0],
    type: 'general', pinned: false,
  }

  const save = n => { setItems(n); localStorage.setItem('ausi_announcements', JSON.stringify(n)) }
  const set = k => e => setForm(f => ({ ...f, [k]: e.type === 'checkbox' ? e.target.checked : e.target.value }))

  const openAdd = () => { setForm(BLANK); setModal('add') }
  const openEdit = item => { setForm({ ...item }); setModal(item) }

  const submit = () => {
    if (!form.title.trim() || !form.body.trim()) return
    if (modal === 'add') {
      save([{ ...form, id: Date.now() }, ...items])
    } else {
      save(items.map(i => i.id === modal.id ? { ...i, ...form } : i))
    }
    setModal(null)
  }

  const del = id => { save(items.filter(i => i.id !== id)); setDelTarget(null) }

  const togglePin = id => save(items.map(i => i.id === id ? { ...i, pinned: !i.pinned } : i))

  const displayed = typeFilter === 'all' ? items : items.filter(i => i.type === typeFilter)

  return (
    <div style={{ background:'var(--off)', minHeight:'100vh' }}>
      <div style={{ background:'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding:'36px 0 32px', color:'#fff' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>AUSI · Admin</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Announcements</h1>
          <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>Post and manage official notices for all members</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop:32, paddingBottom:64 }}>
        <div style={{ display:'flex', gap:10, justifyContent:'space-between', alignItems:'flex-end', marginBottom:20, flexWrap:'wrap' }}>
          <div className="hscroll" style={{ display:'flex', gap:24, borderBottom:'1px solid var(--g100)', paddingBottom:14, overflowX:'auto', flexWrap:'nowrap', flex:1 }}>
            {['all', ...TYPES].map(t => {
              const active = typeFilter === t
              return (
                <button key={t} onClick={() => setTypeFilter(t)}
                  style={{ background:'none', border:'none', borderBottom:`2px solid ${active ? 'var(--ink)' : 'transparent'}`, cursor:'pointer', padding:'0 0 4px', fontSize:14, fontWeight: active ? 800 : 500, color: active ? 'var(--ink)' : 'var(--g400)', transition:'color .15s, border-color .15s', textTransform:'capitalize', whiteSpace:'nowrap' }}>
                  {t === 'all' ? `All (${items.length})` : `${TYPE_LABELS[t]} (${items.filter(i => i.type === t).length})`}
                </button>
              )
            })}
          </div>
          <button onClick={openAdd} style={{ padding:'10px 22px', background:'var(--ink)', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:13.5, cursor:'pointer', flexShrink:0 }}>
            + New Announcement
          </button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {displayed.length === 0 ? (
            <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'48px', textAlign:'center', color:'var(--g400)', fontSize:14 }}>
              No announcements yet.
            </div>
          ) : displayed.map(item => {
            const ts = TYPE_STYLE[item.type] || TYPE_STYLE.general
            return (
              <div key={item.id} style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, overflow:'hidden' }}>
                <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid var(--g100)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, flexWrap:'wrap' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:4, background:ts.bg, color:ts.text, textTransform:'uppercase', letterSpacing:.5 }}>{TYPE_LABELS[item.type]}</span>
                      {item.pinned && <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--g400)' }}>Pinned</span>}
                      <span style={{ fontSize:12, color:'var(--g400)', marginLeft:'auto' }}>{new Date(item.date).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</span>
                    </div>
                    <h3 style={{ fontFamily:'var(--serif)', fontSize:16, fontWeight:700, color:'var(--ink)', margin:'0 0 4px' }}>{item.title}</h3>
                    <div style={{ fontSize:12, color:'var(--g500)' }}>— {item.author}</div>
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    <button onClick={() => togglePin(item.id)}
                      style={{ fontSize:12, fontWeight:700, padding:'6px 12px', border:`1px solid ${item.pinned ? 'rgba(201,146,10,.4)' : 'var(--g200)'}`, borderRadius:8, cursor:'pointer', background: item.pinned ? 'rgba(201,146,10,.07)' : 'var(--off)', color: item.pinned ? '#92400e' : 'var(--g500)' }}>
                      {item.pinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button onClick={() => openEdit(item)} style={{ fontSize:12, fontWeight:700, padding:'6px 14px', border:'1px solid var(--g200)', borderRadius:8, cursor:'pointer', background:'var(--off)', color:'var(--ink)' }}>Edit</button>
                    <button onClick={() => setDelTarget(item)} style={{ fontSize:12, fontWeight:700, padding:'6px 14px', border:'1px solid rgba(220,38,38,.3)', borderRadius:8, cursor:'pointer', background:'rgba(220,38,38,.06)', color:'#dc2626' }}>Delete</button>
                  </div>
                </div>
                <div style={{ padding:'14px 22px', fontSize:13.5, color:'var(--g600)', lineHeight:1.65 }}>{item.body}</div>
              </div>
            )
          })}
        </div>
      </div>

      {modal && form && (
        <Modal title={modal === 'add' ? 'New Announcement' : 'Edit Announcement'} onClose={() => setModal(null)}>
          <div style={{ marginBottom:16 }}>
            <label style={lbl}>Title</label>
            <input value={form.title} onChange={set('title')} style={inp} placeholder="Announcement title…" />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            <div>
              <label style={lbl}>Type</label>
              <select value={form.type} onChange={set('type')} style={{ ...inp, cursor:'pointer' }}>
                {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Date</label>
              <input type="date" value={form.date} onChange={set('date')} style={inp} />
            </div>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={lbl}>Author / Signed by</label>
            <input value={form.author} onChange={set('author')} style={inp} placeholder="e.g. AUSI Secretariat" />
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={lbl}>Body</label>
            <textarea value={form.body} onChange={set('body')} rows={6} style={{ ...inp, resize:'vertical', lineHeight:1.6, fontFamily:'inherit' }} placeholder="Write the announcement here…" />
          </div>
          <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', marginBottom:20 }}>
            <input type="checkbox" checked={form.pinned} onChange={set('pinned')} style={{ width:16, height:16 }} />
            <span style={{ fontSize:14, color:'var(--g600)' }}>Pin to top of announcements</span>
          </label>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setModal(null)} style={{ flex:1, padding:'10px', border:'1px solid var(--g200)', borderRadius:8, background:'transparent', cursor:'pointer', fontWeight:700, fontSize:13.5, color:'var(--g600)' }}>Cancel</button>
            <button onClick={submit} style={{ flex:2, padding:'10px', background:'var(--ink)', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:13.5, cursor:'pointer' }}>
              {modal === 'add' ? 'Publish' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}

      {delTarget && (
        <Modal title="Delete Announcement" onClose={() => setDelTarget(null)}>
          <p style={{ fontSize:14, color:'var(--g600)', marginBottom:22 }}>Delete <strong>"{delTarget.title}"</strong>? This cannot be undone.</p>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setDelTarget(null)} style={{ flex:1, padding:'10px', border:'1px solid var(--g200)', borderRadius:8, background:'transparent', cursor:'pointer', fontWeight:700, fontSize:13.5, color:'var(--g600)' }}>Cancel</button>
            <button onClick={() => del(delTarget.id)} style={{ flex:1, padding:'10px', border:'none', borderRadius:8, background:'#dc2626', cursor:'pointer', fontWeight:700, fontSize:13.5, color:'#fff' }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
