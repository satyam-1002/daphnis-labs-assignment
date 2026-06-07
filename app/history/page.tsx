"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Round } from "@/types";
import { truncateHash, getBinColor, formatCents } from "@/lib/utils";
import Link from "next/link";

export default function HistoryPage() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rounds?limit=20")
      .then(r => r.json())
      .then(d => { setRounds(d.rounds || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function downloadCSV() {
    const headers = ["id","createdAt","nonce","commitHex","serverSeed","clientSeed","combinedSeed","pegMapHash","dropColumn","binIndex","payoutMultiplier","betCents"];
    const rows = rounds.map(r => headers.map(h => (r as any)[h] ?? "").join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "plinko-rounds.csv"; a.click();
  }

  return (
    <div className="min-h-screen bg-[#080812] relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(168,85,247,0.06)_0%,_transparent_60%)] pointer-events-none" />
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              ROUND HISTORY
            </h1>
            <p className="text-gray-500 font-mono text-xs mt-1">Last 20 revealed rounds</p>
          </div>
          <div className="flex gap-3">
            <button onClick={downloadCSV} className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-mono hover:bg-green-500/20 transition">
              ↓ CSV
            </button>
            <Link href="/game" className="px-4 py-2 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-sm font-mono hover:bg-cyan-400/20 transition">
              Play →
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 font-mono py-20">Loading rounds...</div>
        ) : rounds.length === 0 ? (
          <div className="text-center text-gray-600 font-mono py-20">
            No rounds yet. <Link href="/game" className="text-cyan-400">Play a round!</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {rounds.map((round, i) => {
              const color = getBinColor(round.binIndex);
              return (
                <motion.div
                  key={round.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl bg-white/[0.03] border border-white/10 p-4 hover:border-white/20 transition"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-xs text-gray-500 font-mono truncate">{round.id}</span>
                        <span className="text-xs text-gray-600 font-mono hidden md:inline">{new Date(round.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
                        <div><span className="text-gray-500">Commit: </span><span className="text-gray-300">{truncateHash(round.commitHex, 6)}</span></div>
                        <div><span className="text-gray-500">Seed: </span><span className="text-gray-300">{round.clientSeed.slice(0, 12)}</span></div>
                        <div><span className="text-gray-500">Column: </span><span className="text-gray-300">{round.dropColumn}</span></div>
                        <div><span className="text-gray-500">Bet: </span><span className="text-gray-300">{formatCents(round.betCents)}</span></div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-display font-black" style={{ color }}>{round.payoutMultiplier}x</div>
                      <div className="text-xs text-gray-500 font-mono">Bin #{round.binIndex}</div>
                      <Link
                        href={`/verify?roundId=${round.id}&serverSeed=${round.serverSeed}&clientSeed=${round.clientSeed}&nonce=${round.nonce}&dropColumn=${round.dropColumn}`}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-mono"
                      >
                        Verify →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
