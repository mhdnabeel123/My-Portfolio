import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const LINKS = [
  { id: 'home',      label: 'Home' },
  { id: 'about',     label: 'About' },
  { id: 'skills',    label: 'Skills' },
  { id: 'projects',  label: 'Projects' },
  { id: 'education', label: 'Certs' },
  { id: 'contact',   label: 'Contact Me' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive]     = useState('home');
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });

    // Active section via IntersectionObserver
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { threshold: 0.35 });
    LINKS.forEach(l => { const el = document.getElementById(l.id); if (el) obs.observe(el); });

    // Entrance animation
    gsap.from(navRef.current, { y: -80, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.5 });

    return () => { window.removeEventListener('scroll', onScroll); obs.disconnect(); };
  }, []);

  const goto = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setActive(id);
  };

  return (
    <nav ref={navRef} style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      padding: scrolled ? '.65rem 2.5rem' : '1rem 2.5rem',
      /* Always show glass background so nav is readable */
      background: scrolled ? 'rgba(3,3,9,.92)' : 'rgba(3,3,9,.75)',
      backdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: '1px solid rgba(0,229,255,.1)',
      boxShadow: scrolled ? '0 4px 40px rgba(0,0,0,.6)' : '0 2px 20px rgba(0,0,0,.3)',
      transition: 'all .4s cubic-bezier(0.16,1,0.3,1)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <div onClick={() => goto('home')} style={{
        fontFamily: 'var(--f-hd)', fontWeight: 900, fontSize: '1.35rem',
        background: 'linear-gradient(135deg,var(--c-cyan),var(--c-purple))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        cursor: 'pointer', userSelect: 'none', letterSpacing: '.05em',
        filter: 'drop-shadow(0 0 12px rgba(0,229,255,.4))',
      }}>MN.</div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '.1rem' }}>
        {LINKS.map(l => {
          const isActive = active === l.id;
          return (
            <button key={l.id} onClick={() => goto(l.id)} style={{
              background: isActive ? 'rgba(0,229,255,.12)' : 'transparent',
              border: isActive ? '1px solid rgba(0,229,255,.4)' : '1px solid transparent',
              /* Bumped opacity from .42 → .72 so text is always clearly readable */
              color: isActive ? 'var(--c-cyan)' : 'rgba(255,255,255,.72)',
              padding: '.38rem .95rem', borderRadius: '50px', cursor: 'pointer',
              fontFamily: 'var(--f-hd)', fontWeight: 700, fontSize: '.7rem',
              letterSpacing: '.08em', transition: 'all .25s ease',
              textShadow: isActive ? '0 0 16px rgba(0,229,255,.7)' : 'none',
            }}
              onMouseEnter={e => { if (!isActive) { e.target.style.color = '#fff'; e.target.style.background = 'rgba(255,255,255,.07)'; e.target.style.borderColor = 'rgba(255,255,255,.1)'; } }}
              onMouseLeave={e => { if (!isActive) { e.target.style.color = 'rgba(255,255,255,.72)'; e.target.style.background = 'transparent'; e.target.style.borderColor = 'transparent'; } }}
            >{l.label}</button>
          );
        })}
      </div>

      {/* Hire CTA */}
      <a href="mailto:nabeelsheik8800@gmail.com" className="btn-glow" style={{ fontSize: '.7rem', padding: '.42rem 1.3rem' }}>Hire Me ⚡</a>
    </nav>
  );
}
