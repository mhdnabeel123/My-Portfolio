import { useEffect, useRef } from 'react';

// Beautiful aurora borealis / fluid gradient background - fixed version
// No harsh horizontal lines, smooth fluid motion
const THEMES = [
  { bg: ['#080012','#05000e','#0a0020'], glow1: '#5b21b6', glow2: '#4f46e5', glow3: '#7c3aed' },  // Hero – violet
  { bg: ['#000c1a','#000816','#001022'], glow1: '#0284c7', glow2: '#0891b2', glow3: '#0369a1' },  // About – ocean
  { bg: ['#00120a','#000d06','#001a0e'], glow1: '#16a34a', glow2: '#15803d', glow3: '#4ade80' },  // Skills – emerald
  { bg: ['#180008','#120004','#1e000c'], glow1: '#be123c', glow2: '#e11d48', glow3: '#fb7185' },  // Projects – rose
  { bg: ['#160a00','#100600','#1e0e00'], glow1: '#b45309', glow2: '#d97706', glow3: '#fbbf24' },  // Education – amber
  { bg: ['#0a0018','#070012','#10001e'], glow1: '#7c3aed', glow2: '#9333ea', glow3: '#c084fc' },  // Contact – purple
];

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function lerpRgb(c1, c2, t) {
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  return [
    Math.round(r1 + (r2 - r1) * t),
    Math.round(g1 + (g2 - g1) * t),
    Math.round(b1 + (b2 - b1) * t),
  ];
}

export default function DynamicBackground({ scrollProgress }) {
  const canvasRef = useRef(null);
  const scrollRef = useRef(0);
  const themeBlendRef = useRef(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    startRef.current = Date.now();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Stars – generated once
    let stars = [];
    let orbs = [];

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      stars = Array.from({ length: 180 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.3 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.2,
        opacity: 0.1 + Math.random() * 0.5,
      }));

      orbs = Array.from({ length: 5 }, (_, i) => ({
        // Place orbs at strategic positions around the canvas
        x: canvas.width * [0.2, 0.8, 0.5, 0.15, 0.85][i],
        y: canvas.height * [0.3, 0.2, 0.7, 0.8, 0.6][i],
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.25,
        radius: canvas.width * (0.3 + Math.random() * 0.2),
        phase: (Math.PI * 2 * i) / 5,
        colorKey: ['glow1', 'glow2', 'glow3', 'glow1', 'glow2'][i],
      }));
    };

    init();
    window.addEventListener('resize', init);

    const render = () => {
      const t = (Date.now() - startRef.current) / 1000;
      const sp = scrollRef.current;
      const W = canvas.width;
      const H = canvas.height;

      // Smooth theme blend
      const targetBlend = sp * (THEMES.length - 1);
      themeBlendRef.current += (targetBlend - themeBlendRef.current) * 0.025;
      const blend = themeBlendRef.current;
      const idxA = Math.min(Math.floor(blend), THEMES.length - 2);
      const idxB = idxA + 1;
      const frac = blend - idxA;
      const thA = THEMES[idxA];
      const thB = THEMES[idxB] || THEMES[idxA];

      // ── 1. Background radial gradient ──
      const bgA0 = lerpRgb(thA.bg[0], thB.bg[0], frac);
      const bgA1 = lerpRgb(thA.bg[2], thB.bg[2], frac);
      const bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.35, 0, W * 0.5, H * 0.5, W * 0.9);
      bgGrad.addColorStop(0, `rgb(${bgA0.join(',')})`);
      bgGrad.addColorStop(1, `rgb(${bgA1.join(',')})`);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // ── 2. Floating glow orbs (aurora blobs) ──
      ctx.globalCompositeOperation = 'screen';
      orbs.forEach((orb) => {
        orb.x += orb.vx + Math.sin(t * 0.18 + orb.phase) * 0.6;
        orb.y += orb.vy + Math.cos(t * 0.14 + orb.phase * 1.3) * 0.5;

        // Soft bounce
        if (orb.x < -orb.radius * 0.5) orb.vx = Math.abs(orb.vx);
        if (orb.x > W + orb.radius * 0.5) orb.vx = -Math.abs(orb.vx);
        if (orb.y < -orb.radius * 0.5) orb.vy = Math.abs(orb.vy);
        if (orb.y > H + orb.radius * 0.5) orb.vy = -Math.abs(orb.vy);

        const glowHexA = thA[orb.colorKey];
        const glowHexB = thB[orb.colorKey];
        const glowRgb = lerpRgb(glowHexA, glowHexB, frac);
        const pulse = 0.10 + 0.04 * Math.sin(t * 1.1 + orb.phase);

        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        grad.addColorStop(0, `rgba(${glowRgb.join(',')},${pulse})`);
        grad.addColorStop(0.45, `rgba(${glowRgb.join(',')},${pulse * 0.3})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── 3. Stars ──
      ctx.globalCompositeOperation = 'source-over';
      stars.forEach((s) => {
        const a = s.opacity * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      });

      // ── 4. Subtle grid ──
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(255,255,255,0.025)';
      ctx.lineWidth = 0.5;
      const gridSize = 80;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // ── 5. Vignette ──
      const vig = ctx.createRadialGradient(W / 2, H / 2, W * 0.25, W / 2, H / 2, W * 0.9);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.65)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none', display: 'block',
      }}
    />
  );
}
