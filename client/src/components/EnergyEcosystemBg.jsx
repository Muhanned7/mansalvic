import React, { useEffect, useRef } from 'react';

export default function EnergyEcosystemBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle nodes representing digital code streams & renewable energy flow
    const particles = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 20), 70);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2.5 + 1,
        color: Math.random() > 0.4 ? 'rgba(16, 185, 129, ' : 'rgba(6, 182, 212, ',
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid network representing sustainable infrastructure
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.25)';
      ctx.lineWidth = 1;

      // Draw particles and connection vectors
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.fill();

        // Connect nearby nodes with subtle ecosystem energy lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const lineAlpha = (1 - dist / 130) * 0.25;
            ctx.strokeStyle = `rgba(16, 185, 129, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Mouse proximity interaction (only if motion allowed)
        if (!prefersReducedMotion) {
          const mdx = p.x - mouseX;
          const mdy = p.y - mouseY;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.4 * (1 - mdist / 150)})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
}
