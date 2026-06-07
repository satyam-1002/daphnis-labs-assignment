"use client";
import { useGameStore } from "@/lib/store";
import { useAudioStore } from "@/hooks/useAudio";
import { PAYOUT_MULTIPLIERS, getBinColor, cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GameControlsProps {
  onDrop: () => void;
  disabled: boolean;
}

export function GameControls({ onDrop, disabled }: GameControlsProps) {
  const store = useGameStore();
  const { muted, toggleMute } = useAudioStore();

  return (
    <div className="flex flex-col gap-4">
      {/* Drop Column Selector */}
      <div>
        <label className="block text-xs text-cyan-400 font-mono mb-2 uppercase tracking-widest">
          Drop Column: {store.dropColumn}
        </label>
        <div className="flex gap-0.5 flex-wrap">
          {Array.from({ length: 13 }, (_, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => store.setDropColumn(i)}
              disabled={disabled}
              className={cn(
                "flex-1 min-w-[20px] h-8 text-xs font-mono rounded transition-all",
                store.dropColumn === i
                  ? "bg-cyan-400 text-black font-bold shadow-[0_0_10px_#00f5d4]"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
              )}
              aria-label={`Drop column ${i}`}
            >
              {i}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bet Amount */}
      <div>
        <label className="block text-xs text-cyan-400 font-mono mb-2 uppercase tracking-widest">
          Bet Amount (cents)
        </label>
        <input
          type="number"
          min={1}
          max={100000}
          value={store.betCents}
          onChange={(e) => store.setBetCents(Math.max(1, parseInt(e.target.value) || 1))}
          disabled={disabled}
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-400 transition"
        />
      </div>

      {/* Client Seed */}
      <div>
        <label className="block text-xs text-cyan-400 font-mono mb-2 uppercase tracking-widest">
          Your Seed
        </label>
        <input
          type="text"
          value={store.clientSeed}
          onChange={(e) => store.setClientSeed(e.target.value)}
          disabled={disabled}
          maxLength={256}
          placeholder="your-lucky-seed"
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-400 transition"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onDrop}
          disabled={disabled || !store.clientSeed.trim()}
          className={cn(
            "flex-1 py-3 rounded-lg font-display font-bold text-base uppercase tracking-wider transition-all",
            disabled || !store.clientSeed.trim()
              ? "bg-white/10 text-white/30 cursor-not-allowed"
              : "bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_#00f5d4] hover:shadow-[0_0_30px_#00f5d4]"
          )}
          aria-label="Drop ball (Space)"
        >
          {disabled ? "DROPPING..." : "DROP ▼"}
        </motion.button>

        <button
          onClick={toggleMute}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xl hover:bg-white/10 transition"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      {/* Payout table */}
      <div className="mt-2">
        <div className="text-xs text-gray-500 font-mono mb-1 uppercase tracking-widest">Payout Table</div>
        <div className="flex gap-0.5">
          {PAYOUT_MULTIPLIERS.map((mult, i) => (
            <div
              key={i}
              className="flex-1 text-center py-1 rounded text-xs font-mono font-bold"
              style={{
                backgroundColor: getBinColor(i) + "33",
                color: getBinColor(i),
                border: `1px solid ${getBinColor(i)}44`,
                fontSize: "9px",
              }}
            >
              {mult}x
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
