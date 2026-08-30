import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const secRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title slides up
      gsap.from('.about-title', {
        opacity: 0, y: 80, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.about-title', start: 'top 85%', toggleActions: 'play none none none' },
      });

      // Code block slides from left
      gsap.from('.about-code', {
        opacity: 0, x: -80, rotateY: 25, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.about-code', start: 'top 80%' },
      });

      // Trait cards stagger from right
      gsap.from('.trait-card', {
        opacity: 0, x: 60, stagger: 0.12, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '.trait-grid', start: 'top 80%' },
      });
    }, secRef);
    return () => ctx.revert();
  }, []);

  const traits = [
    { icon: '🧠', label: 'Deep Learning', desc: 'PyTorch · TensorFlow · Custom architectures', color: '#7c3aed' },
    { icon: '👁️', label: 'Computer Vision', desc: 'OpenCV · Segmentation · Real-time inference', color: '#00d4ff' },
    { icon: '🚀', label: 'ML Deployment', desc: 'FastAPI · Docker · REST APIs · Cloud', color: '#10b981' },
    { icon: '📑', label: 'Patent Filed', desc: 'Drone power-line inspection system', color: '#ec4899' },
  ];

  return (
    <section ref={secRef} id="about" style={{ padding: '10rem 3rem', position: 'relative' }}>
      {/* Section number */}
      <div style={{ position: 'absolute', top: '4rem', left: '3rem', fontFamily: 'var(--font-hd)', fontSize: '5rem', fontWeight: 900, color: 'rgba(0,212,255,0.04)', letterSpacing: '-0.05em', userSelect: 'none' }}>01</div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Title */}
        <div className="about-title" style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#00d4ff', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <span style={{ flex: 1, height: 1, background: 'linear-gradient(to left, rgba(0,212,255,0.4), transparent)', maxWidth: 80 }} />
            About Me
            <span style={{ flex: 1, height: 1, background: 'linear-gradient(to right, rgba(0,212,255,0.4), transparent)', maxWidth: 80 }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-hd)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Who Is <span style={{ background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Nabeel?</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
          {/* Code block */}
          <div className="about-code" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 0 60px rgba(0,212,255,0.04)' }}>
            {/* Window bar */}
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.8rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} style={{width:10,height:10,borderRadius:'50%',background:c}}/>)}
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:'rgba(255,255,255,0.2)', marginLeft:'0.75rem' }}>nabeel.profile.js</span>
            </div>
            <div style={{ padding: '2rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: 2.2 }}>
              {[
                [['kw','const '],['va','nabeel'],' = {'],
                [['  '],['ke','  name'],':   ',['st','"Mohammed Nabeel N H"'],','],
                [['ke','  role'],':   ',['st','"ML Engineer"'],','],
                [['ke','  location'],': ',['st','"Mysuru, India"'],','],
                [['ke','  passion'],': ',['st','"Building AI"'],','],
                [['ke','  status'],':  ',['st','"Open to intern"'],','],
                [['ke','  patent'],':  ',['bo','true']],
                ['}'],
              ].map((line, li) => (
                <div key={li} style={{ display:'flex', flexWrap:'wrap' }}>
                  {line.map((tok, ti) => {
                    if (typeof tok === 'string') return <span key={ti} style={{ color:'rgba(255,255,255,0.3)',whiteSpace:'pre' }}>{tok}</span>;
                    const [type, text] = tok;
                    const colors = { kw:'#c792ea',va:'#82aaff',ke:'#7fdbca',st:'#c3e88d',bo:'#f78c6c' };
                    return <span key={ti} style={{ color: colors[type]||'#fff', whiteSpace:'pre' }}>{text}</span>;
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Traits */}
          <div>
            <p style={{ fontSize:'1.05rem', color:'rgba(255,255,255,0.55)', lineHeight:1.9, marginBottom:'2rem' }}>
              I'm a <strong style={{color:'#fff'}}>Computer Science & AI</strong> undergraduate at VTU passionate about turning research into real products. From ultrasound segmentation to enterprise security systems — I build things that matter.
            </p>
            <div className="trait-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              {traits.map(({ icon,label,desc,color }) => (
                <div key={label} className="trait-card glass" style={{ padding:'1.3rem', cursor:'default', transition:'all 0.3s ease', borderColor:`${color}20` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=`${color}55`; e.currentTarget.style.boxShadow=`0 0 30px ${color}15`; e.currentTarget.style.transform='translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=`${color}20`; e.currentTarget.style.boxShadow=''; e.currentTarget.style.transform=''; }}
                >
                  <div style={{ fontSize:'1.4rem', marginBottom:'0.5rem' }}>{icon}</div>
                  <div style={{ fontFamily:'var(--font-hd)', fontSize:'0.8rem', color, marginBottom:'0.3rem', fontWeight:700 }}>{label}</div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.68rem', color:'rgba(255,255,255,0.38)', lineHeight:1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
