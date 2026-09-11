import { useState, useEffect, useRef } from 'react'
import api from '../../../lib/api'

const inp = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--g200)', fontSize: 13.5, background: 'var(--white)', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' }
const EMPTY = { student_name: '', university: '', photo_url: '', description: '', project_link: '', images: [] }

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--g500)', letterSpacing: 0.3 }}>{label}</label>
      {children}
    </div>
  )
}

/* ── Project image upload slots ───────────────────────────── */
function ImageSlots({ images, onChange, onError }) {
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
      const res = await api.post('/upload/photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onChange([...images, res.data.url])
    } catch {
      onError('Image upload failed. Max 5 MB per image.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const remove = idx => onChange(images.filter((_, i) => i !== idx))

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>

        {/* Existing image thumbnails */}
        {images.map((url, i) => (
          <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
            <img src={url} alt={`project ${i + 1}`}
              style={{ width: 110, height: 78, objectFit: 'cover', borderRadius: 10, display: 'block', border: '1.5px solid var(--g100)' }} />
            <button
              type="button"
              onClick={() => remove(i)}
              title="Remove image"
              style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: '50%', background: 'rgba(220,38,38,.9)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              ×
            </button>
            <div style={{ fontSize: 10, color: 'var(--g400)', textAlign: 'center', marginTop: 4 }}>Image {i + 1}</div>
          </div>
        ))}

        {/* Add slot — no limit on how many images */}
        <div style={{ flexShrink: 0 }}>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              width: 110, height: 78, borderRadius: 10, border: '2px dashed var(--g200)',
              background: uploading ? 'var(--g100)' : 'var(--off)',
              color: 'var(--g400)', cursor: uploading ? 'not-allowed' : 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 4, fontSize: 12, fontWeight: 600, transition: 'all .15s',
            }}
            onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = 'var(--gold)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--g200)' }}>
            {uploading
              ? <><span style={{ fontSize: 18 }}>⏳</span><span>Uploading…</span></>
              : <><span style={{ fontSize: 22, lineHeight: 1 }}>+</span><span>Add Image</span></>
            }
          </button>
          <div style={{ fontSize: 10, color: 'var(--g400)', textAlign: 'center', marginTop: 4 }}>
            {images.length} added
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'var(--g400)', marginTop: 8 }}>
        Add as many images as you like · JPG / PNG · max 5 MB each · shown as a carousel on the public page
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
export default function AdminInnovations() {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [error, setError]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [photoPreview, setPhotoPreview] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const photoRef = useRef(null)

  const load = () => {
    setLoading(true)
    api.get('/innovations')
      .then(r => setItems(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const openCreate = () => {
    setForm(EMPTY)
    setPhotoPreview('')
    setError('')
    setEditing(null)
    setCreating(true)
  }

  const openEdit = item => {
    setForm({
      student_name: item.student_name || '',
      university:   item.university   || '',
      photo_url:    item.photo_url    || '',
      description:  item.description  || '',
      project_link: item.project_link || '',
      images:       Array.isArray(item.images) ? item.images.filter(Boolean) : [],
    })
    setPhotoPreview('')
    setError('')
    setEditing(item.id)
    setCreating(true)
  }

  /* Upload student profile photo */
  const handlePhotoFile = async e => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoPreview(URL.createObjectURL(file))
    setUploadingPhoto(true)
    setError('')
    const fd = new FormData()
    fd.append('photo', file)
    try {
      const res = await api.post('/upload/photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setForm(f => ({ ...f, photo_url: res.data.url }))
    } catch {
      setError('Photo upload failed. Max 5 MB.')
      setPhotoPreview('')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const save = async () => {
    if (!form.student_name.trim() || !form.university.trim() || !form.description.trim()) {
      setError('Name, university and description are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = { ...form } // images is already an array
      if (editing) {
        await api.put(`/innovations/${editing}`, payload)
      } else {
        await api.post('/innovations', payload)
      }
      setCreating(false)
      setEditing(null)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async id => {
    if (!window.confirm('Delete this innovation?')) return
    try {
      await api.delete(`/innovations/${id}`)
      setItems(prev => prev.filter(i => i.id !== id))
    } catch {}
  }

  const currentPhoto = photoPreview || form.photo_url
  const isUploading  = uploadingPhoto

  return (
    <div className="db-page-inner">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Ideas &amp; Innovations</h1>
          <div style={{ fontSize: 13, color: 'var(--g500)' }}>Showcase student innovations and initiatives on the public page.</div>
        </div>
        {!creating && (
          <button onClick={openCreate} className="btn btn-gold" style={{ flexShrink: 0 }}>+ Add Entry</button>
        )}
      </div>

      {/* ── Form ── */}
      {creating && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--g100)', borderRadius: 14, padding: 28, marginBottom: 32, boxShadow: 'var(--sh-sm)' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>{editing ? 'Edit Entry' : 'New Entry'}</div>

          <div className="db-form-grid">

            <Field label="Student Name *">
              <input value={form.student_name} onChange={set('student_name')} placeholder="Full name" style={inp} />
            </Field>

            <Field label="University *">
              <input value={form.university} onChange={set('university')} placeholder="e.g. KL University" style={inp} />
            </Field>

            {/* Student photo upload */}
            <Field label="Student Photo">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {currentPhoto
                  ? <img src={currentPhoto} alt="preview" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', border: '2px solid var(--g100)', flexShrink: 0 }} />
                  : <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--g100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--g400)', textAlign: 'center', lineHeight: 1.3, flexShrink: 0 }}>No<br/>photo</div>
                }
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoFile} style={{ display: 'none' }} />
                  <button type="button" onClick={() => photoRef.current?.click()} className="btn btn-outline btn-sm" disabled={isUploading} style={{ width: 'fit-content' }}>
                    {isUploading ? 'Uploading…' : currentPhoto ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  <span style={{ fontSize: 11, color: 'var(--g400)' }}>JPG / PNG · max 5 MB</span>
                </div>
              </div>
            </Field>

            {/* Project link */}
            <Field label="Link to Project / Website">
              <input value={form.project_link} onChange={set('project_link')} placeholder="https://… (leave blank to hide the button)" style={inp} />
            </Field>

            {/* Description — full width */}
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Description *">
                <textarea value={form.description} onChange={set('description')} rows={4} placeholder="Describe the idea or innovation…" style={{ ...inp, resize: 'vertical' }} />
              </Field>
            </div>

            {/* Project image uploads — full width */}
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Project Images (carousel)">
                <ImageSlots
                  images={form.images}
                  onChange={imgs => setForm(f => ({ ...f, images: imgs }))}
                  onError={setError}
                />
              </Field>
            </div>

          </div>

          {error && <div style={{ color: '#dc2626', fontSize: 13, marginTop: 14 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <button onClick={save} disabled={saving || isUploading} className="btn btn-gold">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Publish'}
            </button>
            <button onClick={() => { setCreating(false); setEditing(null) }} className="btn btn-outline">Cancel</button>
          </div>
        </div>
      )}

      {/* ── List ── */}
      {loading && <div style={{ color: 'var(--g400)', fontSize: 14, padding: '40px 0' }}>Loading…</div>}

      {!loading && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--g400)' }}>No entries yet. Add the first one above.</div>
      )}

      {!loading && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(item => (
            <div key={item.id} style={{ background: 'var(--white)', border: '1px solid var(--g100)', borderRadius: 12, padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              {item.photo_url
                ? <img src={item.photo_url} alt={item.student_name} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', flexShrink: 0 }} />
                : <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'var(--gold-lt)', flexShrink: 0 }}>{item.student_name.charAt(0)}</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{item.student_name}</div>
                <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, marginBottom: 4 }}>{item.university}</div>
                <div style={{ fontSize: 13, color: 'var(--g600)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</div>
                {/* Image count badge */}
                {Array.isArray(item.images) && item.images.filter(Boolean).length > 0 && (
                  <span style={{ display: 'inline-block', marginTop: 5, fontSize: 11, background: 'var(--g100)', color: 'var(--g600)', borderRadius: 40, padding: '2px 9px', fontWeight: 600 }}>
                    {item.images.filter(Boolean).length} project image{item.images.filter(Boolean).length > 1 ? 's' : ''}
                  </span>
                )}
                {item.project_link && (
                  <a href={item.project_link} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', marginTop: 5, fontSize: 11.5, color: 'var(--gold)', fontWeight: 600 }}>
                    🔗 {item.project_link.replace(/^https?:\/\//, '').slice(0, 52)}
                  </a>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => openEdit(item)} className="btn btn-outline" style={{ fontSize: 12, padding: '6px 14px' }}>Edit</button>
                <button onClick={() => remove(item.id)} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: '1px solid #fca5a5', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
