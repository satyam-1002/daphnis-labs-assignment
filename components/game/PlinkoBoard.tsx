"use client";
import { useRef, useEffect, useCallback } from "react";
import { PathDecision } from "@/types";
import { PAYOUT_MULTIPLIERS, getBinColor } from "@/lib/utils";
import { useAudio } from "@/hooks/useAudio";

const ROWS = 12;
const BINS = 13;
const PEG_RADIUS = 5;
const BALL_RADIUS = 7;
const GOLDEN_RADIUS = 9;

interface PlinkoBoardProps {
  path?: PathDecision[];
  isAnimating: boolean;
  dropColumn: number;
  isGoldenBall: boolean;
  reducedMotion?: boolean;
  onAnimationComplete?: () => void;
  onHoverBin?: (bin: number | null) => void;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function PlinkoBoard({
  path,
  isAnimating,
  dropColumn,
  isGoldenBall,
  reducedMotion,
  onAnimationComplete,
}: PlinkoBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const { playPegTick, playLanding } = useAudio();

  const getLayout = useCallback((w: number, h: number) => {
    const padX = 40;
    const padTop = 60;
    const padBot = 80;
    const boardW = w - padX * 2;
    const boardH = h - padTop - padBot;
    const rowSpacing = boardH / (ROWS + 1);
    const colSpacing = boardW / (BINS - 1);
    return { padX, padTop, padBot, boardW, boardH, rowSpacing, colSpacing };
  }, []);

  const getPegPos = useCallback((r: number, p: number, layout: ReturnType<typeof getLayout>, w: number) => {
    const { padX, padTop, rowSpacing, colSpacing } = layout;
    const rowWidth = (r + 1) * colSpacing;
    const startX = w / 2 - rowWidth / 2 + colSpacing / 2;
    return {
      x: startX + p * colSpacing,
      y: padTop + (r + 1) * rowSpacing,
    };
  }, []);

  const getBinPos = useCallback((bin: number, layout: ReturnType<typeof getLayout>, w: number, h: number) => {
    const { padX, padTop, padBot, colSpacing } = layout;
    return {
      x: padX + bin * colSpacing,
      y: h - padBot / 2,
    };
  }, []);

  const drawBoard = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, highlightBin?: number) => {
    const layout = getLayout(w, h);
    ctx.clearRect(0, 0, w, h);

    // Background grid lines (subtle)
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, layout.padTop + (r + 1) * layout.rowSpacing);
      ctx.lineTo(w, layout.padTop + (r + 1) * layout.rowSpacing);
      ctx.stroke();
    }

    // Draw pegs
    for (let r = 0; r < ROWS; r++) {
      for (let p = 0; p <= r; p++) {
        const pos = getPegPos(r, p, layout, w);
        const grad = ctx.createRadialGradient(pos.x - 1, pos.y - 1, 0, pos.x, pos.y, PEG_RADIUS);
        grad.addColorStop(0, "#a0e4ff");
        grad.addColorStop(1, "#2563eb");
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, PEG_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = "rgba(0,245,212,0.3)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    // Draw bins
    for (let b = 0; b < BINS; b++) {
      const bpos = getBinPos(b, layout, w, h);
      const color = getBinColor(b);
      const isHL = b === highlightBin;
      const mult = PAYOUT_MULTIPLIERS[b];

      // Bin wall
      ctx.fillStyle = isHL ? color + "cc" : color + "44";
      ctx.strokeStyle = color;
      ctx.lineWidth = isHL ? 2 : 1;
      const bw = layout.colSpacing * 0.8;
      const bh = layout.padBot * 0.55;
      ctx.beginPath();
      ctx.roundRect(bpos.x - bw / 2, bpos.y - bh / 2, bw, bh, 4);
      ctx.fill();
      ctx.stroke();

      // Multiplier label
      ctx.fillStyle = isHL ? "#fff" : color;
      ctx.font = `bold ${isHL ? 12 : 10}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${mult}x`, bpos.x, bpos.y);
    }
  }, [getLayout, getPegPos, getBinPos]);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    if (!isAnimating || !path) {
      drawBoard(ctx, W, H);
      return;
    }

    const layout = getLayout(W, H);
    const totalSteps = path.length;
    const STEP_DURATION = reducedMotion ? 0 : 180; // ms per row
    let startTime: number | null = null;
    let lastPegRow = -1;

    // Precompute ball positions at each step
    const ballPositions: { x: number; y: number }[] = [];

    // Starting position: at drop column
    const startX = layout.padX + dropColumn * layout.colSpacing;
    ballPositions.push({ x: startX, y: layout.padTop });

    // After each row decision
    let pos = 0;
    for (let r = 0; r < totalSteps; r++) {
      const dec = path[r];
      const nextPos = dec.pos;
      const pegPos = getPegPos(r, dec.pegIndex, layout, W);
      // Ball moves to peg, then slightly left or right
      const nextRowPegs = r + 1 < ROWS ? r + 2 : r + 1;
      const nextPegIdx = Math.min(nextPos, r + 1);
      const nextY = r + 1 < ROWS
        ? getPegPos(r + 1, nextPegIdx, layout, W).y
        : layout.padTop + (r + 2) * layout.rowSpacing;
      ballPositions.push({ x: pegPos.x + (dec.direction === "R" ? 12 : -12), y: (pegPos.y + nextY) / 2 });
      pos = nextPos;
    }

    // Final: bin center
    const finalBin = path[path.length - 1].pos;
    ballPositions.push(getBinPos(finalBin, layout, W, H));

    const totalDuration = reducedMotion ? 0 : STEP_DURATION * (totalSteps + 1);

    function animate(ts: number) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;

      if (reducedMotion) {
        // Instant: just draw final state
        drawBoard(ctx!, W, H, finalBin);
        const bp = ballPositions[ballPositions.length - 1];
        drawBall(ctx!, bp.x, bp.y, isGoldenBall);
        onAnimationComplete?.();
        return;
      }

      const progress = Math.min(elapsed / totalDuration, 1);
      const stepF = progress * (ballPositions.length - 1);
      const stepIdx = Math.floor(stepF);
      const stepT = stepF - stepIdx;

      const from = ballPositions[Math.min(stepIdx, ballPositions.length - 1)];
      const to = ballPositions[Math.min(stepIdx + 1, ballPositions.length - 1)];

      const bx = lerp(from.x, to.x, stepT);
      const by = lerp(from.y, to.y, stepT);

      // Play peg tick when passing a row
      const currentRow = Math.floor(progress * ROWS);
      if (currentRow > lastPegRow && currentRow < ROWS) {
        lastPegRow = currentRow;
        playPegTick();
      }

      const currentHighlight = progress >= 1 ? finalBin : undefined;
      drawBoard(ctx!, W, H, currentHighlight);
      drawBall(ctx!, bx, by, isGoldenBall);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        drawBoard(ctx!, W, H, finalBin);
        drawBall(ctx!, ballPositions[ballPositions.length - 1].x, ballPositions[ballPositions.length - 1].y, isGoldenBall);
        onAnimationComplete?.();
      }
    }

    function drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, golden: boolean) {
      const r = golden ? GOLDEN_RADIUS : BALL_RADIUS;
      if (golden) {
        // Golden glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
        glow.addColorStop(0, "rgba(255,215,0,0.6)");
        glow.addColorStop(1, "rgba(255,215,0,0)");
        ctx.beginPath();
        ctx.arc(x, y, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      const grad = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, r);
      if (golden) {
        grad.addColorStop(0, "#fffde0");
        grad.addColorStop(0.5, "#ffd700");
        grad.addColorStop(1, "#b8860b");
      } else {
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.4, "#00f5d4");
        grad.addColorStop(1, "#0369a1");
      }
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = golden ? "#ffd700" : "rgba(255,255,255,0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    if (reducedMotion) {
      animate(0);
    } else {
      animRef.current = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(animRef.current);
  }, [isAnimating, path, dropColumn, isGoldenBall, reducedMotion, drawBoard, getLayout, getPegPos, getBinPos, playPegTick, onAnimationComplete]);

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      drawBoard(ctx, rect.width, rect.height);
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [drawBoard]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
      aria-label="Plinko game board"
      role="img"
    />
  );
}
