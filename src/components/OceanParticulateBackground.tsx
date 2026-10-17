import React, { useEffect, useRef } from 'react';

interface OceanParticulateBackgroundProps {
  className?: string;
  particleCount?: number;
  interactive?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  hueType: 'cyan' | 'blue' | 'sage' | 'white';
}

export const OceanParticulateBackground: React.FC<OceanParticulateBackgroundProps> = ({
  className = '',
  particleCount = 65,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Mouse coordinates for gentle hydrodynamic displacement
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 120,
      active: false,
    };

    // Color palette matching oceanic depths & Tech & Tonic botanical tint
    const colorMap = {
      cyan: { r: 6, g: 182, b: 212 }, // Cyan #06b6d4
      blue: { r: 56, g: 189, b: 248 }, // Light blue #38bdf8
      sage: { r: 101, g: 155, b: 115 }, // Sage green #659b73 (Tech & Tonic)
      white: { r: 241, g: 245, b: 249 }, // Pure marine snow
    };

    // Handle high DPI
    const handleResize = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse interaction listeners on container parent
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const parent = canvas.parentElement;
    if (interactive && parent) {
      parent.addEventListener('mousemove', handleMouseMove);
      parent.addEventListener('mouseleave', handleMouseLeave);
    }

    // Initialize particles with natural ocean particulate distribution
    const types: ('cyan' | 'blue' | 'sage' | 'white')[] = ['cyan', 'blue', 'sage', 'white'];
    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      const hueType = types[Math.floor(Math.random() * types.length)];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        // Gentle horizontal drift (westerly wind / equatorial current drift)
        vx: (Math.random() - 0.3) * 0.45,
        // Subtle vertical buoyant oscillation
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2.4 + 1.2,
        baseAlpha: Math.random() * 0.35 + 0.12,
        alpha: 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulsePhase: Math.random() * Math.PI * 2,
        hueType,
      };
    });

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min(1.5, (time - lastTime) / 16.6);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Draw and update each floating particulate
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update pulsation
        p.pulsePhase += p.pulseSpeed * delta;
        p.alpha = p.baseAlpha + Math.sin(p.pulsePhase) * 0.12;

        // Hydrodynamic mouse repulsion (gentle water displacement)
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius && dist > 0) {
            const force = (1 - dist / mouse.radius) * 0.8;
            p.x += (dx / dist) * force * delta;
            p.y += (dy / dist) * force * delta;
          }
        }

        // Apply natural fluid drift
        p.x += p.vx * delta;
        p.y += p.vy * delta;

        // Subtle buoyancy oscillation
        p.y += Math.sin(time * 0.001 + i) * 0.15;

        // Wrap around boundaries seamlessly
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        const c = colorMap[p.hueType];

        // Draw soft ambient halo for larger particulates
        if (p.size > 2.2) {
          const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.5);
          glowGrad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${p.alpha * 0.4})`);
          glowGrad.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw core particle
        ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw occasional delicate faint filaments between nearby particulates (marine snow aggregates)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 65) {
            const lineAlpha = (1 - dist / 65) * 0.08 * Math.min(p.alpha, p2.alpha);
            ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (interactive && parent) {
        parent.removeEventListener('mousemove', handleMouseMove);
        parent.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [particleCount, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none z-0 ${className}`}
      style={{ opacity: 0.85 }}
    />
  );
};
