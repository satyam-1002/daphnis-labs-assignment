"use client";
import { useGameStore } from "@/lib/store";
import { truncateHash, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-2 text-xs px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 transition font-mono"
      aria-label="Copy to clipboard"
    >
      {copied ? "✓" : "⧉"}
    </button>
  );
}

function HashRow({ label, value, revealed }: { label: string; value?: string; revealed?: boolean }) {
  if (!value) return (
    <div className="flex justify-between items-center py-1.5 border-b border-white/5">
      <span className="text-xs text-gray-500 font-mono">{label}</span>
      <span className="text-xs text-gray-600 font-mono">—</span>
    </div>
  );
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-white/5 gap-2">
      <span className="text-xs text-gray-400 font-mono shrink-0">{label}</span>
      <div className="flex items-center">
        <span className={cn("text-xs font-mono truncate max-w-[120px]", revealed ? "text-green-400" : "text-cyan-300")}>
          {truncateHash(value)}
        </span>
        <CopyButton text={value} />
      </div>
    </div>
  );
}

export function FairnessPanel() {
  const store = useGameStore();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-white/10 bg-white/3 backdrop-blur p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex justify-between items-center text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 text-sm">🔒</span>
          <span className="text-sm font-display font-bold text-white uppercase tracking-wider">Provably Fair</span>
        </div>
        <span className="text-gray-400 text-xs">{expanded ? "▲" : "▼"}</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <HashRow label="Commit (SHA256)" value={store.commitHex} />
            <HashRow label="Nonce" value={store.nonce} />
            <HashRow label="Server Seed Hash" value={store.serverSeedHash} />
            <HashRow label="Combined Seed" value={store.result?.roundId ? store.clientSeed : undefined} />
            <HashRow label="Peg Map Hash" value={store.result ? "see result" : undefined} />
            <HashRow label="Server Seed" value={store.serverSeed} revealed />

            {store.phase === "landed" && store.roundId && (
              <div className="mt-3">
                <a
                  href={`/verify?roundId=${store.roundId}&serverSeed=${store.serverSeed}&clientSeed=${store.clientSeed}&nonce=${store.nonce}&dropColumn=${store.dropColumn}`}
                  target="_blank"
                  className="block text-center text-xs py-2 rounded bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20 transition font-mono"
                >
                  Verify this round →
                </a>
              </div>
            )}

            <div className="mt-3 text-xs text-gray-500 font-mono leading-relaxed">
              commitHex = SHA256(serverSeed:nonce)<br/>
              combinedSeed = SHA256(serverSeed:clientSeed:nonce)
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
