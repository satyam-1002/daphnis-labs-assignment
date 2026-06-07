// Game API client functions
import type { CommitResponse, StartResponse, RevealResponse } from '@/types';

export async function commitRound(): Promise<CommitResponse> {
  const res = await fetch('/api/rounds/commit', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function startRound(roundId: string, body: { clientSeed: string; betCents: number; dropColumn: number }): Promise<StartResponse> {
  const res = await fetch(`/api/rounds/${roundId}/start`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function revealRound(roundId: string): Promise<RevealResponse> {
  const res = await fetch(`/api/rounds/${roundId}/reveal`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}
