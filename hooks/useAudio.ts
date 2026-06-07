"use client";
import { useRef, useCallback } from "react";
import { create } from "zustand";

interface AudioStore {
  muted: boolean;
  toggleMute: () => void;
}

export const useAudioStore = create<AudioStore>((set) => ({
  muted: false,
  toggleMute: () => set((s) => ({ muted: !s.muted })),
}));

function createTone(ctx: AudioContext, freq: number, duration: number, type: OscillatorType = "sine", gain = 0.1) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gainNode.gain.setValueAtTime(gain, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function useAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const { muted } = useAudioStore();

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playPegTick = useCallback(() => {
    if (muted || typeof window === "undefined") return;
    try {
      const ctx = getCtx();
      createTone(ctx, 800 + Math.random() * 400, 0.08, "triangle", 0.05);
    } catch {}
  }, [muted, getCtx]);

  const playLanding = useCallback((multiplier: number) => {
    if (muted || typeof window === "undefined") return;
    try {
      const ctx = getCtx();
      const freqs = multiplier >= 3 ? [523, 659, 784, 1047] : [440, 554, 659];
      freqs.forEach((f, i) => {
        setTimeout(() => createTone(ctx, f, 0.3, "sine", 0.1), i * 80);
      });
    } catch {}
  }, [muted, getCtx]);

  const playDrop = useCallback(() => {
    if (muted || typeof window === "undefined") return;
    try {
      const ctx = getCtx();
      createTone(ctx, 200, 0.1, "sawtooth", 0.05);
    } catch {}
  }, [muted, getCtx]);

  return { playPegTick, playLanding, playDrop };
}
