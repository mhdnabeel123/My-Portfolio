import { useEffect, useRef } from 'react';

export default function ParticleCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], animId;

    const COLORS = ['#00d4ff', '#7c3aed', '#ec4899', '#10b981'];

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    const spawn = () => {
      particles = Array.from({ length: 120 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.5 + 0.1,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.7,
      }));
    };

    resize();
    spawn();
    window.addEventListener('resize', () => { resize(); spawn(); });

    let t = 0;
    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, W, H);

      // Draw subtle grid
      ctx.strokeStyle = 'rgba(0,212,255,0.025)';
      ctx.lineWidth = 1;
      const gs = 100;
      for (let x = 0; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      // Particles
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        const a = p.alpha * (0.5 + 0.5 * Math.sin(t * p.speed + p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(a * 255).toString(16).padStart(2, '0');
        ctx.fill();

        // Connect close particles
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x, dy = particles[j].y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,212,255,${(1 - dist / 120) * 0.06})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      // Center ambient glow blobs
      const blob = (x, y, r, c) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, c + '14');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      };
      blob(W * 0.2 + Math.sin(t * 0.4) * 80, H * 0.3, 350, '#7c3aed');
      blob(W * 0.8 + Math.cos(t * 0.35) * 60, H * 0.6, 300, '#00d4ff');
      blob(W * 0.5, H * 0.8 + Math.sin(t * 0.5) * 40, 250, '#ec4899');

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', display: 'block' }} />
  );
}
