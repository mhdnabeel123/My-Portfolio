import { useRef, useEffect } from 'react';

const ClickSpark = ({
  sparkColor = 'rgba(99, 102, 241, 0.8)',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400
}) => {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let animationId;
    const ctx = canvas.getContext('2d');

    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      sparksRef.current = sparksRef.current.filter(spark => {
        const elapsed = time - spark.startTime;
        if (elapsed > duration) return false;
        
        const progress = elapsed / duration;
        const currentRadius = sparkRadius * progress;
        const opacity = 1 - progress;
        
        const x = spark.x + Math.cos(spark.angle) * currentRadius;
        const y = spark.y + Math.sin(spark.angle) * currentRadius;
        
        ctx.beginPath();
        ctx.arc(x, y, sparkSize * (1 - progress), 0, Math.PI * 2);
        ctx.fillStyle = sparkColor.replace('0.8', opacity.toString());
        ctx.fill();
        
        return true;
      });
      
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    const handleClick = (e) => {
      const now = performance.now();
      const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
        x: e.clientX,
        y: e.clientY,
        angle: (2 * Math.PI * i) / sparkCount,
        startTime: now
      }));
      sparksRef.current.push(...newSparks);
    };

    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationId);
    };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 11001,
        display: 'block'
      }}
    />
  );
};

export default ClickSpark;
