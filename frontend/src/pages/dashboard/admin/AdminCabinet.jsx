import { useState } from 'react'
import { getCabinet, saveCabinet, DEFAULT_CABINET, makeMember } from '../../../lib/cabinetStore'

function Modal({ title, onClose, children }) {
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:1000 }} />
      <div data-lenis-prevent style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:1001, background:'var(--white)', borderRadius:18, width:'min(94vw,600px)', maxHeight:'92vh', overflow:'auto', overscrollBehavior:'contain', boxShadow:'0 32px 100px rgba(0,0,0,.25)' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--g100)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'var(--white)', zIndex:1 }}>
          <h3 style={{ fontFamily:'var(--serif)', fontSize:18, fontWeight:700, color:'var(--ink)', margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, color:'var(--g400)', padding:'0 4px' }}>×</button>
        </div>
        <div style={{ padding:'24px' }}>{children}</div>
      </div>
    </>
  )
}

const BLANK = { name:'', pos:'', uni:'', email:'', phone:'', photo:'', resp:'' }
const inp = { width:'100%', padding:'10px 14px', border:'1.5px solid var(--g200)', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box' }
const lbl = { display:'block', fontSize:11.5, fontWeight:700, color:'var(--g500)', marginBottom:6, letterSpacing:.5, textTransform:'uppercase' }

export default function AdminCabinet() {
  const [members, setMembers] = useState(getCabinet)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [delTarget, setDelTarget] = useState(null)

  const save = n => { setMembers(n); saveCabinet(n) }
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const openAdd = () => { setForm(BLANK); setModal('add') }
  const openEdit = m => {
    setForm({ name: m.name, pos: m.pos, uni: m.uni, email: m.email, phone: m.phone || '', photo: m.photo || '', resp: m.resp || '' })
    setModal(m)
  }

  const submit = () => {
    if (!form.name.trim() || !form.pos.trim()) return
    if (modal === 'add') {
      const newMember = makeMember({ ...form, index: members.length })
      save([...members, newMember])
    } else {
      save(members.map(m => m.id === modal.id ? { ...m, ...form, badge: form.pos } : m))
    }
    setModal(null)
  }

  const del = id => { save(members.filter(m => m.id !== id)); setDelTarget(null) }

  const resetToDefault = () => { save(DEFAULT_CABINET) }

  return (
    <div style={{ background:'var(--off)', minHeight:'100vh' }}>
      <div style={{ background:'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding:'36px 0 32px', color:'#fff' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>AUSI · Admin</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Cabinet</h1>
          <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>Manage the AUSI 2026/27 executive committee — changes reflect on the public page</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop:32, paddingBottom:64 }}>

        <div style={{ background:'rgba(37,99,235,.05)', border:'1px solid rgba(37,99,235,.15)', borderRadius:10, padding:'12px 18px', marginBottom:24, fontSize:13, color:'#1d4ed8' }}>
          Changes made here are immediately reflected on the public Leadership page and the Cabinet dashboard page.
        </div>

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginBottom:20, flexWrap:'wrap' }}>
          <button onClick={resetToDefault}
            style={{ padding:'9px 18px', background:'var(--white)', color:'var(--g600)', border:'1px solid var(--g200)', borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer' }}>
            Reset to Defaults
          </button>
          <button onClick={openAdd}
            style={{ padding:'10px 22px', background:'var(--ink)', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:13.5, cursor:'pointer' }}>
            + Add Position
          </button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {members.map((m, idx) => {
            const initials = m.initials || (m.name || '').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
            return (
              <div key={m.id} style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, overflow:'hidden' }}>
                <div style={{ background:'linear-gradient(135deg,#111118,#2a1a00)', padding:'18px 20px', display:'flex', gap:14, alignItems:'center' }}>
                  <div style={{ width:48, height:48, borderRadius:'50%', background: m.color || 'rgba(201,146,10,.2)', border:`2px solid ${m.border || 'rgba(201,146,10,.4)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontSize:16, fontWeight:800, color: m.text || '#c9920a', flexShrink:0, overflow:'hidden' }}>
                    {m.photo ? <img src={m.photo} alt={m.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }} /> : initials}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:'var(--serif)', fontSize:14, fontWeight:700, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.name}</div>
                    <div style={{ fontSize:11.5, color:'#c9920a', fontWeight:600, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.pos}</div>
                  </div>
                  <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.25)', flexShrink:0 }}>#{idx+1}</div>
                </div>
                <div style={{ padding:'12px 16px 8px' }}>
                  <div style={{ fontSize:12.5, color:'var(--g600)', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.uni}</div>
                  <div style={{ fontSize:12, color:'var(--g500)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.email}</div>
                  {m.phone && <div style={{ fontSize:12, color:'var(--g500)', marginTop:2 }}>{m.phone}</div>}
                  {m.resp && <div style={{ fontSize:12, color:'var(--g400)', marginTop:6, lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{m.resp}</div>}
                </div>
                <div style={{ padding:'0 12px 12px', display:'flex', gap:8 }}>
                  <button onClick={() => openEdit(m)} style={{ flex:1, fontSize:12, fontWeight:700, padding:'6px 0', border:'1px solid var(--g200)', borderRadius:7, cursor:'pointer', background:'var(--off)', color:'var(--ink)' }}>Edit</button>
                  <button onClick={() => setDelTarget(m)} style={{ flex:1, fontSize:12, fontWeight:700, padding:'6px 0', border:'1px solid rgba(220,38,38,.3)', borderRadius:7, cursor:'pointer', background:'rgba(220,38,38,.06)', color:'#dc2626' }}>Remove</button>
                </div>
              </div>
            )
          })}
          {members.length === 0 && (
            <div style={{ gridColumn:'1/-1', background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'48px', textAlign:'center', color:'var(--g400)', fontSize:14 }}>
              No cabinet members yet.
            </div>
          )}
        </div>
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add Cabinet Position' : `Edit · ${modal.name}`} onClose={() => setModal(null)}>
          <div style={{ display:'grid', gap:14 }}>
            <div>
              <label style={lbl}>Full Name *</label>
              <input value={form.name} onChange={set('name')} style={inp} placeholder="e.g. Abaho Colleb" />
            </div>
            <div>
              <label style={lbl}>Position / Title *</label>
              <input value={form.pos} onChange={set('pos')} style={inp} placeholder="e.g. President, Treasurer, PRO" />
            </div>
            <div>
              <label style={lbl}>University</label>
              <input value={form.uni} onChange={set('uni')} style={inp} placeholder="e.g. GITAM University · Andhra Pradesh" />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <label style={lbl}>Email</label>
                <input value={form.email} onChange={set('email')} style={inp} placeholder="contact@example.com" />
              </div>
              <div>
                <label style={lbl}>Phone</label>
                <input value={form.phone} onChange={set('phone')} style={inp} placeholder="+91 00000 00000" />
              </div>
            </div>
            <div>
              <label style={lbl}>Photo URL (optional)</label>
              <input value={form.photo} onChange={set('photo')} style={inp} placeholder="https://… or /filename.png" />
            </div>
            <div>
              <label style={lbl}>Responsibilities</label>
              <textarea value={form.resp} onChange={set('resp')} rows={4} style={{ ...inp, resize:'vertical', lineHeight:1.6, fontFamily:'inherit' }} placeholder="Describe the role and key responsibilities…" />
            </div>
            <div style={{ display:'flex', gap:10, marginTop:4 }}>
              <button onClick={() => setModal(null)} style={{ flex:1, padding:'10px', border:'1px solid var(--g200)', borderRadius:8, background:'transparent', cursor:'pointer', fontWeight:700, fontSize:13.5, color:'var(--g600)' }}>Cancel</button>
              <button onClick={submit} style={{ flex:2, padding:'10px', background:'var(--ink)', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:13.5, cursor:'pointer' }}>
                {modal === 'add' ? 'Add to Cabinet' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {delTarget && (
        <Modal title="Remove Member" onClose={() => setDelTarget(null)}>
          <p style={{ fontSize:14, color:'var(--g600)', marginBottom:22 }}>Remove <strong>{delTarget.name}</strong> ({delTarget.pos}) from the cabinet? This will also update the public page.</p>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setDelTarget(null)} style={{ flex:1, padding:'10px', border:'1px solid var(--g200)', borderRadius:8, background:'transparent', cursor:'pointer', fontWeight:700, color:'var(--g600)' }}>Cancel</button>
            <button onClick={() => del(delTarget.id)} style={{ flex:1, padding:'10px', border:'none', borderRadius:8, background:'#dc2626', cursor:'pointer', fontWeight:700, color:'#fff' }}>Remove</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
