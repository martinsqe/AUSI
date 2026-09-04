import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { ROLE_LABELS, ROLE_COLORS } from '../../../lib/roles'
import api from '../../../lib/api'

const ROLES = ['student','alumni','university_rep','exec','chapter_president','patron','admin']

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const esc = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:1000 }} />
      <div data-lenis-prevent style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:1001, background:'var(--white)', borderRadius:18, width:'min(94vw,560px)', maxHeight:'88vh', overflow:'auto', overscrollBehavior:'contain', boxShadow:'0 32px 100px rgba(0,0,0,.25)' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--g100)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'var(--white)', zIndex:1 }}>
          <h3 style={{ fontFamily:'var(--serif)', fontSize:18, fontWeight:700, color:'var(--ink)', margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, color:'var(--g400)', lineHeight:1, padding:'0 4px' }}>×</button>
        </div>
        <div style={{ padding:'24px' }}>{children}</div>
      </div>
    </>
  )
}

function Badge({ label, bg, text, border }) {
  return <span style={{ fontSize:11, fontWeight:700, letterSpacing:.8, textTransform:'uppercase', padding:'2px 9px', borderRadius:4, background:bg, color:text }}>{label}</span>
}

export default function AdminStudents() {
  const { user: me } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [verifiedFilter, setVerifiedFilter] = useState('all')
  const [busy, setBusy] = useState({})
  const [editTarget, setEditTarget] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [error, setError] = useState('')

  const load = () => {
    api.get('/dashboard/admin').then(r => { setMembers(r.data?.members || []); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(load, [])

  const setRole = async (id, role) => {
    setBusy(b => ({ ...b, [id]: true }))
    try { await api.patch(`/members/${id}/role`, { role }); load() }
    catch { setError('Failed to update role.') }
    setBusy(b => ({ ...b, [id]: false }))
  }

  const toggleVerify = async (id) => {
    setBusy(b => ({ ...b, [id]: true }))
    try { await api.patch(`/members/${id}/verify`); load() }
    catch { setError('Failed to update member.') }
    setBusy(b => ({ ...b, [id]: false }))
  }

  const deleteMember = async (id) => {
    setBusy(b => ({ ...b, [id]: true }))
    try {
      await api.delete(`/members/${id}`)
      setMembers(m => m.filter(x => x.id !== id))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete member. Please try again.')
    }
    setBusy(b => ({ ...b, [id]: false }))
    setConfirmDelete(null)
  }

  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    const matchQ = !q || m.full_name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || m.university_name?.toLowerCase().includes(q)
    const matchR = roleFilter === 'all' || m.role === roleFilter
    const matchV = verifiedFilter === 'all' || (verifiedFilter === 'verified' ? m.is_verified : !m.is_verified)
    return matchQ && matchR && matchV
  })

  const inp = { width:'100%', padding:'9px 13px', border:'1.5px solid var(--g200)', borderRadius:8, fontSize:13.5, outline:'none', boxSizing:'border-box', background:'var(--white)' }
  const sel = { ...inp, padding:'9px 10px', cursor:'pointer' }

  return (
    <div style={{ background:'var(--off)', minHeight:'100vh' }}>
      <div style={{ background:'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding:'36px 0 32px', color:'#fff' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>AUSI · Admin</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Students</h1>
          <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>Manage member accounts, roles, and verification status</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop:32, paddingBottom:64 }}>

        {error && (
          <div style={{ background:'rgba(220,38,38,.08)', border:'1px solid rgba(220,38,38,.2)', borderRadius:10, padding:'12px 16px', fontSize:13, color:'var(--red)', marginBottom:20 }}>
            {error} <button onClick={() => setError('')} style={{ background:'none', border:'none', cursor:'pointer', marginLeft:8, color:'var(--red)', fontWeight:700 }}>×</button>
          </div>
        )}

        {/* Filters */}
        <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'18px 20px', marginBottom:20, display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, university…" style={{ ...inp, maxWidth:300, flex:'1 1 200px' }} />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ ...sel, width:160 }}>
            <option value="all">All roles</option>
            {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>)}
          </select>
          <select value={verifiedFilter} onChange={e => setVerifiedFilter(e.target.value)} style={{ ...sel, width:150 }}>
            <option value="all">All statuses</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>
          <span style={{ fontSize:12.5, color:'var(--g500)', marginLeft:'auto' }}>{filtered.length} of {members.length} members</span>
        </div>

        {/* Table */}
        <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, overflow:'hidden' }}>
          <div className="tscroll" style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:'2px solid var(--g100)', background:'var(--off)' }}>
                  {['Name','Email','University','Role','Status','Joined','Actions'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'11px 14px', fontSize:10.5, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:'var(--g400)', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding:'40px', textAlign:'center', color:'var(--g400)', fontSize:13 }}>Loading members…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding:'40px', textAlign:'center', color:'var(--g400)', fontSize:13 }}>No members found.</td></tr>
                ) : filtered.map(m => (
                  <tr key={m.id} style={{ borderBottom:'1px solid var(--g100)' }}>
                    <td style={{ padding:'12px 14px', fontWeight:700, color:'var(--ink)', whiteSpace:'nowrap' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:30, height:30, borderRadius:'50%', background: ROLE_COLORS[m.role] || '#333', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff', flexShrink:0 }}>
                          {m.full_name?.charAt(0)}
                        </div>
                        {m.full_name}
                      </div>
                    </td>
                    <td style={{ padding:'12px 14px', color:'var(--g600)', fontSize:12.5 }}>{m.email}</td>
                    <td style={{ padding:'12px 14px', color:'var(--g600)', whiteSpace:'nowrap', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis' }}>{m.university_name || '—'}</td>
                    <td style={{ padding:'12px 14px' }}>
                      <select value={m.role} disabled={busy[m.id]} onChange={e => setRole(m.id, e.target.value)}
                        style={{ fontSize:12, padding:'4px 8px', border:'1px solid var(--g200)', borderRadius:6, background:'var(--white)', cursor:'pointer', color: ROLE_COLORS[m.role] || 'var(--ink)', fontWeight:700 }}>
                        {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:'12px 14px' }}>
                      <Badge
                        label={m.is_verified ? 'Verified' : 'Pending'}
                        bg={m.is_verified ? 'rgba(34,197,94,.1)' : 'rgba(234,179,8,.1)'}
                        text={m.is_verified ? '#15803d' : '#92400e'}
                        border={m.is_verified ? 'rgba(34,197,94,.3)' : 'rgba(234,179,8,.3)'}
                      />
                    </td>
                    <td style={{ padding:'12px 14px', color:'var(--g500)', whiteSpace:'nowrap', fontSize:12 }}>
                      {m.joined_at ? new Date(m.joined_at).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td style={{ padding:'12px 14px' }}>
                      <div style={{ display:'flex', gap:6, flexWrap:'nowrap' }}>
                        <button onClick={() => toggleVerify(m.id)} disabled={busy[m.id]}
                          style={{ fontSize:11.5, fontWeight:700, padding:'5px 10px', border:'1px solid var(--g200)', borderRadius:7, cursor:'pointer', background:'var(--off)', color:'var(--ink)', whiteSpace:'nowrap' }}>
                          {m.is_verified ? 'Unverify' : 'Verify'}
                        </button>
                        <button onClick={() => setEditTarget(m)}
                          style={{ fontSize:11.5, fontWeight:700, padding:'5px 10px', border:'1px solid var(--g200)', borderRadius:7, cursor:'pointer', background:'var(--off)', color:'var(--ink)' }}>
                          Edit
                        </button>
                        {m.id !== me?.id && (
                          <button onClick={() => setConfirmDelete(m)}
                            style={{ fontSize:11.5, fontWeight:700, padding:'5px 10px', border:'1px solid rgba(220,38,38,.3)', borderRadius:7, cursor:'pointer', background:'rgba(220,38,38,.06)', color:'#dc2626' }}>
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Edit modal */}
      {editTarget && (
        <Modal title={`Edit · ${editTarget.full_name}`} onClose={() => setEditTarget(null)}>
          <EditMemberForm member={editTarget} onSave={() => { setEditTarget(null); load() }} />
        </Modal>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <Modal title="Confirm Deletion" onClose={() => setConfirmDelete(null)}>
          <p style={{ fontSize:14, color:'var(--g600)', lineHeight:1.6, marginBottom:24 }}>
            Are you sure you want to delete <strong>{confirmDelete.full_name}</strong>? This action cannot be undone.
          </p>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setConfirmDelete(null)} style={{ flex:1, padding:'10px', border:'1px solid var(--g200)', borderRadius:8, background:'transparent', cursor:'pointer', fontWeight:700, fontSize:13.5, color:'var(--g600)' }}>Cancel</button>
            <button onClick={() => deleteMember(confirmDelete.id)} disabled={busy[confirmDelete.id]}
              style={{ flex:1, padding:'10px', border:'none', borderRadius:8, background:'#dc2626', cursor:'pointer', fontWeight:700, fontSize:13.5, color:'#fff', opacity: busy[confirmDelete.id] ? .6 : 1 }}>
              {busy[confirmDelete.id] ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function EditMemberForm({ member: m, onSave }) {
  const [form, setForm] = useState({
    full_name: m.full_name || '', phone: m.phone || '',
    field_of_study: m.field_of_study || '',
    university_id: m.university_id || '', university_name: m.university_name || '',
  })
  const [universities, setUniversities] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const inp = { width:'100%', padding:'10px 14px', border:'1.5px solid var(--g200)', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box', background:'var(--white)' }

  useEffect(() => {
    api.get('/universities').then(r => setUniversities(
      (r.data?.data || []).sort((a, b) => a.name.localeCompare(b.name))
    )).catch(() => {})
  }, [])

  const handleUniChange = (e) => {
    const val = e.target.value
    if (val) {
      const uni = universities.find(u => u.id === val)
      const label = uni ? (uni.city ? `${uni.name}, ${uni.city}` : uni.name) : ''
      setForm(f => ({ ...f, university_id: val, university_name: label }))
    } else {
      setForm(f => ({ ...f, university_id: '', university_name: '' }))
    }
  }

  const save = async () => {
    setBusy(true)
    try {
      await api.patch(`/members/${m.id}/profile`, form)
      onSave()
    } catch { setError('Failed to save changes.') }
    setBusy(false)
  }

  return (
    <div>
      {[{ k:'full_name', l:'Full Name' }, { k:'phone', l:'Phone' }, { k:'field_of_study', l:'Course / Programme' }].map(f => (
        <div key={f.k} style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'var(--g500)', marginBottom:6, letterSpacing:.5, textTransform:'uppercase' }}>{f.l}</label>
          <input value={form[f.k]} onChange={set(f.k)} style={inp} />
        </div>
      ))}
      <div style={{ marginBottom:16 }}>
        <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'var(--g500)', marginBottom:6, letterSpacing:.5, textTransform:'uppercase' }}>University</label>
        <select
          value={form.university_id}
          onChange={handleUniChange}
          style={{ ...inp, cursor:'pointer', appearance:'auto' }}
        >
          <option value="">— Not set —</option>
          {universities.map(u => (
            <option key={u.id} value={u.id}>
              {u.city ? `${u.name}, ${u.city}` : u.name}
            </option>
          ))}
        </select>
        {!form.university_id && m.university_name && (
          <span style={{ fontSize:12, color:'var(--g400)', marginTop:4, display:'block' }}>
            Previously: {m.university_name}
          </span>
        )}
      </div>
      {error && <div style={{ fontSize:12.5, color:'var(--red)', marginBottom:14 }}>{error}</div>}
      <button onClick={save} disabled={busy} style={{ width:'100%', padding:'11px', background:'var(--ink)', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:14, cursor:'pointer', opacity: busy ? .65 : 1 }}>
        {busy ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  )
}
