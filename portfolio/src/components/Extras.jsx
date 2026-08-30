import { useEffect } from 'react';
import { publications, achievements } from '../data/resumeData';

const Extras = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="extras-section section-gradient-2">
      <div className="extras-grid">
        {/* Publications */}
        {publications && publications.length > 0 && (
          <div className="extras-card glass-card reveal">
            <h3 className="extras-card-title">Publications & Patents</h3>
            {publications.map((pub, i) => (
              <div key={i} style={{ marginBottom: i < publications.length - 1 ? '2rem' : 0 }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '1.5rem', marginTop: '0.2rem' }}>{pub.icon}</div>
                  <div>
                    <h4 className="pub-title">{pub.title}</h4>
                    <p className="pub-meta">
                      <span style={{ color: 'var(--accent-1)', fontWeight: 600 }}>{pub.publisher}</span> · {pub.date}
                    </p>
                    {pub.appNo && (
                      <p className="pub-meta" style={{ marginTop: '0.25rem', color: 'var(--accent-3)' }}>
                        Application No: {pub.appNo}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Achievements */}
        {achievements && achievements.length > 0 && (
          <div className="extras-card glass-card reveal" style={{ transitionDelay: '0.1s' }}>
            <h3 className="extras-card-title">Awards & Leadership</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {achievements.map((ach, i) => (
                <div key={i} className="achievement-item">
                  <div className="achievement-icon">{ach.icon}</div>
                  <div>
                    <h4 className="achievement-title">{ach.title}</h4>
                    <p className="achievement-org">{ach.org}</p>
                  </div>
                  <div style={{ marginLeft: 'auto' }} className="achievement-date">
                    {ach.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Extras;
