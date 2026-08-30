import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { skills } from '../data/resumeData';

gsap.registerPlugin(ScrollTrigger);

const PALETTE = ['#00e5ff','#7c4dff','#00e676','#e040fb','#ffd740','#ff6d00','#2979ff','#f44336'];

export default function Skills() {
  const secRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title
      gsap.from('.sk-title', { opacity: 0, y: 70, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.sk-title', start: 'top 85%' } });

      // Cards — fan in from below with scale
      gsap.from('.sk-card', {
        opacity: 0, y: 100, scale: 0.85, rotateX: 20,
        stagger: { amount: 0.7, from: 'start' },
        duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.sk-grid', start: 'top 80%' },
      });
    }, secRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={secRef} id="skills" style={{ padding: '10rem 4rem', position: 'relative' }}>
      {/* Ambient number */}
      <div style={{ position: 'absolute', top: '3rem', right: '4rem', fontFamily: 'var(--f-hd)', fontSize: '8rem', fontWeight: 900, color: 'rgba(124,77,255,.04)', userSelect: 'none', lineHeight: 1 }}>02</div>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Title */}
        <div className="sk-title" style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div className="sec-label" style={{ color: 'var(--c-purple)', justifyContent: 'center' }}>Tech Arsenal</div>
          <h2 className="sec-h">My <span className="grad-text">Skills</span></h2>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: '.8rem', color: 'rgba(255,255,255,.3)', marginTop: '.75rem' }}>Tools I wield to build intelligence</p>
        </div>

        {/* Grid */}
        <div className="sk-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.2rem' }}>
          {Object.entries(skills).map(([cat, items], i) => {
            const c = PALETTE[i % PALETTE.length];
            return (
              <div key={cat} className="sk-card glow-card glass"
                style={{ padding: '1.75rem', cursor: 'default', transition: 'transform .3s var(--ease-out), box-shadow .3s', perspective: '600px' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = `0 20px 60px ${c}18, 0 0 0 1px ${c}30`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                {/* Top accent */}
                <div style={{ height: 2, background: `linear-gradient(90deg,${c},transparent)`, marginBottom: '1.25rem', borderRadius: 2 }} />
                {/* Corner glow */}
                <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(${c}18,transparent 70%)`, pointerEvents: 'none' }} />

                <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.68rem', color: c, letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '1rem' }}>{cat}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.45rem' }}>
                  {items.map(s => (
                    <span key={s} style={{
                      background: `${c}0d`, border: `1px solid ${c}22`, color: 'rgba(255,255,255,.7)',
                      padding: '.22rem .65rem', borderRadius: 6, fontSize: '.78rem', fontWeight: 500,
                      transition: 'all .2s', cursor: 'default',
                    }}
                      onMouseEnter={e => { e.target.style.background = `${c}28`; e.target.style.color = '#fff'; e.target.style.transform = 'scale(1.06)'; e.target.style.boxShadow = `0 0 12px ${c}40`; }}
                      onMouseLeave={e => { e.target.style.background = `${c}0d`; e.target.style.color = 'rgba(255,255,255,.7)'; e.target.style.transform = ''; e.target.style.boxShadow = ''; }}
                    >{s}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
