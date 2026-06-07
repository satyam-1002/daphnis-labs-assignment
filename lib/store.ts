import { create } from "zustand";
import { GameState, GamePhase, StartResponse } from "@/types";

interface GameStore extends GameState {
  setPhase: (phase: GamePhase) => void;
  setRoundId: (id: string) => void;
  setCommit: (commitHex: string, nonce: string, serverSeedHash: string) => void;
  setClientSeed: (seed: string) => void;
  setDropColumn: (col: number) => void;
  setBetCents: (cents: number) => void;
  setResult: (result: StartResponse) => void;
  setServerSeed: (seed: string) => void;
  setError: (err: string | undefined) => void;
  recordLanding: (binIndex: number) => void;
  toggleTilt: () => void;
  toggleDungeon: () => void;
  reset: () => void;
}

const initialState: GameState = {
  phase: "idle",
  clientSeed: `player-${Math.random().toString(36).slice(2, 10)}`,
  dropColumn: 6,
  betCents: 100,
  lastThreeBins: [],
  isGoldenBall: false,
  isTiltMode: false,
  isDungeonTheme: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),
  setRoundId: (roundId) => set({ roundId }),
  setCommit: (commitHex, nonce, serverSeedHash) => set({ commitHex, nonce, serverSeedHash }),
  setClientSeed: (clientSeed) => set({ clientSeed }),
  setDropColumn: (dropColumn) => set({ dropColumn }),
  setBetCents: (betCents) => set({ betCents }),
  setResult: (result) => set({ result }),
  setServerSeed: (serverSeed) => set({ serverSeed }),
  setError: (error) => set({ error }),

  recordLanding: (binIndex) => {
    const prev = get().lastThreeBins;
    const next = [...prev, binIndex].slice(-3);
    const isGolden = next.length === 3 && next.every((b) => b === 6);
    set({ lastThreeBins: next, isGoldenBall: isGolden });
  },

  toggleTilt: () => set((s) => ({ isTiltMode: !s.isTiltMode })),
  toggleDungeon: () => set((s) => ({ isDungeonTheme: !s.isDungeonTheme })),

  reset: () =>
    set({
      phase: "idle",
      roundId: undefined,
      commitHex: undefined,
      nonce: undefined,
      serverSeedHash: undefined,
      result: undefined,
      serverSeed: undefined,
      error: undefined,
      clientSeed: `player-${Math.random().toString(36).slice(2, 10)}`,
    }),
}));
