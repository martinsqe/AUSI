import { useState } from 'react'

const TYPES = ['Announcement', 'Warning', 'Event', 'Service Update', 'Holiday Closure']

const SEED = [
  { id:1, title:'Uganda High Commission – Office Hours 2026', type:'Announcement', date:'2026-07-01', content:'The Uganda High Commission in New Delhi will observe standard office hours: Monday to Friday, 9:00 AM – 4:00 PM IST. Consular services are available by appointment. Contact: +91-11-2688-5411.' },
  { id:2, title:'National Day Reception – October 9th', type:'Event', date:'2026-08-15', content:'The High Commission of Uganda cordially invites all Ugandan nationals in India to the Independence Day reception on October 9th, 2026. Venue and RSVP details will be shared closer to the date via the AUSI WhatsApp group.' },
]

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

const BLANK = { title:'', type:'Announcement', date: new Date().toISOString().split('T')[0], content:'' }
const inp = { width:'100%', padding:'10px 14px', border:'1.5px solid var(--g200)', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box' }
const lbl = { display:'block', fontSize:11.5, fontWeight:700, color:'var(--g500)', marginBottom:6, letterSpacing:.5, textTransform:'uppercase' }

const TYPE_COLORS = {
  'Announcement': { bg:'rgba(37,99,235,.08)', text:'#1d4ed8', border:'rgba(37,99,235,.2)' },
  'Warning':      { bg:'rgba(220,38,38,.08)', text:'#b91c1c', border:'rgba(220,38,38,.2)' },
  'Event':        { bg:'rgba(201,146,10,.08)', text:'#92400e', border:'rgba(201,146,10,.2)' },
  'Service Update': { bg:'rgba(5,150,105,.08)', text:'#065f46', border:'rgba(5,150,105,.2)' },
  'Holiday Closure': { bg:'rgba(124,58,237,.08)', text:'#5b21b6', border:'rgba(124,58,237,.2)' },
}

export default function AdminEmbassyNotices() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ausi_embassy') || 'null') || SEED }
    catch { return SEED }
  })
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [delTarget, setDelTarget] = useState(null)

  const save = n => { setItems(n); localStorage.setItem('ausi_embassy', JSON.stringify(n)) }
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const openAdd = () => { setForm(BLANK); setModal('add') }
  const openEdit = item => { setForm({ ...item }); setModal(item) }
  const submit = () => {
    if (!form.title.trim() || !form.content.trim()) return
    if (modal === 'add') save([{ ...form, id: Date.now() }, ...items])
    else save(items.map(i => i.id === modal.id ? { ...i, ...form } : i))
    setModal(null)
  }
  const del = id => { save(items.filter(i => i.id !== id)); setDelTarget(null) }

  return (
    <div style={{ background:'var(--off)', minHeight:'100vh' }}>
      <div style={{ background:'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding:'36px 0 32px', color:'#fff' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>AUSI · Admin</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Embassy Notices</h1>
          <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>Uganda High Commission announcements and updates</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop:32, paddingBottom:64 }}>
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:20 }}>
          <button onClick={openAdd} style={{ padding:'10px 22px', background:'var(--ink)', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:13.5, cursor:'pointer' }}>
            + Add Notice
          </button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {items.map(item => {
            const tc = TYPE_COLORS[item.type] || TYPE_COLORS.Announcement
            return (
              <div key={item.id} style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, overflow:'hidden' }}>
                <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid var(--g100)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, flexWrap:'wrap' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:4, background:tc.bg, color:tc.text }}>{item.type}</span>
                      <span style={{ fontSize:12, color:'var(--g400)' }}>Uganda High Commission, New Delhi</span>
                      <span style={{ fontSize:12, color:'var(--g400)', marginLeft:'auto' }}>{new Date(item.date).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</span>
                    </div>
                    <h3 style={{ fontFamily:'var(--serif)', fontSize:16, fontWeight:700, color:'var(--ink)', margin:0 }}>{item.title}</h3>
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    <button onClick={() => openEdit(item)} style={{ fontSize:12, fontWeight:700, padding:'6px 14px', border:'1px solid var(--g200)', borderRadius:8, cursor:'pointer', background:'var(--off)', color:'var(--ink)' }}>Edit</button>
                    <button onClick={() => setDelTarget(item)} style={{ fontSize:12, fontWeight:700, padding:'6px 14px', border:'1px solid rgba(220,38,38,.3)', borderRadius:8, cursor:'pointer', background:'rgba(220,38,38,.06)', color:'#dc2626' }}>Delete</button>
                  </div>
                </div>
                <div style={{ padding:'14px 22px', fontSize:13.5, color:'var(--g600)', lineHeight:1.65 }}>{item.content}</div>
              </div>
            )
          })}
          {items.length === 0 && (
            <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'48px', textAlign:'center', color:'var(--g400)', fontSize:14 }}>
              No embassy notices yet.
            </div>
          )}
        </div>
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add Embassy Notice' : 'Edit Notice'} onClose={() => setModal(null)}>
          <div style={{ marginBottom:16 }}><label style={lbl}>Title</label><input value={form.title} onChange={set('title')} style={inp} /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            <div><label style={lbl}>Type</label>
              <select value={form.type} onChange={set('type')} style={{ ...inp, cursor:'pointer' }}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Date</label><input type="date" value={form.date} onChange={set('date')} style={inp} /></div>
          </div>
          <div style={{ marginBottom:20 }}><label style={lbl}>Content</label>
            <textarea value={form.content} onChange={set('content')} rows={7} style={{ ...inp, resize:'vertical', lineHeight:1.6, fontFamily:'inherit' }} />
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setModal(null)} style={{ flex:1, padding:'10px', border:'1px solid var(--g200)', borderRadius:8, background:'transparent', cursor:'pointer', fontWeight:700, fontSize:13.5, color:'var(--g600)' }}>Cancel</button>
            <button onClick={submit} style={{ flex:2, padding:'10px', background:'var(--ink)', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:13.5, cursor:'pointer' }}>
              {modal === 'add' ? 'Publish Notice' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}

      {delTarget && (
        <Modal title="Delete Notice" onClose={() => setDelTarget(null)}>
          <p style={{ fontSize:14, color:'var(--g600)', marginBottom:22 }}>Delete <strong>"{delTarget.title}"</strong>?</p>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setDelTarget(null)} style={{ flex:1, padding:'10px', border:'1px solid var(--g200)', borderRadius:8, background:'transparent', cursor:'pointer', fontWeight:700, color:'var(--g600)' }}>Cancel</button>
            <button onClick={() => del(delTarget.id)} style={{ flex:1, padding:'10px', border:'none', borderRadius:8, background:'#dc2626', cursor:'pointer', fontWeight:700, color:'#fff' }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
