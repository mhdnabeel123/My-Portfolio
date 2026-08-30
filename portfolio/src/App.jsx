import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';
import Lenis from 'lenis';

import ThreeHeroBG from './components/ThreeHeroBG';
import WelcomeScreen from './components/WelcomeScreen';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Education from './components/Education';
import Contact from './components/Contact';
import './index.css';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [ready, setReady] = useState(false);
  const dotRef   = useRef(null);
  const ringRef  = useRef(null);
  const progRef  = useRef(null);
  const lenisRef = useRef(null);

  /* ── Lenis — run inside GSAP ticker (1 loop, not 2) ── */
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenisRef.current = lenis;

    // ✅ Key fix: use gsap.ticker instead of a separate RAF
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Let ScrollTrigger know about Lenis scroll
    lenis.on('scroll', ScrollTrigger.update);

    return () => {
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
      lenis.destroy();
    };
  }, []);

  /* ── Custom cursor — throttled to 60fps ── */
  useEffect(() => {
    if (!ready) return;
    const dot  = dotRef.current;
    const ring = ringRef.current;
    let mx = 0, my = 0, rx = 0, ry = 0, raf;

    // Passive mousemove — no layout reads
    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener('mousemove', onMove, { passive: true });

    const loop = () => {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      // Use transform instead of left/top — no layout recalc
      dot?.style.setProperty('transform',  `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`);
      ring?.style.setProperty('transform', `translate(calc(${rx}px - 50%), calc(${ry}px - 50%))`);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Hover state via event delegation (not per-element)
    const add = (e) => { if (e.target.closest('a,button')) { dot?.classList.add('hover'); ring?.classList.add('hover'); } };
    const rem = (e) => { if (e.target.closest('a,button')) { dot?.classList.remove('hover'); ring?.classList.remove('hover'); } };
    document.addEventListener('mouseover',  add, { passive: true });
    document.addEventListener('mouseout',   rem, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', add);
      document.removeEventListener('mouseout', rem);
    };
  }, [ready]);

  /* ── Scroll progress bar ── */
  useEffect(() => {
    if (!ready || !progRef.current) return;
    gsap.set(progRef.current, { scaleX: 0 });
    gsap.to(progRef.current, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 0.3 },
    });
  }, [ready]);

  const onFinish = useCallback(() => setReady(true), []);

  return (
    <div style={{ background: '#030309', minHeight: '100vh' }}>
      {/* Three.js background — fixed, below everything */}
      <ThreeHeroBG />

      {/* Static noise — CSS background-image, not animated */}
      <div className="noise" />

      {/* Cursor elements — position:fixed, use transform not left/top */}
      <div ref={dotRef}  className="cur-dot"  style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 99999 }} />
      <div ref={ringRef} className="cur-ring" style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 99998 }} />

      {/* Scroll progress */}
      <div ref={progRef} id="prog" />

      <AnimatePresence mode="wait">
        {!ready ? (
          <WelcomeScreen key="w" onFinish={onFinish} />
        ) : (
          <motion.div key="m"
            initial={{ opacity: 0, filter: 'blur(30px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'relative', zIndex: 2 }}
          >
            <Navbar />
            <main>
              <Hero />
              <About />
              <Skills />
              <Projects />
              <Education />
              <Contact />
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
