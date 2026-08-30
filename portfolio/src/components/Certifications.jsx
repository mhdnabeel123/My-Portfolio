import { useEffect } from 'react';
import { certifications } from '../data/resumeData';

const Certifications = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="certifications" style={{ padding: '8rem 2rem', position: 'relative', overflow: 'hidden' }}>
      <div className="blob" style={{ width: 500, height: 500, background: '#a855f7', top: '20%', left: '-10%', opacity: 0.07 }} />

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 700, marginBottom: '0.75rem' }}>
            Credentials
          </p>
          <h2 className="section-title">Certifications & <span className="gradient-text-gold">Badges</span></h2>
          <div className="section-divider" style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }} />
          <p className="section-subtitle" style={{ marginTop: '1rem' }}>Continuously learning and growing</p>
        </div>

        <div className="certs-grid">
          {certifications.map((cert, i) => (
            <div
              key={i}
              className="cert-card glass-card reveal"
              style={{ transitionDelay: `${i * 0.07}s` }}
            >
              <div className="cert-icon">{cert.icon}</div>
              <div>
                <p className="cert-name">{cert.name}</p>
                <p className="cert-issuer">{cert.issuer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certifications;
