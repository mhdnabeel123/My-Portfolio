import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import nabeelPhoto from '../assets/nabeel.jpg';

gsap.registerPlugin(ScrollTrigger);

const roles = ['AI & ML Engineer', 'Autonomous Systems Dev', 'Computer Vision & XAI', 'Generative AI Builder', 'Agentic AI Dev'];

// ── Magnetic button hook ──
function useMagnetic(ref, strength = 0.35) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top  - r.height / 2;
      gsap.to(el, { x: x * strength, y: y * strength, duration: 0.4, ease: 'power2.out' });
    };
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);
    return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); };
  }, [ref, strength]);
}

export default function Hero() {
  const secRef   = useRef(null);
  const headRef  = useRef(null);
  const roleRef  = useRef(null);
  const btn1Ref  = useRef(null);
  const btn2Ref  = useRef(null);
  const btn3Ref  = useRef(null);
  const imgRef   = useRef(null);
  const charIdx  = useRef(0);
  const roleIdx  = useRef(0);
  const del      = useRef(false);
  const lastTime = useRef(0);

  useMagnetic(btn1Ref, 0.4);
  useMagnetic(btn2Ref, 0.4);
  useMagnetic(btn3Ref, 0.4);

  /* Typewriter */
  useEffect(() => {
    let raf, timer;
    const SPEED = 75, DSPEED = 38, PAUSE = 1800;
    const tick = (t) => {
      if (t - lastTime.current < (del.current ? DSPEED : SPEED)) { raf = requestAnimationFrame(tick); return; }
      lastTime.current = t;
      const word = roles[roleIdx.current];
      if (!del.current) {
        charIdx.current++;
        if (charIdx.current > word.length) { del.current = true; timer = setTimeout(() => { raf = requestAnimationFrame(tick); }, PAUSE); return; }
      } else {
        charIdx.current--;
        if (charIdx.current < 0) { charIdx.current = 0; del.current = false; roleIdx.current = (roleIdx.current + 1) % roles.length; }
      }
      if (roleRef.current) roleRef.current.textContent = word.slice(0, charIdx.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); };
  }, []);

  /* GSAP entrance + parallax */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      // Stagger every .word span
      const words = headRef.current.querySelectorAll('.w');
      tl.from('.hero-badge', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' })
        .from(words, { opacity: 0, y: 80, rotateX: -50, filter: 'blur(10px)', stagger: 0.07, duration: 1, ease: 'power3.out' }, '-=0.4')
        .from('.hero-role', { opacity: 0, x: -30, duration: 0.7 }, '-=0.5')
        .from('.hero-desc', { opacity: 0, y: 20, duration: 0.7 }, '-=0.4')
        .from('.hero-btns', { opacity: 0, y: 20, duration: 0.7 }, '-=0.4')
        .from('.hero-stat', { opacity: 0, y: 30, stagger: 0.1, duration: 0.6 }, '-=0.3')
        .from(imgRef.current, { opacity: 0, scale: 0.7, rotateY: 30, duration: 1.2, ease: 'power3.out' }, 0.6);

      // Parallax
      gsap.to(headRef.current, { y: -100, ease: 'none', scrollTrigger: { trigger: secRef.current, start: 'top top', end: 'bottom top', scrub: 1.2 } });
      gsap.to(imgRef.current,  { y:   70, ease: 'none', scrollTrigger: { trigger: secRef.current, start: 'top top', end: 'bottom top', scrub: 1.8 } });
    }, secRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={secRef} id="home" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 4rem 4rem', position: 'relative', perspective: '1000px' }}>
      <div className="hero-grid" style={{ maxWidth: 1200, width: '100%', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '5rem', alignItems: 'center' }}>

        {/* LEFT */}
        <div>
          {/* Badge */}
          <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '.6rem', border: '1px solid rgba(0,229,255,.3)', background: 'rgba(0,229,255,.06)', borderRadius: '50px', padding: '.4rem 1.1rem', marginBottom: '2rem', backdropFilter: 'blur(12px)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--c-green)', boxShadow: '0 0 10px var(--c-green)', display: 'block', animation: 'blink 2s infinite' }} />
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.7rem', color: 'var(--c-cyan)', letterSpacing: '.18em', textTransform: 'uppercase' }}>Available for Internships</span>
          </div>

          {/* Headline */}
          <h1 ref={headRef} style={{ fontFamily: 'var(--f-hd)', fontSize: 'clamp(2.6rem,5.5vw,5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-.02em', marginBottom: '1.25rem', transformStyle: 'preserve-3d', willChange: 'transform' }}>
            {'Building Tomorrow\'s'.split(' ').map((w, i) => (
              <span key={i} className="w" style={{ display: 'inline-block', marginRight: '.35em', color: '#e8eaf6' }}>{w}</span>
            ))}
            <br />
            {'Intelligence'.split(' ').map((w, i) => (
              <span key={i} className="w grad-text" style={{ display: 'inline-block' }}>{w}</span>
            ))}
          </h1>

          {/* Typewriter role */}
          <div className="hero-role" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.25rem' }}>
            <span style={{ fontFamily: 'var(--f-mono)', color: 'var(--c-cyan)', fontSize: '1.1rem' }}>›</span>
            <span ref={roleRef} style={{ fontFamily: 'var(--f-hd)', fontSize: 'clamp(.9rem,2vw,1.15rem)', color: 'var(--c-cyan)', fontWeight: 700, minWidth: 220 }} />
            <span style={{ color: 'var(--c-cyan)', animation: 'blink .85s infinite', fontSize: '1.2rem' }}>|</span>
          </div>

          {/* Description */}
          <p className="hero-desc" style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,.48)', lineHeight: 1.85, maxWidth: 520, marginBottom: '2.5rem' }}>
            CS & AI undergrad at Maharaja Institute of Technology Mysore. Building real-world intelligent systems — from fetal head segmentation to multi-agent society simulations. One patent filed. Four featured AI projects shipped.
          </p>

          {/* Buttons */}
          <div className="hero-btns" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            <a ref={btn1Ref} href="#projects" className="btn-glow">⚡ View Projects</a>
            <a ref={btn2Ref} href="/resume_mohammed_nabeel_n_h.pdf" target="_blank" rel="noreferrer" className="btn-outline">📄 Resume ↗</a>
            <a ref={btn3Ref} href="#contact" className="btn-outline">Contact Me →</a>
          </div>

          {/* Stats with animated numbers */}
          <div className="stats-row" style={{ display: 'flex', gap: '3rem' }}>
            {[['4+','Projects Built'],['5+','Certifications'],['1','Patent Filed'],['2+','Years Deep']].map(([n,l]) => (
              <div key={l} className="hero-stat">
                <div style={{ fontFamily: 'var(--f-hd)', fontSize: '2.2rem', fontWeight: 900, color: 'var(--c-cyan)', textShadow: '0 0 24px rgba(0,229,255,.7)', lineHeight: 1 }}>{n}</div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: 'rgba(255,255,255,.32)', textTransform: 'uppercase', letterSpacing: '.12em', marginTop: '.35rem' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Avatar */}
        <div ref={imgRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 380, willChange: 'transform' }}>

          {/* ── Sci-fi HUD frame (replaces ugly spinning rings) ── */}
          {/* Single clean outer pulse ring */}
          <div style={{ position: 'absolute', width: 290, height: 290, borderRadius: '50%', border: '1px solid rgba(0,229,255,.25)', animation: 'pulse-glow 3s ease-in-out infinite', pointerEvents: 'none' }} />
          {/* Corner bracket decorations — 4 corners of an invisible square */}
          {[
            { top: 10,  left: 10,  borderWidth: '2px 0 0 2px' },
            { top: 10,  right: 10, borderWidth: '2px 2px 0 0' },
            { bottom: 10, left: 10,  borderWidth: '0 0 2px 2px' },
            { bottom: 10, right: 10, borderWidth: '0 2px 2px 0' },
          ].map((style, i) => (
            <div key={i} style={{
              position: 'absolute', width: 30, height: 30,
              borderStyle: 'solid', borderColor: 'rgba(0,229,255,.7)',
              ...style, zIndex: 5,
              animation: `corner-blink 3s ease infinite`,
              animationDelay: `${i * 0.4}s`,
            }} />
          ))}
          {/* Dot markers at 12/3/6/9 o'clock */}
          {[0, 90, 180, 270].map(deg => (
            <div key={deg} style={{
              position: 'absolute', width: 6, height: 6, borderRadius: '50%',
              background: deg === 0 ? 'var(--c-cyan)' : 'rgba(0,229,255,.4)',
              boxShadow: deg === 0 ? '0 0 10px var(--c-cyan)' : 'none',
              transform: `rotate(${deg}deg) translateY(-155px)`,
              animation: 'blink 2s ease-in-out infinite',
              animationDelay: `${deg / 360}s`,
              zIndex: 5,
            }} />
          ))}

          {/* Real profile photo */}
          <div style={{ position: 'relative', zIndex: 2, width: 240, height: 240 }}>
            {/* Outer glow ring */}
            <div style={{
              position: 'absolute', inset: -4, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(0,229,255,.8), rgba(124,77,255,.6), rgba(224,64,251,.4))',
              animation: 'pulse-glow 3s ease infinite',
              zIndex: 0,
            }} />
            {/* Scan line that sweeps across the photo */}
            <div style={{
              position: 'absolute', left: 0, right: 0, height: 2,
              background: 'linear-gradient(90deg, transparent, rgba(0,229,255,.7), transparent)',
              animation: 'photo-scan 3s ease-in-out infinite',
              zIndex: 3, borderRadius: 1, pointerEvents: 'none',
            }} />
            {/* Photo */}
            <img
              src={nabeelPhoto}
              alt="Mohammed Nabeel"
              style={{
                width: '100%', height: '100%', borderRadius: '50%',
                objectFit: 'cover', objectPosition: 'center top',
                border: '3px solid rgba(0,229,255,.5)',
                boxShadow: '0 0 60px rgba(0,229,255,.35), 0 0 120px rgba(124,77,255,.2)',
                position: 'relative', zIndex: 1,
                display: 'block',
              }}
            />
          </div>

          {/* Floating info chips */}
          {[
            { txt: '🟢 OPEN TO WORK', c: 'var(--c-green)', top: '8%', right: '-12%', delay: '0s' },
            { txt: '🧠 PyTorch', c: 'var(--c-purple)', top: '48%', left: '-22%', delay: '1.5s' },
            { txt: '👁️ OpenCV', c: 'var(--c-cyan)', bottom: '18%', right: '-18%', delay: '0.8s' },
          ].map(({ txt, c, delay, ...pos }) => (
            <div key={txt} style={{
              position: 'absolute', ...pos, zIndex: 4,
              background: 'rgba(3,3,9,.92)', border: `1px solid ${c}55`,
              borderRadius: 10, padding: '.45rem .95rem',
              backdropFilter: 'blur(20px)',
              fontFamily: 'var(--f-mono)', fontSize: '.7rem', color: c, fontWeight: 700,
              boxShadow: `0 0 24px ${c}25`,
              animation: `float 4s ease-in-out infinite`, animationDelay: delay,
            }}>{txt}</div>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', animation: 'float 2.5s ease-in-out infinite' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.62rem', color: 'rgba(0,229,255,.4)', letterSpacing: '.25em', marginBottom: '.5rem' }}>SCROLL</div>
        <div style={{ width: 1, height: 55, background: 'linear-gradient(to bottom, rgba(0,229,255,.5), transparent)', margin: '0 auto' }} />
      </div>
    </section>
  );
}
