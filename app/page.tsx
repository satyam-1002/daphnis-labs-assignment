import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080812] flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,245,212,0.08)_0%,_transparent_60%)] pointer-events-none" />
      <div className="relative z-10 text-center max-w-2xl">
        <div className="text-7xl mb-6">🎯</div>
        <h1 className="text-6xl md:text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 mb-4 animate-pulse">
          PLINKO LAB
        </h1>
        <p className="text-gray-400 font-mono text-sm mb-2">
          Provably Fair • Seed Replayable • Independently Verifiable
        </p>
        <p className="text-gray-600 font-mono text-xs mb-10">
          Built for Daphnis Labs Full-Stack Intern Assignment
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/game"
            className="px-8 py-4 rounded-xl bg-cyan-400 text-black font-display font-bold text-lg uppercase tracking-wider hover:bg-cyan-300 shadow-[0_0_30px_#00f5d4] hover:shadow-[0_0_50px_#00f5d4] transition-all"
          >
            Play Now
          </Link>
          <Link
            href="/verify"
            className="px-8 py-4 rounded-xl bg-white/5 border border-white/20 text-white font-display font-bold text-lg uppercase tracking-wider hover:bg-white/10 transition"
          >
            Verify Round
          </Link>
          <Link
            href="/history"
            className="px-8 py-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-display font-bold text-lg uppercase tracking-wider hover:bg-purple-500/20 transition"
          >
            Round History
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-4 text-center text-xs font-mono text-gray-500">
          <div className="bg-white/3 rounded-lg p-3 border border-white/5">
            <div className="text-cyan-400 text-lg mb-1">🔒</div>
            <div>Commit-Reveal<br/>Protocol</div>
          </div>
          <div className="bg-white/3 rounded-lg p-3 border border-white/5">
            <div className="text-purple-400 text-lg mb-1">🎲</div>
            <div>xorshift32<br/>Deterministic RNG</div>
          </div>
          <div className="bg-white/3 rounded-lg p-3 border border-white/5">
            <div className="text-green-400 text-lg mb-1">✅</div>
            <div>Public<br/>Verifier</div>
          </div>
        </div>
      </div>
    </main>
  );
}
