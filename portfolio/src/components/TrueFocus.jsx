import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './TrueFocus.css';

const TrueFocus = ({
  sentence = 'WELCOME TO MY UNIVERSE',
  blurAmount = 5,
  borderColor = '#6366f1',
  glowColor = 'rgba(99, 102, 241, 0.6)',
  animationDuration = 0.5,
  pauseBetweenAnimations = 0.8
}) => {
  const words = sentence.split(' ');
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const wordRefs = useRef([]);
  const [focusRect, setFocusRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, (animationDuration + pauseBetweenAnimations) * 1000);

    return () => clearInterval(interval);
  }, [words.length, animationDuration, pauseBetweenAnimations]);

  useEffect(() => {
    if (wordRefs.current[currentIndex] && containerRef.current) {
      const parentRect = containerRef.current.getBoundingClientRect();
      const activeRect = wordRefs.current[currentIndex].getBoundingClientRect();

      setFocusRect({
        x: activeRect.left - parentRect.left,
        y: activeRect.top - parentRect.top,
        width: activeRect.width,
        height: activeRect.height,
      });
    }
  }, [currentIndex]);

  return (
    <div className="focus-container" ref={containerRef}>
      {words.map((word, index) => (
        <span
          key={index}
          ref={(el) => (wordRefs.current[index] = el)}
          className={`focus-word ${currentIndex === index ? 'active' : ''}`}
          style={{
            filter: currentIndex === index ? 'blur(0px)' : `blur(${blurAmount}px)`,
            '--border-color': borderColor,
            '--glow-color': glowColor,
            transition: `filter ${animationDuration}s ease`,
          }}
        >
          {word}
        </span>
      ))}
      <motion.div
        className="focus-frame"
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: 1,
        }}
        transition={{ duration: animationDuration }}
        style={{
          '--border-color': borderColor,
          '--glow-color': glowColor,
        }}
      >
        <span className="corner top-left"></span>
        <span className="corner top-right"></span>
        <span className="corner bottom-left"></span>
        <span className="corner bottom-right"></span>
      </motion.div>
    </div>
  );
};

export default TrueFocus;
