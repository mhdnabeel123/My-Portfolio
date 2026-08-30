import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from '../data/resumeData';

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const secRef = useRef(null);
  const [hov, setHov] = useState(null);
  const [visible, setVisible] = useState(false);

  /* Use IntersectionObserver instead of GSAP ScrollTrigger for visibility
     — avoids the Lenis opacity:0 conflict completely */
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);

    return () => obs.disconnect();
  }, []);

  return (
    <section ref={secRef} id="projects" style={{ padding: '10rem 4rem', position: 'relative' }}>
      {/* Ambient number */}
      <div style={{ position: 'absolute', top: '3rem', left: '4rem', fontFamily: 'var(--f-hd)', fontSize: '8rem', fontWeight: 900, color: 'rgba(224,64,251,.04)', userSelect: 'none', lineHeight: 1 }}>03</div>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div className="sec-label" style={{ color: 'var(--c-pink)', justifyContent: 'center' }}>Projects</div>
          <h2 className="sec-h">What I've <span className="grad-text-gold">Built</span></h2>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: '.78rem', color: 'rgba(255,255,255,.35)', marginTop: '.75rem' }}>Real-world AI systems shipped to production</p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.5rem' }}>
          {projects.map((p, i) => {
            const isHov = hov === p.id;
            return (
              <div
                key={p.id}
                onMouseEnter={() => setHov(p.id)}
                onMouseLeave={() => setHov(null)}
                style={{
                  background: isHov ? `linear-gradient(145deg, ${p.color}12, rgba(255,255,255,.025))` : 'rgba(255,255,255,.025)',
                  border: `1px solid ${isHov ? p.color + '55' : 'rgba(255,255,255,.07)'}`,
                  borderRadius: 24, padding: '2rem', position: 'relative', overflow: 'hidden',
                  transition: 'all .35s cubic-bezier(0.16,1,0.3,1)',
                  transform: visible
                    ? isHov ? 'translateY(-10px) scale(1.015)' : 'translateY(0) scale(1)'
                    : 'translateY(60px) scale(0.9)',
                  opacity: visible ? 1 : 0,
                  transitionDelay: visible ? `${i * 0.1}s` : '0s',
                  boxShadow: isHov ? `0 24px 64px ${p.color}18, 0 0 0 1px ${p.color}20` : '0 4px 20px rgba(0,0,0,.2)',
                  cursor: 'default',
                  willChange: 'transform, opacity',
                }}
              >
                {/* Top accent */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${p.color},transparent)`, opacity: isHov ? 1 : 0.5, transition: 'opacity .35s' }} />
                {/* Glow orb */}
                <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(${p.color}20, transparent 70%)`, pointerEvents: 'none', opacity: isHov ? 1 : 0.4, transition: 'opacity .35s' }} />

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: `${p.color}14`, border: `1px solid ${p.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', transition: 'transform .3s cubic-bezier(0.34,1.56,0.64,1)', transform: isHov ? 'scale(1.15) rotate(-8deg)' : '' }}>{p.icon}</div>
                  <a href={p.link} target="_blank" rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ color: p.color, background: `${p.color}12`, border: `1px solid ${p.color}30`, padding: '.28rem .9rem', borderRadius: '50px', fontSize: '.68rem', fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--f-mono)', letterSpacing: '.06em', transition: 'all .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${p.color}30`; e.currentTarget.style.transform = 'scale(1.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${p.color}12`; e.currentTarget.style.transform = ''; }}
                  >GitHub ↗</a>
                </div>

                <h3 style={{ fontFamily: 'var(--f-hd)', fontSize: '1.05rem', fontWeight: 800, marginBottom: '.2rem', color: '#fff', letterSpacing: '-.01em' }}>{p.title}</h3>
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: p.color, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.85rem' }}>{p.subtitle}</p>
                <p style={{ fontSize: '.87rem', color: 'rgba(255,255,255,.44)', lineHeight: 1.8, marginBottom: '1.25rem' }}>{p.description}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.38rem' }}>
                  {p.tech.map(t => (
                    <span key={t} style={{ background: `${p.color}0e`, border: `1px solid ${p.color}22`, color: 'rgba(255,255,255,.5)', padding: '.18rem .58rem', borderRadius: 6, fontSize: '.7rem', fontFamily: 'var(--f-mono)' }}>{t}</span>
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
