"use client";
import { useEffect, useRef } from "react";

interface ConfettiProps {
  active: boolean;
  multiplier: number;
}

const COLORS = ["#ffd700", "#00f5d4", "#f97316", "#a855f7", "#ef4444", "#22c55e", "#3b82f6"];

export function Confetti({ active, multiplier }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const count = Math.min(Math.floor(multiplier * 15), 100);
    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      color: string; size: number; life: number; maxLife: number; rotation: number; rotV: number;
    }> = [];

    for (let i = 0; i < count; i++) {
      const maxLife = 80 + Math.random() * 60;
      particles.push({
        x: canvas.width * 0.3 + Math.random() * canvas.width * 0.4,
        y: canvas.height * 0.5,
        vx: (Math.random() - 0.5) * 8,
        vy: -(Math.random() * 8 + 4),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 4 + Math.random() * 6,
        life: 0,
        maxLife,
        rotation: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.3,
      });
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      let alive = false;
      for (const p of particles) {
        p.life++;
        if (p.life > p.maxLife) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.rotation += p.rotV;
        const alpha = 1 - p.life / p.maxLife;
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rotation);
        ctx!.globalAlpha = alpha;
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx!.restore();
      }
      if (alive) animRef.current = requestAnimationFrame(draw);
      else ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [active, multiplier]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
