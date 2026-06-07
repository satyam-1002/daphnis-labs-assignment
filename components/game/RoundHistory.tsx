"use client";
import { useEffect, useState } from 'react';
import { Round } from '@/types';
import { truncateHash, getBinColor } from '@/lib/utils';
import Link from 'next/link';

export function RoundHistory() {
  const [rounds, setRounds] = useState<Round[]>([]);

  useEffect(() => {
    fetch('/api/rounds?limit=5').then(r => r.json()).then(d => setRounds(d.rounds || []));
  }, []);

  if (!rounds.length) return null;

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500 font-mono uppercase tracking-widest">Recent Rounds</div>
      {rounds.map(r => (
        <div key={r.id} className="flex justify-between items-center text-xs font-mono py-1 border-b border-white/5">
          <span className="text-gray-500">{truncateHash(r.commitHex, 4)}</span>
          <span style={{ color: getBinColor(r.binIndex) }}>{r.payoutMultiplier}x</span>
          <Link href={`/verify?roundId=${r.id}&serverSeed=${r.serverSeed}&clientSeed=${r.clientSeed}&nonce=${r.nonce}&dropColumn=${r.dropColumn}`} className="text-cyan-400">verify</Link>
        </div>
      ))}
    </div>
  );
}
