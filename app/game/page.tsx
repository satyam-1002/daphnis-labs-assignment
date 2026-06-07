"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlinkoBoard } from "@/components/game/PlinkoBoard";
import { GameControls } from "@/components/game/GameControls";
import { FairnessPanel } from "@/components/game/FairnessPanel";
import { ResultPanel } from "@/components/game/ResultPanel";
import { Confetti } from "@/components/game/Confetti";
import { useGame } from "@/hooks/useGame";
import { useGameStore } from "@/lib/store";
import { useAudio } from "@/hooks/useAudio";
import { cn } from "@/lib/utils";

// Easter egg: secret konami code detection for dungeon mode
const SECRET_SEQUENCE = "open sesame";

export default function GamePage() {
  const store = useGameStore();
  const { startRound, revealAndFinish, resetGame } = useGame();
  const { playLanding, playDrop } = useAudio();
  const [animating, setAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const typedRef = useRef("");
  const reducedMotion = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  const handleDrop = useCallback(async () => {
    if (animating || store.phase !== "idle") return;
    playDrop();
    await startRound();
    setAnimating(true);
  }, [animating, store.phase, startRound, playDrop]);

  const handleAnimationComplete = useCallback(async () => {
    await revealAndFinish();
    setAnimating(false);
    if (store.result) {
      playLanding(store.result.payoutMultiplier);
      if (store.result.payoutMultiplier >= 3) setShowConfetti(true);
    }
  }, [revealAndFinish, store.result, playLanding]);

  const handleReset = useCallback(() => {
    setShowConfetti(false);
    resetGame();
    setAnimating(false);
  }, [resetGame]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Easter eggs
      typedRef.current += e.key.toLowerCase();
      if (typedRef.current.length > SECRET_SEQUENCE.length) {
        typedRef.current = typedRef.current.slice(-SECRET_SEQUENCE.length);
      }
      if (typedRef.current === SECRET_SEQUENCE) {
        store.toggleDungeon();
        typedRef.current = "";
      }

      if (e.key === "t" || e.key === "T") store.toggleTilt();
      if (e.key === "g" || e.key === "G") setDebugMode(d => !d);

      if (!animating) {
        if (e.key === "ArrowLeft") store.setDropColumn(Math.max(0, store.dropColumn - 1));
        if (e.key === "ArrowRight") store.setDropColumn(Math.min(12, store.dropColumn + 1));
        if (e.key === " ") { e.preventDefault(); handleDrop(); }
        if (e.key === "r" || e.key === "R") handleReset();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [animating, store, handleDrop, handleReset]);

  useEffect(() => {
    if (showConfetti) {
      const t = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showConfetti]);

  const tiltStyle = store.isTiltMode
    ? { transform: `rotate(${Math.sin(Date.now() / 500) * 5}deg)`, filter: "sepia(0.5) contrast(1.2)" }
    : {};

  const dungeonClass = store.isDungeonTheme
    ? "bg-[#1a0a00] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,_rgba(255,140,0,0.1)_0%,_transparent_60%)]"
    : "";

  return (
    <main
      className={cn(
        "min-h-screen relative overflow-hidden",
        store.isDungeonTheme ? "bg-[#1a0a00]" : "bg-dark-900"
      )}
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,245,212,0.08)_0%,_transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(168,85,247,0.06)_0%,_transparent_60%)] pointer-events-none" />

      {/* Dungeon torchlight */}
      {store.isDungeonTheme && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-0 right-1/4 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.7s" }} />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className={cn(
            "text-4xl md:text-5xl font-display font-black tracking-tight",
            store.isDungeonTheme ? "text-orange-400" : "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400"
          )}>
            {store.isDungeonTheme ? "⚔️ DUNGEON PLINKO" : "PLINKO LAB"}
          </h1>
          <p className="text-gray-500 font-mono text-xs mt-1 uppercase tracking-widest">
            Provably Fair • Seed Replayable • Verifiable
          </p>
          {store.isTiltMode && (
            <div className="text-yellow-400 text-xs font-mono mt-1 animate-pulse">
              🕹️ TILT MODE ACTIVE — Press T to deactivate
            </div>
          )}
        </motion.div>

        {/* Keyboard hint */}
        <div className="text-center text-xs text-gray-600 font-mono mb-4">
          ← → to select column • Space to drop • R to reset • T for tilt • G for debug
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Board area */}
          <motion.div
            className="relative"
            animate={store.isTiltMode ? {
              rotate: [0, 3, -3, 2, -2, 0],
              transition: { duration: 2, repeat: Infinity }
            } : { rotate: 0 }}
          >
            <div
              className={cn(
                "relative rounded-2xl overflow-hidden border border-white/10",
                store.isDungeonTheme ? "bg-[#2a1505]/80 border-orange-900/30" : "bg-white/3 backdrop-blur"
              )}
              style={{ height: "min(70vh, 600px)" }}
            >
              <PlinkoBoard
                path={store.result?.path}
                isAnimating={animating}
                dropColumn={store.dropColumn}
                isGoldenBall={store.isGoldenBall}
                reducedMotion={reducedMotion}
                onAnimationComplete={handleAnimationComplete}
              />

              {/* Confetti overlay */}
              {showConfetti && store.result && (
                <Confetti active={showConfetti} multiplier={store.result.payoutMultiplier} />
              )}

              {/* Debug overlay */}
              {debugMode && store.result && (
                <div className="absolute top-2 left-2 bg-black/80 rounded p-2 text-xs font-mono text-green-400 max-w-[200px]">
                  <div className="text-yellow-400 mb-1">DEBUG MODE</div>
                  <div>Bin: {store.result.binIndex}</div>
                  <div>Path: {store.result.path.map(p => p.direction).join("")}</div>
                  <div>PegMapHash: {store.result.path[0]?.rnd.toFixed(4)}</div>
                </div>
              )}

              {/* Drop column indicator */}
              <div
                className="absolute top-2 h-1 w-0.5 bg-cyan-400/60 rounded"
                style={{
                  left: `calc(${(store.dropColumn / 12) * 100}% )`,
                  transition: "left 0.15s ease",
                }}
              />
            </div>

            {/* Result */}
            <div className="mt-4">
              <AnimatePresence>
                {store.phase === "landed" && <ResultPanel />}
              </AnimatePresence>
            </div>

            {/* Action buttons below board */}
            {store.phase === "landed" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 flex gap-3"
              >
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-mono hover:bg-purple-500/30 transition"
                >
                  Play Again
                </button>
                {store.roundId && store.serverSeed && (
                  <a
                    href={`/verify?roundId=${store.roundId}&serverSeed=${store.serverSeed}&clientSeed=${store.clientSeed}&nonce=${store.nonce}&dropColumn=${store.dropColumn}`}
                    target="_blank"
                    className="flex-1 py-2 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-sm font-mono text-center hover:bg-cyan-400/20 transition"
                  >
                    Verify →
                  </a>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <GameControls
              onDrop={handleDrop}
              disabled={animating || store.phase !== "idle"}
            />

            <FairnessPanel />

            {/* Error display */}
            {store.error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-sm font-mono">
                ⚠ {store.error}
                <button onClick={() => store.setError(undefined)} className="ml-2 text-red-300 hover:text-red-100">×</button>
              </div>
            )}

            {/* History link */}
            <a
              href="/history"
              className="text-center text-xs text-gray-500 hover:text-gray-300 font-mono transition py-2 rounded border border-white/5 hover:border-white/10"
            >
              View Round History →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
