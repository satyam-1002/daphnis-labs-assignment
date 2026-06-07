export interface CommitResponse {
  roundId: string;
  commitHex: string;
  nonce: string;
  serverSeedHash: string;
}

export interface StartResponse {
  roundId: string;
  pegMapHash: string;
  rows: number;
  binIndex: number;
  payoutMultiplier: number;
  path: PathDecision[];
}

export interface PathDecision {
  row: number;
  pegIndex: number;
  leftBias: number;
  adjustedBias: number;
  rnd: number;
  direction: "L" | "R";
  pos: number;
}

export interface RevealResponse {
  serverSeed: string;
}

export interface Round {
  id: string;
  createdAt: string;
  status: "CREATED" | "STARTED" | "REVEALED";
  nonce: string;
  commitHex: string;
  serverSeed?: string;
  serverSeedHash: string;
  clientSeed: string;
  combinedSeed: string;
  pegMapHash: string;
  rows: number;
  dropColumn: number;
  binIndex: number;
  payoutMultiplier: number;
  betCents: number;
  pathJson: PathDecision[];
  revealedAt?: string;
}

export interface VerifyResult {
  commitHex: string;
  combinedSeed: string;
  pegMapHash: string;
  binIndex: number;
  path: PathDecision[];
  storedRound?: {
    id: string;
    commitHex: string;
    pegMapHash: string;
    binIndex: number;
  } | null;
  matches: boolean;
}

export type GamePhase = "idle" | "committing" | "waiting_client" | "dropping" | "landed" | "revealing";

export interface GameState {
  phase: GamePhase;
  roundId?: string;
  commitHex?: string;
  nonce?: string;
  serverSeedHash?: string;
  clientSeed: string;
  dropColumn: number;
  betCents: number;
  result?: StartResponse;
  serverSeed?: string;
  error?: string;
  lastThreeBins: number[];
  isGoldenBall: boolean;
  isTiltMode: boolean;
  isDungeonTheme: boolean;
}
