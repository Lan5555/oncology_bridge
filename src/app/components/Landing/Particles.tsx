'use client';

import { useEffect, useRef } from 'react';

class Particle {
  x = 0;
  y = 0;
  r = 0;
  vx = 0;
  vy = 0;
  alpha = 0;
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.width;
    this.y = Math.random() * this.height;
    this.r = Math.random() * 1.5 + 0.5;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.alpha = Math.random() * 0.4 + 0.05;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > this.width || this.y < 0 || this.y > this.height) {
      this.reset();
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(14,165,233,${this.alpha})`;
    ctx.fill();
  }
}

export default function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;

    const resize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      particles.forEach((p) => {
        p.width = width;
        p.height = height;
      });
    };

    resize();
    for (let i = 0; i < 90; i++) particles.push(new Particle(width, height));

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(14,165,233,${0.08 * (1 - d / 100)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} id="particles" />;
}
