import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'

/* ── Constants ───────────────────────────────────────────────── */
const CATEGORIES = ['Textbooks', 'Electronics', 'Furniture & Housing', 'Clothing', 'Kitchen & Food', 'Transport', 'Services', 'Rentals']

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
]

const SAFETY_TIPS = [
  'Meet in a public place on campus for transactions.',
  'Inspect the item before paying.',
  'Use UPI/bank transfer — avoid cash for large amounts.',
  'Report suspicious listings to the AUSI secretariat.',
]

/* ── localStorage helpers ────────────────────────────────────── */
function loadListings() {
  try { return JSON.parse(localStorage.getItem('ausi_marketplace') || '[]') } catch { return [] }
}
function saveListings(list) {
  try { localStorage.setItem('ausi_marketplace', JSON.stringify(list)) } catch {}
}

/* ── Image compression ───────────────────────────────────────── */
function compressImage(file, maxW = 900, quality = 0.72) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width)
        const canvas = document.createElement('canvas')
        canvas.width  = Math.round(img.width  * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

/* ── Listing card ────────────────────────────────────────────── */
function ListingCard({ item }) {
  return (
    <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, overflow:'hidden', display:'flex', flexDirection:'column' }}>
      {/* Image */}
      <div style={{ width:'100%', height:180, background:'var(--off)', position:'relative', overflow:'hidden', flexShrink:0 }}>
        {item.image ? (
          <img src={item.image} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
        ) : (
          <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'var(--g300)', fontWeight:600 }}>No image</div>
        )}
        <div style={{ position:'absolute', top:10, left:10, background:'rgba(17,17,24,.72)', color:'#fff', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, backdropFilter:'blur(4px)' }}>
          {item.category}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:'14px 16px', flex:1, display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:6 }}>
          <div style={{ fontWeight:700, fontSize:14.5, color:'var(--ink)', lineHeight:1.3, flex:1 }}>{item.title}</div>
          <div style={{ fontFamily:'var(--serif)', fontSize:15, fontWeight:800, color:'var(--ink)', flexShrink:0 }}>
            {item.price ? `₹${item.price}` : 'Free'}
          </div>
        </div>

        {item.description && (
          <div style={{ fontSize:12.5, color:'var(--g500)', lineHeight:1.55, marginBottom:10, flexGrow:1 }}>
            {item.description.length > 100 ? item.description.slice(0, 100) + '…' : item.description}
          </div>
        )}

        {/* Seller info */}
        <div style={{ borderTop:'1px solid var(--g100)', paddingTop:10, marginTop:'auto' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'var(--ink)', marginBottom:2 }}>{item.seller_name}</div>
          <div style={{ fontSize:11.5, color:'var(--g500)', marginBottom:8 }}>
            {item.university}{item.state ? ` · ${item.state}` : ''}
          </div>
          {item.contact && (
            <a
              href={`https://wa.me/${item.contact.replace(/\D/g,'')}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, color:'#059669', textDecoration:'none', background:'rgba(5,150,105,.08)', border:'1px solid rgba(5,150,105,.25)', padding:'5px 12px', borderRadius:8 }}>
              Contact Seller
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Buy view ────────────────────────────────────────────────── */
function BuyView({ listings }) {
  const [cat, setCat]       = useState('All')
  const [search, setSearch] = useState('')

  const shown = listings.filter(item => {
    const matchCat    = cat === 'All' || item.category === cat
    const q           = search.toLowerCase()
    const matchSearch = !q || item.title.toLowerCase().includes(q) ||
                        item.seller_name.toLowerCase().includes(q) ||
                        item.university.toLowerCase().includes(q) ||
                        item.category.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom:20 }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search items, sellers, categories…"
          style={{ width:'100%', maxWidth:420, boxSizing:'border-box', padding:'10px 14px', fontSize:13.5, border:'1.5px solid var(--g200)', borderRadius:9, outline:'none', background:'var(--white)', color:'var(--ink)' }}
        />
      </div>

      {/* Category tabs */}
      <div className="hscroll" style={{ display:'flex', gap:24, marginBottom:24, borderBottom:'1px solid var(--g100)', paddingBottom:14, overflowX:'auto', flexWrap:'nowrap' }}>
        {['All', ...CATEGORIES].map(c => {
          const count  = c === 'All' ? listings.length : listings.filter(l => l.category === c).length
          const active = cat === c
          return (
            <button key={c} onClick={() => setCat(c)}
              style={{ background:'none', border:'none', borderBottom:`2px solid ${active ? 'var(--ink)' : 'transparent'}`, cursor:'pointer', padding:'0 0 4px', fontSize:14, fontWeight: active ? 800 : 500, color: active ? 'var(--ink)' : 'var(--g400)', transition:'color .15s, border-color .15s', whiteSpace:'nowrap' }}>
              {c} ({count})
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {shown.length === 0 ? (
        <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'56px 24px', textAlign:'center' }}>
          <div style={{ fontFamily:'var(--serif)', fontSize:16, fontWeight:700, color:'var(--ink)', marginBottom:6 }}>
            {listings.length === 0 ? 'No listings yet' : 'Nothing matches your search'}
          </div>
          <div style={{ fontSize:13, color:'var(--g500)' }}>
            {listings.length === 0 ? 'Be the first to list something for sale.' : 'Try a different category or search term.'}
          </div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:16 }}>
          {shown.map(item => <ListingCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  )
}

/* ── Sell view ───────────────────────────────────────────────── */
function SellView({ onListingAdded, user }) {
  const blank = {
    title:'', price:'', category:'Textbooks', description:'',
    seller_name: user?.full_name || '',
    university:  user?.university_name || '',
    state:'', contact: user?.phone || '',
    image: null,
  }
  const [form, setForm]       = useState(blank)
  const [errors, setErrors]   = useState({})
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    setForm(f => ({
      ...f,
      seller_name: f.seller_name || user?.full_name || '',
      university:  f.university  || user?.university_name || '',
      contact:     f.contact     || user?.phone || '',
    }))
  }, [user])

  const set = k => e => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(er => ({ ...er, [k]: '' })) }

  const handleImage = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setErrors(er => ({ ...er, image: 'File too large (max 10 MB)' })); return }
    setLoading(true)
    try {
      const compressed = await compressImage(file)
      setForm(f => ({ ...f, image: compressed }))
      setPreview(compressed)
      setErrors(er => ({ ...er, image: '' }))
    } catch { setErrors(er => ({ ...er, image: 'Could not process image' })) }
    setLoading(false)
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim())            e.title       = 'Required'
    if (!form.price.toString().trim()) e.price       = 'Required'
    if (!form.seller_name.trim())      e.seller_name = 'Required'
    if (!form.university.trim())       e.university  = 'Required'
    if (!form.state)                   e.state       = 'Required'
    if (!form.contact.trim())          e.contact     = 'Required'
    if (!form.image)                   e.image       = 'Please upload an image of the item'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!validate()) return
    const listing = { ...form, id: Date.now().toString(), created_at: new Date().toISOString() }
    saveListings([listing, ...loadListings()])
    onListingAdded()
    setDone(true)
  }

  const reset = () => { setForm(blank); setPreview(null); setDone(false); setErrors({}) }

  const lbl = { display:'block', fontSize:11.5, fontWeight:700, color:'var(--g600)', marginBottom:5, letterSpacing:.2 }
  const inp = (hasErr) => ({
    width:'100%', boxSizing:'border-box', padding:'9px 12px', fontSize:13.5,
    color:'var(--ink)', border:`1.5px solid ${hasErr ? '#dc2626' : 'var(--g200)'}`,
    borderRadius:8, outline:'none', background:'var(--white)',
  })
  const errMsg = k => errors[k] && <span style={{ fontSize:11.5, color:'#dc2626', marginTop:3, display:'block' }}>{errors[k]}</span>

  if (done) return (
    <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'56px 32px', textAlign:'center' }}>
      <div style={{ fontFamily:'var(--serif)', fontSize:20, fontWeight:700, color:'var(--ink)', marginBottom:8 }}>Listing Published</div>
      <div style={{ fontSize:13.5, color:'var(--g500)', marginBottom:28 }}>Your item is now visible to other AUSI students.</div>
      <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
        <button onClick={reset} style={{ padding:'10px 24px', background:'var(--ink)', color:'#fff', border:'none', borderRadius:9, fontWeight:700, fontSize:13.5, cursor:'pointer' }}>
          List Another Item
        </button>
        <button onClick={reset} style={{ padding:'10px 24px', background:'var(--off)', color:'var(--ink)', border:'1px solid var(--g200)', borderRadius:9, fontWeight:700, fontSize:13.5, cursor:'pointer' }}>
          Done
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'28px 32px', maxWidth:620 }}>
      <div style={{ fontFamily:'var(--serif)', fontSize:18, fontWeight:700, color:'var(--ink)', marginBottom:4 }}>Create a Listing</div>
      <p style={{ fontSize:13, color:'var(--g500)', marginBottom:28, marginTop:0 }}>
        Fill in the details below. Other AUSI students will see your listing and contact you directly.
      </p>

      <form onSubmit={handleSubmit} noValidate>

        <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--g400)', marginBottom:16 }}>Item Details</div>

        <div style={{ marginBottom:16 }}>
          <label style={lbl}>Item Title <span style={{ color:'#dc2626' }}>*</span></label>
          <input style={inp(errors.title)} placeholder="e.g. 2nd year MBBS anatomy textbook" value={form.title} onChange={set('title')} />
          {errMsg('title')}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }} className="mp-grid">
          <div>
            <label style={lbl}>Price (₹) <span style={{ color:'#dc2626' }}>*</span></label>
            <input type="number" min="0" style={inp(errors.price)} placeholder="0 = Free" value={form.price} onChange={set('price')} />
            {errMsg('price')}
          </div>
          <div>
            <label style={lbl}>Category <span style={{ color:'#dc2626' }}>*</span></label>
            <select style={{ ...inp(false), cursor:'pointer', appearance:'none' }} value={form.category} onChange={set('category')}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom:24 }}>
          <label style={lbl}>Description <span style={{ fontSize:10, fontWeight:500, color:'var(--g400)' }}>(optional)</span></label>
          <textarea
            style={{ ...inp(false), resize:'vertical', minHeight:80, fontFamily:'inherit' }}
            placeholder="Condition, details, reason for selling…"
            value={form.description} onChange={set('description')}
          />
        </div>

        <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--g400)', marginBottom:16 }}>
          Item Image <span style={{ color:'#dc2626' }}>*</span>
        </div>

        <div style={{ marginBottom:24 }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{ border:`2px dashed ${errors.image ? '#dc2626' : 'var(--g200)'}`, borderRadius:10, padding:'24px', textAlign:'center', cursor:'pointer', background:'var(--off)', transition:'border-color .15s', overflow:'hidden' }}>
            {preview ? (
              <div>
                <img src={preview} alt="Preview" style={{ maxWidth:'100%', maxHeight:220, objectFit:'contain', borderRadius:8, display:'block', margin:'0 auto' }} />
                <div style={{ fontSize:12, color:'var(--g500)', marginTop:10 }}>Click to change image</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize:13.5, fontWeight:600, color:'var(--ink)', marginBottom:4 }}>{loading ? 'Processing…' : 'Click to upload image'}</div>
                <div style={{ fontSize:12, color:'var(--g500)' }}>JPG, PNG, WEBP · Max 10 MB</div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleImage} />
          {errMsg('image')}
        </div>

        <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--g400)', marginBottom:16 }}>Your Information</div>

        <div style={{ marginBottom:16 }}>
          <label style={lbl}>Your Name <span style={{ color:'#dc2626' }}>*</span></label>
          <input style={inp(errors.seller_name)} placeholder="Full name" value={form.seller_name} onChange={set('seller_name')} />
          {errMsg('seller_name')}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }} className="mp-grid">
          <div>
            <label style={lbl}>University <span style={{ color:'#dc2626' }}>*</span></label>
            <input style={inp(errors.university)} placeholder="Your university" value={form.university} onChange={set('university')} />
            {errMsg('university')}
          </div>
          <div>
            <label style={lbl}>State <span style={{ color:'#dc2626' }}>*</span></label>
            <select style={{ ...inp(errors.state), cursor:'pointer', appearance:'none' }} value={form.state} onChange={set('state')}>
              <option value="">Select state…</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errMsg('state')}
          </div>
        </div>

        <div style={{ marginBottom:28 }}>
          <label style={lbl}>Contact (WhatsApp / Phone) <span style={{ color:'#dc2626' }}>*</span></label>
          <input type="tel" style={inp(errors.contact)} placeholder="+256 7XX XXX XXX or +91 98XX XXX XXX" value={form.contact} onChange={set('contact')} />
          {errMsg('contact')}
        </div>

        <button
          type="submit" disabled={loading}
          style={{ width:'100%', padding:'13px 0', background:'var(--ink)', color:'#fff', fontSize:14.5, fontWeight:700, border:'none', borderRadius:10, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1 }}>
          {loading ? 'Processing image…' : 'Publish Listing'}
        </button>

      </form>
    </div>
  )
}

/* ── Main ────────────────────────────────────────────────────── */
export default function Marketplace() {
  const { user } = useAuth()
  const [view, setView]         = useState('buy')
  const [listings, setListings] = useState([])

  useEffect(() => { setListings(loadListings()) }, [])

  const refresh = () => setListings(loadListings())

  const btnStyle = (active) => ({
    flex: 1, padding: '11px 0', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 9,
    cursor: 'pointer', transition: 'all .15s',
    background: active ? 'var(--ink)' : 'transparent',
    color:      active ? '#fff'       : 'var(--g500)',
  })

  return (
    <div style={{ background:'var(--off)', minHeight:'100vh' }}>

      <div style={{ background:'linear-gradient(160deg,#111118 0%,#1a1200 100%)', padding:'36px 0 32px', color:'#fff' }}>
        <div className="container">
          <img src="/logo.png" alt="AUSI" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2.2, textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:8 }}>AUSI · 2026 / 27</div>
          <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(22px,3vw,30px)', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Marketplace</h1>
          <p style={{ fontSize:13.5, color:'rgba(255,255,255,.4)', margin:0 }}>Buy, sell, and trade with fellow Ugandan students across India</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop:32, paddingBottom:64 }}>

        {/* Toggle */}
        <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:12, padding:4, display:'flex', gap:4, marginBottom:32, maxWidth:260 }}>
          <button style={btnStyle(view === 'buy')}  onClick={() => setView('buy')}>Buy</button>
          <button style={btnStyle(view === 'sell')} onClick={() => setView('sell')}>Sell</button>
        </div>

        {view === 'buy'
          ? <BuyView listings={listings} />
          : <SellView onListingAdded={refresh} user={user} />
        }

        {/* Safety tips */}
        <div style={{ background:'var(--white)', border:'1px solid var(--g100)', borderRadius:14, padding:'22px 26px', marginTop:40 }}>
          <div style={{ fontFamily:'var(--serif)', fontSize:15, fontWeight:700, color:'var(--ink)', marginBottom:14 }}>Safety Tips</div>
          <ul style={{ margin:0, padding:0, listStyle:'none' }}>
            {SAFETY_TIPS.map((tip, i) => (
              <li key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom: i < SAFETY_TIPS.length - 1 ? 10 : 0 }}>
                <span style={{ width:20, height:20, background:'rgba(5,150,105,.1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#059669', fontWeight:800, flexShrink:0, marginTop:2 }}>+</span>
                <span style={{ fontSize:13, color:'var(--g700)', lineHeight:1.55 }}>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      <style>{`
        @media (max-width: 560px) {
          .mp-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
