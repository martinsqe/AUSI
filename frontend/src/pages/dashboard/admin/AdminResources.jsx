import { useState } from 'react'
import { lsGet, lsSet } from '../../../lib/syncedStore'

const TYPES = ['Scholarship', 'Internship', 'Opportunity']

const BLANK = {
  type: 'Scholarship',
  title: '',
  description: '',
  deadline: '',
  link: '',
  date: new Date().toISOString().split('T')[0],
}

const inp = { width:'100%', padding:'10px 14px', border:'1.5px solid var(--g200)', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box' }
const lbl = { display:'block', fontSize:11.5, fontWeight:700, color:'var(--g500)', marginBottom:6, letterSpacing:.5, textTransform:'uppercase' }

const TYPE_STYLE = {
  Scholarship: { bg:'rgba(201,146,10,.08)', text:'#92400e' },
  Internship:  { bg:'rgba(37,99,235,.08)',  text:'#1d4ed8' },
  Opportunity: { bg:'rgba(5,150,105,.08)',  text:'#047857' },
}

function Modal({ title, onClose, children }) {
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:1000 }} />
      <div data-lenis-prevent style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:1001, background:'var(--white)', borderRadius:18, width:'min(94vw,580px)', maxHeight:'90vh', overflow:'auto', overscrollBehavior:'contain', boxShadow:'0 32px 100px rgba(0,0,0,.25)' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--g100)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'var(--white)', zIndex:1 }}>
          <h3 style={{ fontFamily:'var(--serif)', fontSize:18, fontWeight:700, color:'var(--ink)', margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, color:'var(--g400)', padding:'0 4px' }}>×</button>
        </div>
        <div style={{ padding:'24px' }}>{children}</div>
      </div>
    </>
  )
}

export default function AdminResources() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(lsGet('ausi_resources') || 'null') || [] }
    catch { return [] }
  })
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [delTarget, setDelTarget] = useState(null)
  const [typeFilter, setTypeFilter] = useState('all')

  const save = n => { setItems(n); lsSet('ausi_resources', JSON.stringify(n)) }
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const openAdd = () => { setForm(BLANK); setModal('add') }
  const openEdit = item => { setForm({ ...item }); setModal(item) }

  const submit = () => {
    if (!form.title.trim() || !form.description.trim()) return
    if (modal === 'add') {
      save([{ ...form, id: Date.now() }, ...items])
    } else {
      save(items.map(i => i.id === modal.id ? { ...i, ...form } : i))
    }
    setModal(null)
  }

  const del = id => { save(items.filter(i => i.id !== id)); setDelTarget(null) }

  const displayed = typeFilter === 'all' ? items : items.filter(i => i.type === typeFilter)

  return (
    <div style={{ background:'var(--off)', minHeight:'100vh' }}>
      <div style={{ background:'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding:'36px 0 32px', color:'#fff' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>AUSI · Admin</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Resources</h1>
          <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>Post scholarships, internships and opportunities for members</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop:32, paddingBottom:64 }}>

        <div style={{ display:'flex', gap:10, justifyContent:'space-between', alignItems:'flex-end', marginBottom:20, flexWrap:'wrap' }}>
          <div className="hscroll" style={{ display:'flex', gap:24, borderBottom:'1px solid var(--g100)', paddingBottom:14, overflowX:'auto', flexWrap:'nowrap', flex:1 }}>
            {['all', ...TYPES].map(t => {
              const active = typeFilter === t
              return (
                <button key={t} onClick={() => setTypeFilter(t)}
                  style={{ background:'none', border:'none', borderBottom:`2px solid ${active ? 'var(--ink)' : 'transparent'}`, cursor:'pointer', padding:'0 0 4px', fontSize:14, fontWeight: active ? 800 : 500, color: active ? 'var(--ink)' : 'var(--g400)', transition:'color .15s, border-color .15s', whiteSpace:'nowrap' }}>
                  {t === 'all' ? `All (${items.length})` : `${t}s (${items.filter(i => i.type === t).length})`}
                </button>
              )
            })}
          </div>
          <button onClick={openAdd} style={{ padding:'10px 22px', background:'var(--ink)', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:13.5, cursor:'pointer', flexShrink:0 }}>
            + Add Item
          </button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {displayed.length === 0 ? (
            <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'48px', textAlign:'center', color:'var(--g400)', fontSize:14 }}>
              {typeFilter === 'all' ? <>No items yet. Click <strong>+ Add Item</strong> to post one.</> : `No ${typeFilter.toLowerCase()}s posted yet.`}
            </div>
          ) : displayed.map(item => {
            const ts = TYPE_STYLE[item.type] || TYPE_STYLE.Opportunity
            return (
              <div key={item.id} style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, overflow:'hidden' }}>
                <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid var(--g100)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, flexWrap:'wrap' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:4, background:ts.bg, color:ts.text }}>{item.type}</span>
                      {item.deadline && <span style={{ fontSize:12, color:'var(--g400)' }}>Deadline: {new Date(item.deadline).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</span>}
                      <span style={{ fontSize:12, color:'var(--g400)', marginLeft:'auto' }}>Posted {new Date(item.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</span>
                    </div>
                    <h3 style={{ fontFamily:'var(--serif)', fontSize:16, fontWeight:700, color:'var(--ink)', margin:0 }}>{item.title}</h3>
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    <button onClick={() => openEdit(item)} style={{ fontSize:12, fontWeight:700, padding:'6px 14px', border:'1px solid var(--g200)', borderRadius:8, cursor:'pointer', background:'var(--off)', color:'var(--ink)' }}>Edit</button>
                    <button onClick={() => setDelTarget(item)} style={{ fontSize:12, fontWeight:700, padding:'6px 14px', border:'1px solid rgba(220,38,38,.3)', borderRadius:8, cursor:'pointer', background:'rgba(220,38,38,.06)', color:'#dc2626' }}>Delete</button>
                  </div>
                </div>
                <div style={{ padding:'14px 22px', fontSize:13.5, color:'var(--g600)', lineHeight:1.65 }}>
                  {item.description}
                  {item.link && (
                    <div style={{ marginTop:10 }}>
                      <a href={item.link} target="_blank" rel="noreferrer" style={{ fontSize:12.5, color:'#2563eb', textDecoration:'none', fontWeight:600 }}>Apply / Learn more →</a>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add Resource Item' : 'Edit Item'} onClose={() => setModal(null)}>
          <div style={{ marginBottom:16 }}>
            <label style={lbl}>Type</label>
            <select value={form.type} onChange={set('type')} style={{ ...inp, cursor:'pointer' }}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={lbl}>Title</label>
            <input value={form.title} onChange={set('title')} style={inp} placeholder="e.g. Aga Khan Foundation Scholarship 2026" />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            <div>
              <label style={lbl}>Deadline (optional)</label>
              <input type="date" value={form.deadline} onChange={set('deadline')} style={inp} />
            </div>
            <div>
              <label style={lbl}>Date Posted</label>
              <input type="date" value={form.date} onChange={set('date')} style={inp} />
            </div>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={lbl}>Description</label>
            <textarea value={form.description} onChange={set('description')} rows={5} style={{ ...inp, resize:'vertical', lineHeight:1.6, fontFamily:'inherit' }} placeholder="Describe this opportunity — eligibility, amount, how to apply…" />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={lbl}>Link (optional)</label>
            <input value={form.link} onChange={set('link')} style={inp} placeholder="https://…" />
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setModal(null)} style={{ flex:1, padding:'10px', border:'1px solid var(--g200)', borderRadius:8, background:'transparent', cursor:'pointer', fontWeight:700, fontSize:13.5, color:'var(--g600)' }}>Cancel</button>
            <button onClick={submit} style={{ flex:2, padding:'10px', background:'var(--ink)', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:13.5, cursor:'pointer' }}>
              {modal === 'add' ? 'Publish' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}

      {delTarget && (
        <Modal title="Delete Item" onClose={() => setDelTarget(null)}>
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
