import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './Welcome.css';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
const NAME  = 'MOHAMMED NABEEL';

function ScrambleText({ text, delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    let iters = 0;
    const TOTAL = text.length * 5;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (!ref.current) return clearInterval(interval);
        ref.current.textContent = text.split('').map((ch, i) => {
          if (ch === ' ') return ' ';
          if (i < iters / 5) return text[i];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('');
        iters++;
        if (iters > TOTAL) { ref.current.textContent = text; clearInterval(interval); }
      }, 40);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);
  return <span ref={ref}>{text.split('').map(() => '█').join('')}</span>;
}

export default function WelcomeScreen({ onFinish }) {
  useEffect(() => {
    const t = setTimeout(onFinish, 4500);
    return () => clearTimeout(t);
  }, [onFinish]);

  return (
    <motion.div className="welcome-overlay"
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(30px)' }}
      transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="scan-lines" />

      {/* Corner brackets */}
      {['tl','tr','bl','br'].map(c => <div key={c} className={`corner ${c}`} />)}

      {/* HUD lines */}
      <div className="hud-h" />
      <div className="hud-v" />

      <div className="wc-center">
        {/* Radar */}
        <div className="radar-wrap">
          <div className="radar-ring r1" />
          <div className="radar-ring r2" />
          <div className="radar-ring r3" />
          <div className="radar-sweep" />
          <div className="radar-core">
            <div className="radar-dot" />
          </div>
        </div>

        {/* Progress */}
        <motion.div className="wc-bar-track">
          <motion.div className="wc-bar-fill"
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ duration: 3.5, ease: [0.76, 0, 0.24, 1], delay: 0.3 }}
          />
          <motion.div className="wc-bar-glow"
            initial={{ left: '0%' }} animate={{ left: '100%' }}
            transition={{ duration: 3.5, ease: [0.76, 0, 0.24, 1], delay: 0.3 }}
          />
        </motion.div>

        {/* Name with scramble */}
        <h1 className="wc-name">
          <ScrambleText text={NAME} delay={200} />
        </h1>

        <motion.p className="wc-role"
          initial={{ opacity: 0, letterSpacing: '2em' }}
          animate={{ opacity: 0.7, letterSpacing: '0.35em' }}
          transition={{ delay: 1.5, duration: 1.2, ease: 'easeOut' }}
        >ML ENGINEER · AI INNOVATOR · COMPUTER VISION</motion.p>

        {/* Status dots */}
        <motion.div className="wc-status-row"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        >
          {['SYSTEMS', 'NEURAL NET', 'INTERFACE'].map((s, i) => (
            <div key={s} className="wc-status-item">
              <motion.span className="wc-dot"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 2.2 + i * 0.2, repeat: Infinity, repeatType: 'reverse', duration: 0.6 }}
              />
              <span className="wc-mono">{s}</span>
              <motion.span className="wc-ok"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 2.6 + i * 0.25 }}
              >OK</motion.span>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
