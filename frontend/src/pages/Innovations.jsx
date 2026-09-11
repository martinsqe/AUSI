import { useState, useEffect } from 'react'
import api from '../lib/api'

/* Ensure links always have an absolute protocol prefix */
function safeHref(url) {
  if (!url) return '#'
  return /^https?:\/\//i.test(url) ? url : 'https://' + url.replace(/^\/+/, '')
}

/* Student portrait with initials fallback on error */
function PersonPhoto({ url, name }) {
  const [err, setErr] = useState(false)
  const initials = (
    <div style={{ width: '100%', height: '100%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: 'var(--gold-lt)', fontFamily: 'var(--serif)' }}>
      {name.charAt(0)}
    </div>
  )
  if (!url || err) return initials
  return (
    <img src={url} alt={name}
      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
      onError={() => setErr(true)} />
  )
}

/* Single carousel slide with broken-image fallback */
function CarouselSlide({ src, active }) {
  const [err, setErr] = useState(false)
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: active ? 1 : 0, transition: 'opacity 0.75s ease' }}>
      {err
        ? <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'rgba(255,255,255,.28)', fontSize: 12 }}>
            <span style={{ fontSize: 30 }}>🖼</span>Image unavailable
          </div>
        : <img src={src} alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={() => setErr(true)} />
      }
    </div>
  )
}

/* ── Crossfade image carousel ──────────────────────────────── */
function ImageCarousel({ images }) {
  const [idx, setIdx] = useState(0)
  const slides = (images || []).filter(Boolean)

  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 3500)
    return () => clearInterval(t)
  }, [slides.length])

  if (!slides.length) return (
    <div style={{ width: '100%', paddingTop: '62%', borderRadius: 18, background: 'var(--g100)', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--g400)', fontSize: 13 }}>
        No images yet
      </div>
    </div>
  )

  return (
    <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', width: '100%', boxShadow: 'var(--sh-lg)' }}>
      <div style={{ position: 'relative', paddingTop: '62%', background: '#111' }}>
        {slides.map((src, i) => (
          <CarouselSlide key={i} src={src} active={i === idx} />
        ))}
      </div>
      {slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 7, zIndex: 2 }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              style={{
                width: i === idx ? 24 : 8, height: 8, borderRadius: 4,
                border: 'none', cursor: 'pointer', padding: 0, transition: 'all .35s',
                background: i === idx ? '#fff' : 'rgba(255,255,255,.45)', flexShrink: 0,
              }} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Collapsible description with "Read more" ──────────────── */
const LIMIT = 300
function ReadMore({ text, linkBtn }) {
  const [open, setOpen] = useState(false)
  const isLong = text.length > LIMIT

  if (!isLong) return (
    <p className="msg-body__text">{text}{linkBtn}</p>
  )

  return (
    <p className="msg-body__text">
      {open ? text : text.slice(0, LIMIT).trimEnd()}
      {!open && (
        <><span>… </span><button className="innov-readmore" onClick={() => setOpen(true)}>Read more</button></>
      )}
      {open && <>{linkBtn} <button className="innov-readmore" onClick={() => setOpen(false)}>Show less</button></>}
    </p>
  )
}

/* ── Single innovation row ─────────────────────────────────── */
function InnovRow({ item, index }) {
  const images = Array.isArray(item.images) ? item.images.filter(Boolean) : []
  const isReversed = index % 2 !== 0

  return (
    <div className={`innov-row${isReversed ? ' innov-row--rev' : ''}`}
      style={{ background: isReversed ? 'var(--off)' : 'var(--white)', borderBottom: '1px solid var(--g100)' }}>

      {/* ── Person half ── */}
      <div className="innov-person">
        <div className="msg-photo">
          <PersonPhoto url={item.photo_url} name={item.student_name} />
        </div>
        <div className="msg-body__name">{item.student_name}</div>
        <div className="msg-body__title">{item.university}</div>
        <ReadMore
          text={item.description}
          linkBtn={item.project_link
            ? <> <a href={safeHref(item.project_link)} target="_blank" rel="noopener noreferrer" className="innov-link-btn">Visit Project Site →</a></>
            : null}
        />
        <div className="msg-clear" />
      </div>

      {/* ── Carousel half ── */}
      <div className="innov-carousel">
        <ImageCarousel images={images} />
      </div>
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────── */
export default function Innovations() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/innovations')
      .then(r => setItems(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ paddingTop: 'var(--nav)' }}>

      {/* Hero */}
      <div className="page-hero">
        <div className="container">
          <h1>Student Initiatives, Ideas &amp; Innovations.</h1>
          <p className="sub">Explore what students are creating, discover new perspectives, inspire others, and support promising ideas into meaningful impact.</p>
          <div className="india-strip"><span/><span/><span/></div>
        </div>
      </div>

      {/* Intro band */}
      <div style={{ background: 'var(--white)', padding: '48px 6vw', width: '100%', boxSizing: 'border-box', borderBottom: '1px solid var(--g100)' }}>
        <p style={{ fontSize: 'clamp(14px, 1.6vw, 17px)', color: 'var(--g600)', lineHeight: 1.9, margin: 0, width: '100%' }}>
          Great ideas begin with curiosity, creativity, and the courage to think differently. AUSI supports Ugandan students in India to develop innovative solutions, and turn brainstorming into action. From new inventions and projects to practical solutions for real-world problems, students are encouraged to think boldly, create purposefully, and turn challenges into opportunities. Explore their ideas, share your perspective, and be part of an environment where creativity is encouraged, ideas are nurtured, and the next great solution can take shape.
        </p>
      </div>

      {/* Content */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--g400)', fontSize: 14 }}>Loading…</div>
      )}

      {!loading && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '100px 24px', background: 'var(--off)' }}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>💡</div>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, fontFamily: 'var(--serif)' }}>No innovations posted yet</div>
          <div style={{ color: 'var(--g400)', fontSize: 14 }}>Check back soon — students are building.</div>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div>
          {items.map((item, i) => (
            <InnovRow key={item.id} item={item} index={i} />
          ))}
        </div>
      )}

      <style>{`
        /* ── Row layout ─────────────────────────────── */
        .innov-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6vw;
          padding: 64px 6vw;
          align-items: center;
        }

        /* Reverse alternating rows: carousel left, person right */
        .innov-row--rev .innov-person   { order: 2; }
        .innov-row--rev .innov-carousel { order: 1; }

        /* ── Carousel half ─────────────────────────── */
        .innov-carousel { width: 100%; }

        /* ── Person half ───────────────────────────── */
        .innov-person { min-width: 0; }

        /* ── Description text — upright, like university page ── */
        .innov-person .msg-body__text {
          font-style: normal;
          text-align: left;
          hyphens: none;
          font-size: 15px;
          line-height: 1.8;
          color: var(--g700);
        }

        /* ── Project button — inline after description ─ */
        .innov-link-btn {
          display: inline-flex;
          align-items: center;
          vertical-align: middle;
          margin-left: 8px;
          padding: 5px 14px;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 700;
          font-style: normal;
          letter-spacing: 0.2px;
          color: var(--ink);
          background: linear-gradient(140deg, var(--gold-lt), var(--gold));
          text-decoration: none;
          transition: transform .18s, box-shadow .18s;
          box-shadow: 0 3px 10px rgba(201,146,10,.22);
          white-space: nowrap;
        }
        .innov-link-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(201,146,10,.35);
        }

        /* ── Read more / Show less toggle ─────────── */
        .innov-readmore {
          background: none;
          border: none;
          padding: 0;
          margin-left: 3px;
          color: var(--gold);
          font-size: inherit;
          font-style: normal;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 2px;
          vertical-align: baseline;
        }
        .innov-readmore:hover { opacity: .72; }

        /* ── Tablet ────────────────────────────────── */
        @media (max-width: 900px) {
          .innov-row { gap: 40px; padding: 52px 5vw; }
        }

        /* ── Mobile — stack vertically, person always first ── */
        @media (max-width: 640px) {
          .innov-row {
            grid-template-columns: 1fr;
            gap: 32px;
            padding: 44px 5vw;
          }
          /* Reset order so person always appears above carousel on mobile */
          .innov-row--rev .innov-person   { order: 0; }
          .innov-row--rev .innov-carousel { order: 1; }
        }
      `}</style>
    </div>
  )
}
