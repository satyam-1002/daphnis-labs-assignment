"use client";
import { useGameStore } from "@/lib/store";
import { getBinColor, PAYOUT_MULTIPLIERS } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function ResultPanel() {
  const store = useGameStore();

  if (store.phase !== "landed" || !store.result) return null;

  const { binIndex, payoutMultiplier } = store.result;
  const color = getBinColor(binIndex);
  const payout = (store.betCents * payoutMultiplier / 100).toFixed(2);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="rounded-xl border-2 p-6 text-center backdrop-blur"
        style={{ borderColor: color, backgroundColor: color + "11" }}
      >
        <div className="text-5xl font-display font-black mb-2" style={{ color }}>
          {payoutMultiplier}x
        </div>
        <div className="text-gray-300 font-mono text-sm mb-1">
          Bin #{binIndex} • Payout: ${payout}
        </div>
        {store.isGoldenBall && (
          <div className="text-yellow-400 text-xs font-mono mt-2 animate-pulse">
            ✨ GOLDEN BALL — Three center landings!
          </div>
        )}
        <div className="text-xs text-gray-500 font-mono mt-3">
          Path: {store.result.path.map(p => p.direction).join(" → ")}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
