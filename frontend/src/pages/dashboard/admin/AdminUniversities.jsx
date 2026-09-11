import { useState, useEffect, useRef } from 'react'
import { getUniversities, saveUniversities, REGIONS } from '../../../lib/universitiesStore'
import api from '../../../lib/api'

const BLANK = { name:'', city:'', state:'', region:'West India', description:'', website:'', fields:'', imageUrl:'', position:'' }
const inp = { width:'100%', padding:'10px 14px', border:'1.5px solid var(--g200)', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box' }
const lbl = { display:'block', fontSize:11.5, fontWeight:700, color:'var(--g500)', marginBottom:6, letterSpacing:.5, textTransform:'uppercase' }

function Modal({ title, onClose, children }) {
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:1000 }} />
      <div data-lenis-prevent style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:1001, background:'var(--white)', borderRadius:18, width:'min(94vw,640px)', maxHeight:'92vh', overflow:'auto', overscrollBehavior:'contain', boxShadow:'0 32px 100px rgba(0,0,0,.25)' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--g100)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'var(--white)', zIndex:1 }}>
          <h3 style={{ fontFamily:'var(--serif)', fontSize:18, fontWeight:700, color:'var(--ink)', margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, color:'var(--g400)', padding:'0 4px' }}>×</button>
        </div>
        <div style={{ padding:'24px' }}>{children}</div>
      </div>
    </>
  )
}

const regionColor = { 'West India':'#d97706', 'South India':'#059669', 'North India':'#7c3aed', 'East India':'#0891b2', 'Central India':'#be185d' }

/* University photo upload — persisted server-side via multer, not a manual URL */
function ImageUploader({ url, onChange, onError }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const handleFile = async e => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    onError('')
    const fd = new FormData()
    fd.append('photo', file)
    try {
      const res = await api.post('/upload/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onChange(res.data.url)
    } catch {
      onError('Image upload failed. Max 5 MB.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
      {url
        ? <img src={url} alt="preview" style={{ width:72, height:56, borderRadius:8, objectFit:'cover', border:'1.5px solid var(--g100)', flexShrink:0 }} />
        : <div style={{ width:72, height:56, borderRadius:8, background:'var(--off)', border:'1.5px dashed var(--g200)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'var(--g400)', textAlign:'center', lineHeight:1.3, flexShrink:0 }}>No<br/>image</div>
      }
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display:'none' }} />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          style={{ width:'fit-content', fontSize:12.5, fontWeight:700, padding:'7px 14px', border:'1px solid var(--g200)', borderRadius:7, cursor: uploading ? 'not-allowed' : 'pointer', background:'var(--off)', color:'var(--ink)' }}>
          {uploading ? 'Uploading…' : url ? 'Change Image' : 'Upload Image'}
        </button>
        {url && (
          <button type="button" onClick={() => onChange('')}
            style={{ width:'fit-content', fontSize:11.5, color:'var(--g400)', background:'none', border:'none', cursor:'pointer', padding:0, textAlign:'left' }}>
            Remove
          </button>
        )}
        <span style={{ fontSize:11, color:'var(--g400)' }}>JPG / PNG · max 5 MB</span>
      </div>
    </div>
  )
}

export default function AdminUniversities() {
  const [unis, setUnis] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [delTarget, setDelTarget] = useState(null)
  const [search, setSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState('all')
  const [imgError, setImgError] = useState('')

  useEffect(() => { setUnis(getUniversities()) }, [])

  const save = n => { setUnis(n); saveUniversities(n) }
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const openAdd = () => { setForm(BLANK); setImgError(''); setModal('add') }
  const openEdit = u => { setForm({ ...u, fields: Array.isArray(u.fields) ? u.fields.join(', ') : (u.fields || ''), position: u.position ?? '' }); setImgError(''); setModal(u) }

  const submit = () => {
    if (!form.name.trim() || !form.city.trim()) return
    const payload = { ...form, fields: form.fields ? form.fields.split(',').map(s => s.trim()).filter(Boolean) : [] }
    if (modal === 'add') save([...unis, { ...payload, id: Date.now() }])
    else save(unis.map(u => u.id === modal.id ? { ...u, ...payload } : u))
    setModal(null)
  }

  const del = id => { save(unis.filter(u => u.id !== id)); setDelTarget(null) }

  const filtered = unis.filter(u => {
    const q = search.toLowerCase()
    const matchQ = !q || u.name?.toLowerCase().includes(q) || u.city?.toLowerCase().includes(q) || u.state?.toLowerCase().includes(q)
    const matchR = regionFilter === 'all' || u.region === regionFilter
    return matchQ && matchR
  })

  return (
    <div style={{ background:'var(--off)', minHeight:'100vh' }}>
      <div style={{ background:'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding:'36px 0 32px', color:'#fff' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>AUSI · Admin</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Universities</h1>
          <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>Manage the university directory — changes appear on the public & dashboard pages</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop:32, paddingBottom:64 }}>

        <div style={{ background:'rgba(37,99,235,.05)', border:'1px solid rgba(37,99,235,.15)', borderRadius:10, padding:'12px 18px', marginBottom:24, fontSize:13, color:'#1d4ed8' }}>
          Universities added here appear on the public <strong>/universities</strong> page and the member dashboard universities page.
        </div>

        {/* Controls */}
        <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, city, state…"
            style={{ ...inp, flex:'1 1 200px', maxWidth:320 }} />
          <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)}
            style={{ ...inp, width:160, padding:'10px 10px', cursor:'pointer' }}>
            <option value="all">All Regions</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <span style={{ fontSize:12.5, color:'var(--g500)' }}>{filtered.length} of {unis.length}</span>
          <button onClick={openAdd} style={{ padding:'10px 22px', background:'var(--ink)', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:13.5, cursor:'pointer', marginLeft:'auto' }}>
            + Add University
          </button>
        </div>

        {unis.length === 0 ? (
          <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'56px', textAlign:'center', color:'var(--g400)' }}>
            <div style={{ fontFamily:'var(--serif)', fontSize:18, fontWeight:700, color:'var(--ink)', marginBottom:8 }}>No Universities Yet</div>
            <div style={{ fontSize:14, marginBottom:24 }}>Add universities to build the AUSI directory. They'll appear on the public universities page and member dashboard.</div>
            <button onClick={openAdd} style={{ padding:'10px 24px', background:'var(--ink)', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:14, cursor:'pointer' }}>+ Add First University</button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
            {filtered.map(u => {
              const rc = regionColor[u.region] || '#333'
              return (
                <div key={u.id} style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, overflow:'hidden' }}>
                  {u.imageUrl && (
                    <div style={{ height:140, overflow:'hidden', background:'#111' }}>
                      <img src={u.imageUrl} alt={u.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                    </div>
                  )}
                  <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--g100)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:4 }}>
                      <div style={{ fontFamily:'var(--serif)', fontSize:15, fontWeight:700, color:'var(--ink)', lineHeight:1.3 }}>{u.name}</div>
                      <span style={{ fontSize:10.5, fontWeight:700, padding:'2px 9px', borderRadius:4, background:`${rc}18`, color:rc, whiteSpace:'nowrap', flexShrink:0 }}>{u.region}</span>
                    </div>
                    <div style={{ fontSize:12.5, color:'var(--g500)' }}>{u.city}, {u.state}</div>
                    {u.website && <div style={{ fontSize:12, color:'var(--g400)', marginTop:2 }}>{u.website}</div>}
                  </div>
                  {u.description && (
                    <div style={{ padding:'10px 16px', fontSize:12.5, color:'var(--g600)', lineHeight:1.6, borderBottom:'1px solid var(--g100)', display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                      {u.description}
                    </div>
                  )}
                  {u.fields?.length > 0 && (
                    <div style={{ padding:'8px 16px', display:'flex', gap:5, flexWrap:'wrap', borderBottom:'1px solid var(--g100)' }}>
                      {u.fields.slice(0, 4).map(f => (
                        <span key={f} style={{ fontSize:11, padding:'2px 8px', background:'var(--off)', borderRadius:4, color:'var(--g600)' }}>{f}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ padding:'10px 12px', display:'flex', gap:8 }}>
                    <button onClick={() => openEdit(u)} style={{ flex:1, fontSize:12, fontWeight:700, padding:'6px 0', border:'1px solid var(--g200)', borderRadius:7, cursor:'pointer', background:'var(--off)', color:'var(--ink)' }}>Edit</button>
                    <button onClick={() => setDelTarget(u)} style={{ flex:1, fontSize:12, fontWeight:700, padding:'6px 0', border:'1px solid rgba(220,38,38,.3)', borderRadius:7, cursor:'pointer', background:'rgba(220,38,38,.06)', color:'#dc2626' }}>Delete</button>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div style={{ gridColumn:'1/-1', background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'40px', textAlign:'center', color:'var(--g400)', fontSize:14 }}>
                No universities match your search.
              </div>
            )}
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add University' : `Edit · ${modal.name}`} onClose={() => setModal(null)}>
          <div style={{ display:'grid', gap:14 }}>
            <div><label style={lbl}>University Name *</label><input value={form.name} onChange={set('name')} style={inp} placeholder="e.g. RK University" /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div><label style={lbl}>City *</label><input value={form.city} onChange={set('city')} style={inp} placeholder="Rajkot" /></div>
              <div><label style={lbl}>State</label><input value={form.state} onChange={set('state')} style={inp} placeholder="Gujarat" /></div>
            </div>
            <div><label style={lbl}>Region</label>
              <select value={form.region} onChange={set('region')} style={{ ...inp, cursor:'pointer' }}>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Fields of Study (comma-separated)</label><input value={form.fields} onChange={set('fields')} style={inp} placeholder="Medicine, Engineering, Business, Law" /></div>
            <div><label style={lbl}>Website</label><input value={form.website} onChange={set('website')} style={inp} placeholder="https://…" /></div>
            <div><label style={lbl}>University Image (shown on the public page)</label>
              <ImageUploader url={form.imageUrl} onChange={url => setForm(f => ({ ...f, imageUrl: url }))} onError={setImgError} />
              {imgError && <div style={{ color:'#dc2626', fontSize:12, marginTop:6 }}>{imgError}</div>}
            </div>
            <div>
              <label style={lbl}>Carousel Position (optional)</label>
              <input type="number" min="1" step="1" value={form.position} onChange={set('position')} style={inp} placeholder="1 = first · leave blank = last" />
              <div style={{ fontSize:11.5, color:'var(--g400)', marginTop:5 }}>
                Controls where this university's image lands among the others in its region's carousel on the public Universities page. Leave blank to add it at the end.
              </div>
            </div>
            <div><label style={lbl}>Description</label>
              <textarea value={form.description} onChange={set('description')} rows={5} style={{ ...inp, resize:'vertical', lineHeight:1.6, fontFamily:'inherit' }} placeholder="Brief description of the university, its strengths, student experience…" />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setModal(null)} style={{ flex:1, padding:'10px', border:'1px solid var(--g200)', borderRadius:8, background:'transparent', cursor:'pointer', fontWeight:700, color:'var(--g600)' }}>Cancel</button>
              <button onClick={submit} style={{ flex:2, padding:'10px', background:'var(--ink)', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:13.5, cursor:'pointer' }}>
                {modal === 'add' ? 'Add University' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {delTarget && (
        <Modal title="Delete University" onClose={() => setDelTarget(null)}>
          <p style={{ fontSize:14, color:'var(--g600)', marginBottom:22 }}>Delete <strong>{delTarget.name}</strong>? It will be removed from all pages.</p>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setDelTarget(null)} style={{ flex:1, padding:'10px', border:'1px solid var(--g200)', borderRadius:8, background:'transparent', cursor:'pointer', fontWeight:700, color:'var(--g600)' }}>Cancel</button>
            <button onClick={() => del(delTarget.id)} style={{ flex:1, padding:'10px', border:'none', borderRadius:8, background:'#dc2626', cursor:'pointer', fontWeight:700, color:'#fff' }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
