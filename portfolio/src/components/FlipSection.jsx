import { useEffect, useRef, useState } from 'react';

/**
 * FlipSection — wraps content in a 3D card that flips in when scrolled into view.
 * 
 * direction: 'up' | 'left' | 'right'
 * - 'up'    → flips from below (rotateX)
 * - 'left'  → flips from left side (rotateY, positive)
 * - 'right' → flips from right side (rotateY, negative)
 */
export default function FlipSection({ children, direction = 'up', delay = 0, style = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const getHiddenTransform = () => {
    switch (direction) {
      case 'left':  return 'perspective(1200px) rotateY(60deg) translateX(-60px) scale(0.92)';
      case 'right': return 'perspective(1200px) rotateY(-60deg) translateX(60px) scale(0.92)';
      case 'up':
      default:      return 'perspective(1200px) rotateX(50deg) translateY(80px) scale(0.92)';
    }
  };

  return (
    <div
      ref={ref}
      style={{
        transformStyle: 'preserve-3d',
        transform: visible ? 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateX(0) translateY(0) scale(1)' : getHiddenTransform(),
        opacity: visible ? 1 : 0,
        transition: `transform 0.9s cubic-bezier(0.23, 1, 0.32, 1) ${delay}ms, opacity 0.7s ease ${delay}ms`,
        willChange: 'transform, opacity',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
