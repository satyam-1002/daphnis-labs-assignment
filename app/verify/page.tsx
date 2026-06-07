"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { VerifyResult, PathDecision } from "@/types";
import { cn } from "@/lib/utils";

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-2 px-2 py-0.5 text-xs rounded bg-white/10 hover:bg-white/20 font-mono transition"
    >
      {copied ? "✓ Copied" : "⧉ Copy"}
    </button>
  );
}

function HashRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("rounded-lg p-3 mb-2", highlight ? "bg-cyan-400/10 border border-cyan-400/20" : "bg-white/3 border border-white/5")}>
      <div className="text-xs text-gray-400 font-mono mb-1">{label}</div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono text-white break-all">{value}</span>
        <CopyBtn text={value} />
      </div>
    </div>
  );
}

function PathReplay({ path }: { path: PathDecision[] }) {
  return (
    <div className="mt-4">
      <div className="text-xs text-gray-400 font-mono mb-2 uppercase tracking-widest">Ball Path</div>
      <div className="flex flex-wrap gap-1">
        {path.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className={cn(
              "w-8 h-8 rounded flex items-center justify-center text-xs font-bold font-mono border",
              step.direction === "L"
                ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                : "bg-orange-500/20 border-orange-500/40 text-orange-300"
            )}
            title={`Row ${step.row}: rnd=${step.rnd.toFixed(4)}, bias=${step.adjustedBias}`}
          >
            {step.direction}
          </motion.div>
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-500 font-mono">
        Hover each step to see rnd value and bias
      </div>
    </div>
  );
}

function VerifyForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    serverSeed: searchParams.get("serverSeed") || "",
    clientSeed: searchParams.get("clientSeed") || "",
    nonce: searchParams.get("nonce") || "",
    dropColumn: searchParams.get("dropColumn") || "6",
    roundId: searchParams.get("roundId") || "",
  });
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRun, setAutoRun] = useState(false);

  useEffect(() => {
    if (searchParams.get("serverSeed") && !autoRun) {
      setAutoRun(true);
      handleVerify();
    }
  }, []);

  async function handleVerify() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        serverSeed: form.serverSeed,
        clientSeed: form.clientSeed,
        nonce: form.nonce,
        dropColumn: form.dropColumn,
        ...(form.roundId ? { roundId: form.roundId } : {}),
      });
      const res = await fetch(`/api/verify?${params}`);
      if (!res.ok) throw new Error((await res.json()).error || "Verification failed");
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-400 transition";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
            ROUND VERIFIER
          </h1>
          <p className="text-gray-400 font-mono text-sm">
            Independently verify any Plinko round outcome
          </p>
        </div>

        {/* How it works */}
        <div className="mb-8 rounded-xl bg-white/3 border border-white/10 p-5">
          <div className="text-xs text-cyan-400 font-mono uppercase tracking-widest mb-3">How Provably Fair Works</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono text-gray-400">
            <div className="bg-white/3 rounded p-3">
              <div className="text-purple-400 font-bold mb-1">1. Before Round</div>
              <div>Server commits: SHA256(serverSeed:nonce) — you see the commitment, not the seed</div>
            </div>
            <div className="bg-white/3 rounded p-3">
              <div className="text-cyan-400 font-bold mb-1">2. You Play</div>
              <div>You provide clientSeed — server can't change outcome as it was already committed</div>
            </div>
            <div className="bg-white/3 rounded p-3">
              <div className="text-green-400 font-bold mb-1">3. After Round</div>
              <div>Server reveals serverSeed — you verify SHA256(serverSeed:clientSeed:nonce) → same result</div>
            </div>
          </div>
        </div>

        {/* Input form */}
        <div className="rounded-xl bg-white/3 border border-white/10 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-400 font-mono block mb-1 uppercase tracking-wider">Server Seed (revealed)</label>
              <input className={inputClass} value={form.serverSeed} onChange={e => setForm(f => ({ ...f, serverSeed: e.target.value }))} placeholder="hex string..." />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-mono block mb-1 uppercase tracking-wider">Client Seed</label>
              <input className={inputClass} value={form.clientSeed} onChange={e => setForm(f => ({ ...f, clientSeed: e.target.value }))} placeholder="your seed..." />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-mono block mb-1 uppercase tracking-wider">Nonce</label>
              <input className={inputClass} value={form.nonce} onChange={e => setForm(f => ({ ...f, nonce: e.target.value }))} placeholder="number..." />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-mono block mb-1 uppercase tracking-wider">Drop Column (0-12)</label>
              <input className={inputClass} type="number" min={0} max={12} value={form.dropColumn} onChange={e => setForm(f => ({ ...f, dropColumn: e.target.value }))} />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs text-gray-400 font-mono block mb-1 uppercase tracking-wider">Round ID (optional — to check vs stored)</label>
            <input className={inputClass} value={form.roundId} onChange={e => setForm(f => ({ ...f, roundId: e.target.value }))} placeholder="cuid..." />
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || !form.serverSeed || !form.clientSeed || !form.nonce}
            className={cn(
              "w-full py-3 rounded-lg font-display font-bold uppercase tracking-wider transition",
              loading ? "bg-white/10 text-white/30 cursor-not-allowed" :
              "bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_#00f5d4]"
            )}
          >
            {loading ? "Verifying..." : "Verify Round"}
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-red-400 font-mono text-sm mb-6">
            ⚠ {error}
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-white/3 border border-white/10 p-6"
            >
              {/* Match indicator */}
              {result.storedRound && (
                <div className={cn(
                  "rounded-lg p-4 mb-5 text-center font-display text-xl font-bold",
                  result.matches
                    ? "bg-green-500/20 border border-green-500/30 text-green-300"
                    : "bg-red-500/20 border border-red-500/30 text-red-300"
                )}>
                  {result.matches ? "✅ VERIFIED — Round outcome matches!" : "❌ MISMATCH — Verification failed!"}
                </div>
              )}

              <div className="text-xs text-cyan-400 font-mono uppercase tracking-widest mb-3">Computed Values</div>
              <HashRow label="Commit Hash (SHA256(serverSeed:nonce))" value={result.commitHex} />
              <HashRow label="Combined Seed (SHA256(serverSeed:clientSeed:nonce))" value={result.combinedSeed} highlight />
              <HashRow label="Peg Map Hash" value={result.pegMapHash} />

              <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-3xl font-display font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-1">
                  Bin #{result.binIndex}
                </div>
                <div className="text-center text-xs text-gray-400 font-mono">Final Landing Position</div>
              </div>

              {result.storedRound && (
                <div className="mt-4">
                  <div className="text-xs text-gray-400 font-mono uppercase tracking-widest mb-2">Stored Round Values</div>
                  <HashRow label="Stored Commit Hash" value={result.storedRound.commitHex} />
                  <HashRow label="Stored Peg Map Hash" value={result.storedRound.pegMapHash} />
                  <div className="text-sm font-mono text-gray-400 mt-2">
                    Stored Bin: <span className="text-white">{result.storedRound.binIndex}</span>
                    {" "}
                    {result.storedRound.binIndex === result.binIndex
                      ? <span className="text-green-400">✓ match</span>
                      : <span className="text-red-400">✗ mismatch</span>}
                  </div>
                </div>
              )}

              <PathReplay path={result.path} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Test vector */}
        <div className="mt-8 rounded-xl bg-white/3 border border-white/10 p-5">
          <div className="text-xs text-yellow-400 font-mono uppercase tracking-widest mb-3">Test Vectors (from assignment)</div>
          <pre className="text-xs font-mono text-gray-400 overflow-auto">
{`serverSeed = "b2a5f3f32a4d9c6ee7a8c1d33456677890abcdeffedcba0987654321ffeeddcc"
nonce      = "42"
clientSeed = "candidate-hello"
dropColumn = 6

commitHex    = bb9acdc67f3f18f3345236a01f0e5072596657a9005c7d8a22cff061451a6b34
combinedSeed = e1dddf77de27d395ea2be2ed49aa2a59bd6bf12ee8d350c16c008abd406c07e0
binIndex     = 6`}
          </pre>
          <button
            onClick={() => {
              setForm({
                serverSeed: "b2a5f3f32a4d9c6ee7a8c1d33456677890abcdeffedcba0987654321ffeeddcc",
                clientSeed: "candidate-hello",
                nonce: "42",
                dropColumn: "6",
                roundId: "",
              });
            }}
            className="mt-3 text-xs px-3 py-1.5 rounded bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20 font-mono transition"
          >
            Load Test Vectors
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,245,212,0.06)_0%,_transparent_60%)] pointer-events-none" />
      <div className="relative z-10">
        <Suspense fallback={<div className="text-center text-gray-400 pt-20 font-mono">Loading...</div>}>
          <VerifyForm />
        </Suspense>
      </div>
    </div>
  );
}
