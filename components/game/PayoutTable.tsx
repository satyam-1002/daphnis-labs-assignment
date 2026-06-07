'use client';

import { PAYOUT_TABLE } from '@/lib/engine/plinko';
import { clsx } from 'clsx';

interface PayoutTableProps {
  activeBin?: number | null;
  className?: string;
}

function getBinStyle(mult: number, isActive: boolean) {
  if (isActive) return 'bg-brand-500 text-white border-brand-400 shadow-lg shadow-brand-900/50';
  if (mult >= 10) return 'bg-gold-500/20 text-gold-400 border-gold-500/30';
  if (mult >= 5) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  if (mult >= 3) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
  if (mult >= 2) return 'bg-brand-500/15 text-brand-300 border-brand-500/20';
  if (mult >= 1.5) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  return 'bg-white/5 text-white/40 border-white/10';
}

export function PayoutTable({ activeBin, className }: PayoutTableProps) {
  const bins = Object.entries(PAYOUT_TABLE).map(([k, v]) => ({
    bin: parseInt(k),
    mult: v,
  }));

  return (
    <div className={clsx('space-y-2', className)}>
      <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider">
        Payout Table
      </h3>
      <div className="grid grid-cols-13 gap-1" style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}>
        {bins.map(({ bin, mult }) => (
          <div
            key={bin}
            className={clsx(
              'rounded-lg border text-center py-1.5 transition-all duration-200',
              getBinStyle(mult, activeBin === bin)
            )}
          >
            <div className="text-[9px] font-mono text-current/60 mb-0.5">{bin}</div>
            <div className="text-[10px] font-bold leading-tight">{mult}x</div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-white/20 text-center">
        Symmetric distribution — edges pay 10×
      </p>
    </div>
  );
}
