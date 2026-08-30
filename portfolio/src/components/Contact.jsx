import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { personalInfo } from '../data/resumeData';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const secRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.ct-title', { opacity:0, y:70, duration:1.1, ease:'power3.out', scrollTrigger:{trigger:'.ct-title',start:'top 85%'} });
      gsap.from('.ct-card', { opacity:0, y:60, scale:.95, stagger:.1, duration:.9, ease:'power3.out', scrollTrigger:{trigger:'.ct-grid',start:'top 82%'} });
    }, secRef);
    return () => ctx.revert();
  }, []);

  const copy = () => { navigator.clipboard.writeText(personalInfo.email); setCopied(true); setTimeout(()=>setCopied(false),2200); };

  const links = [
    { label:'GitHub',   icon:'⚡', href:personalInfo.github,           color:'var(--c-purple)' },
    { label:'LinkedIn', icon:'💼', href:personalInfo.linkedin,         color:'var(--c-cyan)' },
    { label:'Phone',    icon:'📡', href:`tel:${personalInfo.phone}`,   color:'var(--c-green)' },
  ];

  return (
    <section ref={secRef} id="contact" style={{ padding:'10rem 4rem 6rem', position:'relative' }}>
      <div style={{ position:'absolute', top:'3rem', left:'4rem', fontFamily:'var(--f-hd)', fontSize:'8rem', fontWeight:900, color:'rgba(0,230,118,.04)', userSelect:'none', lineHeight:1 }}>05</div>
      <div style={{ maxWidth:780, margin:'0 auto', textAlign:'center' }}>

        {/* Title */}
        <div className="ct-title" style={{ marginBottom:'4rem' }}>
          <div className="sec-label" style={{ color:'var(--c-green)', justifyContent:'center' }}>Get In Touch</div>
          <h2 style={{ fontFamily:'var(--f-hd)', fontSize:'clamp(2.5rem,5vw,4.5rem)', fontWeight:900, letterSpacing:'-.025em', lineHeight:1.05, marginBottom:'1rem' }}>
            Let's Build the<br />
            <span className="grad-text">Future Together</span>
          </h2>
          <p style={{ color:'rgba(255,255,255,.4)', fontSize:'1rem', lineHeight:1.85, maxWidth:480, margin:'0 auto' }}>
            Actively hunting AI/ML internships. Open to collaborations, freelance, or just a good conversation about intelligent systems.
          </p>
        </div>

        <div className="ct-grid" style={{ display:'flex', flexDirection:'column', gap:'1rem', marginBottom:'3rem' }}>
          {/* Email */}
          <div className="ct-card glass" style={{ padding:'1.5rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', borderColor:'rgba(0,229,255,.2)', transition:'all .3s ease' }}
            onClick={copy}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(0,229,255,.5)';e.currentTarget.style.boxShadow='0 0 40px rgba(0,229,255,.1)';e.currentTarget.style.transform='translateY(-2px)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(0,229,255,.2)';e.currentTarget.style.boxShadow='';e.currentTarget.style.transform='';}}
          >
            <div style={{ textAlign:'left' }}>
              <div style={{ fontFamily:'var(--f-mono)', fontSize:'.65rem', color:'rgba(255,255,255,.3)', letterSpacing:'.14em', textTransform:'uppercase', marginBottom:'.3rem' }}>Primary Email</div>
              <div style={{ fontFamily:'var(--f-mono)', fontSize:'.95rem', color:'var(--c-cyan)' }}>{personalInfo.email}</div>
            </div>
            <div style={{
              background: copied?'rgba(0,230,118,.15)':'rgba(0,229,255,.1)',
              border:`1px solid ${copied?'var(--c-green)':'rgba(0,229,255,.4)'}`,
              borderRadius:10, padding:'.45rem 1rem',
              fontFamily:'var(--f-mono)', fontSize:'.75rem', color:copied?'var(--c-green)':'var(--c-cyan)',
              fontWeight:700, transition:'all .3s',
            }}>{copied?'✓ Copied!':'Copy'}</div>
          </div>

          {/* Social links */}
          <div className="contact-links" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
            {links.map(l => (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="ct-card glass"
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'.55rem', padding:'1.3rem', textDecoration:'none', borderColor:`${l.color.replace('var(--c-','rgba(').replace(')','')},.15)`.replace('rgba(','rgba('), transition:'all .3s ease' }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow=`0 20px 50px rgba(0,0,0,.2)`; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
              >
                <span style={{ fontSize:'1.5rem' }}>{l.icon}</span>
                <span style={{ fontFamily:'var(--f-mono)', fontSize:'.72rem', color:l.color, fontWeight:700, letterSpacing:'.1em' }}>{l.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div style={{ fontFamily:'var(--f-mono)', fontSize:'.75rem', color:'rgba(255,255,255,.22)', display:'flex', alignItems:'center', justifyContent:'center', gap:'.5rem' }}>
          <span>📍</span> {personalInfo.location}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign:'center', marginTop:'6rem', paddingTop:'2rem', borderTop:'1px solid rgba(0,229,255,.07)', fontFamily:'var(--f-mono)', fontSize:'.7rem', color:'rgba(255,255,255,.15)', letterSpacing:'.1em' }}>
        <span style={{ color:'rgba(0,229,255,.4)' }}>©</span> {new Date().getFullYear()} Mohammed Nabeel N H · Built with ❤️ + Neural Nets
      </div>
    </section>
  );
}
