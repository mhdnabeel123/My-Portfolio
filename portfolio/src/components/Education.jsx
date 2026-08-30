import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { education, certifications, achievements, publications } from '../data/resumeData';

gsap.registerPlugin(ScrollTrigger);

export default function Education() {
  const secRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.ed-title', { opacity:0, y:60, duration:1, ease:'power3.out', scrollTrigger:{trigger:'.ed-title',start:'top 85%'} });
      gsap.from('.edu-item', { opacity:0, x:-80, stagger:.15, duration:.9, ease:'power3.out', scrollTrigger:{trigger:'.edu-col',start:'top 80%'} });
      // gsap.from('.cert-item', { opacity:0, x:80, stagger:.07, duration:.8, ease:'power3.out', scrollTrigger:{trigger:'.cert-col',start:'top 80%'} });
      gsap.from('.extra-card', { opacity:0, y:50, scale:.95, stagger:.1, duration:.9, ease:'power3.out', scrollTrigger:{trigger:'.extras-row',start:'top 85%'} });
    }, secRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={secRef} id="education" style={{ padding:'10rem 4rem', position:'relative' }}>
      <div style={{ position:'absolute', top:'3rem', right:'4rem', fontFamily:'var(--f-hd)', fontSize:'8rem', fontWeight:900, color:'rgba(255,215,64,.04)', userSelect:'none', lineHeight:1 }}>04</div>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>

        <div className="ed-title" style={{ textAlign:'center', marginBottom:'5rem' }}>
          <div className="sec-label" style={{ color:'var(--c-gold)', justifyContent:'center' }}>Journey</div>
          <h2 className="sec-h">Education & <span className="grad-text-gold">Certs</span></h2>
        </div>

        <div className="edu-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4rem', marginBottom:'3rem' }}>
          {/* Education */}
          <div className="edu-col">
            <div style={{ fontFamily:'var(--f-mono)', fontSize:'.7rem', color:'var(--c-gold)', letterSpacing:'.2em', textTransform:'uppercase', marginBottom:'2rem', display:'flex', alignItems:'center', gap:'.75rem' }}>
              <span style={{ width:16, height:1, background:'var(--c-gold)' }} />Education
            </div>
            <div style={{ position:'relative', paddingLeft:'2rem' }}>
              <div style={{ position:'absolute', left:8, top:0, bottom:0, width:1, background:'linear-gradient(to bottom, var(--c-gold), transparent)', opacity:.4 }} />
              {education.map((e, i) => (
                <div key={i} className="edu-item" style={{ marginBottom:'2rem', position:'relative' }}>
                  <div style={{ position:'absolute', left:-28, top:6, width:16, height:16, borderRadius:'50%', background:'linear-gradient(135deg,var(--c-gold),#ff8f00)', border:'2px solid var(--c-bg)', boxShadow:'0 0 16px rgba(255,215,64,.6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.55rem' }}>{e.icon}</div>
                  <div className="glass" style={{ padding:'1.25rem', borderColor:'rgba(255,215,64,.12)', transition:'all .3s ease', cursor:'default' }}
                    onMouseEnter={el=>{ el.currentTarget.style.borderColor='rgba(255,215,64,.4)'; el.currentTarget.style.boxShadow='0 0 30px rgba(255,215,64,.08)'; el.currentTarget.style.transform='translateX(4px)'; }}
                    onMouseLeave={el=>{ el.currentTarget.style.borderColor='rgba(255,215,64,.12)'; el.currentTarget.style.boxShadow=''; el.currentTarget.style.transform=''; }}
                  >
                    <div style={{ fontFamily:'var(--f-mono)', fontSize:'.65rem', color:'var(--c-gold)', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:'.3rem' }}>{e.period}</div>
                    <div style={{ fontFamily:'var(--f-hd)', fontSize:'.9rem', fontWeight:700, marginBottom:'.2rem' }}>{e.degree}</div>
                    <div style={{ fontSize:'.82rem', color:'rgba(255,255,255,.4)' }}>{e.institution} · {e.location}</div>
                    {e.note && <div style={{ fontFamily:'var(--f-mono)', fontSize:'.72rem', color:'var(--c-gold)', fontStyle:'italic', marginTop:'.3rem' }}>{e.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="cert-col">
            <div style={{ fontFamily:'var(--f-mono)', fontSize:'.7rem', color:'var(--c-purple)', letterSpacing:'.2em', textTransform:'uppercase', marginBottom:'2rem', display:'flex', alignItems:'center', gap:'.75rem' }}>
              <span style={{ width:16, height:1, background:'var(--c-purple)' }} />Certifications
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'.6rem' }}>
              {certifications.map((c, i) => (
                <div key={i} className="cert-item glass" style={{ padding:'.9rem 1.2rem', display:'flex', alignItems:'flex-start', gap:'.75rem', borderColor:'rgba(124,77,255,.12)', transition:'all .3s ease', cursor:'default' }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(124,77,255,.4)'; e.currentTarget.style.transform='translateX(8px)'; e.currentTarget.style.boxShadow='0 0 24px rgba(124,77,255,.1)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(124,77,255,.12)'; e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
                >
                  <span style={{ fontSize:'1rem', flexShrink:0 }}>{c.icon}</span>
                  <div>
                    <div style={{ fontSize:'.84rem', fontWeight:600, lineHeight:1.4 }}>{c.name}</div>
                    <div style={{ fontFamily:'var(--f-mono)', fontSize:'.62rem', color:'var(--c-purple)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', marginTop:'.2rem' }}>{c.issuer}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements + Patents */}
        <div className="extras-row" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
          {achievements.map((a, i) => (
            <div key={i} className="extra-card glass" style={{ padding:'1.5rem', display:'flex', alignItems:'center', gap:'1rem', borderColor:'rgba(255,215,64,.2)', background:'linear-gradient(135deg,rgba(255,215,64,.06),rgba(255,111,0,.03))' }}>
              <span style={{ fontSize:'2.2rem' }}>{a.icon}</span>
              <div>
                <div style={{ fontFamily:'var(--f-hd)', fontWeight:700, fontSize:'.95rem', marginBottom:'.2rem' }}>{a.title}</div>
                <div style={{ fontFamily:'var(--f-mono)', fontSize:'.72rem', color:'rgba(255,255,255,.4)' }}>{a.org} · {a.date}</div>
              </div>
            </div>
          ))}
          {publications.map((p, i) => (
            <div key={i} className="extra-card glass" style={{ padding:'1.5rem', display:'flex', alignItems:'flex-start', gap:'1rem', borderColor:'rgba(0,229,255,.2)', background:'linear-gradient(135deg,rgba(0,229,255,.06),rgba(124,77,255,.03))' }}>
              <span style={{ fontSize:'2.2rem', flexShrink:0 }}>{p.icon}</span>
              <div>
                <div style={{ fontFamily:'var(--f-mono)', fontSize:'.65rem', color:'var(--c-cyan)', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:'.35rem' }}>Patent · {p.date}</div>
                <div style={{ fontWeight:600, fontSize:'.84rem', lineHeight:1.5, marginBottom:'.3rem' }}>{p.title}</div>
                <div style={{ fontFamily:'var(--f-mono)', fontSize:'.7rem', color:'rgba(255,255,255,.3)' }}>{p.publisher} · {p.appNo}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
