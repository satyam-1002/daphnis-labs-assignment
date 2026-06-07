"use client";
import { useCallback } from "react";
import { useGameStore } from "@/lib/store";
import type { CommitResponse, StartResponse, RevealResponse } from "@/types";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function useGame() {
  const store = useGameStore();

  const startRound = useCallback(async () => {
    if (store.phase !== "idle") return;
    store.setPhase("committing");
    store.setError(undefined);

    try {
      // 1. Get commitment from server
      const commit = await apiFetch<CommitResponse>("/api/rounds/commit", { method: "POST" });
      store.setRoundId(commit.roundId);
      store.setCommit(commit.commitHex, commit.nonce, commit.serverSeedHash);
      store.setPhase("waiting_client");

      // 2. Immediately start with current client seed + bet + drop
      store.setPhase("dropping");
      const result = await apiFetch<StartResponse>(`/api/rounds/${commit.roundId}/start`, {
        method: "POST",
        body: JSON.stringify({
          clientSeed: store.clientSeed,
          betCents: store.betCents,
          dropColumn: store.dropColumn,
        }),
      });

      store.setResult(result);
      store.setPhase("dropping");

      // 3. Reveal serverSeed after animation (caller triggers this)
    } catch (error: any) {
      store.setError(error.message);
      store.setPhase("idle");
    }
  }, [store]);

  const revealAndFinish = useCallback(async () => {
    if (!store.roundId) return;
    try {
      const rev = await apiFetch<RevealResponse>(`/api/rounds/${store.roundId}/reveal`, { method: "POST" });
      store.setServerSeed(rev.serverSeed);
      store.setPhase("landed");
      if (store.result) store.recordLanding(store.result.binIndex);
    } catch (error: any) {
      store.setError(error.message);
    }
  }, [store]);

  const resetGame = useCallback(() => {
    store.reset();
  }, [store]);

  return { startRound, revealAndFinish, resetGame };
}
