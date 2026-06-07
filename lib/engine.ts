import { createHash } from "crypto";
import { createPRNG, Xorshift32 } from "./prng";

export const ROWS = 12;
export const BINS = ROWS + 1; // 13 bins (0..12)

export interface PegBias {
  leftBias: number;
}

export type PegMap = PegBias[][];

export interface PathDecision {
  row: number;
  pegIndex: number;
  leftBias: number;
  adjustedBias: number;
  rnd: number;
  direction: "L" | "R";
  pos: number; // pos after this row
}

export interface EngineResult {
  pegMap: PegMap;
  pegMapHash: string;
  path: PathDecision[];
  binIndex: number;
}

/** Generate peg map using PRNG. Returns rows[r] with r+1 pegs each. */
function generatePegMap(prng: Xorshift32): PegMap {
  const pegMap: PegMap = [];
  for (let r = 0; r < ROWS; r++) {
    const row: PegBias[] = [];
    for (let p = 0; p <= r; p++) {
      const raw = 0.5 + (prng.rand() - 0.5) * 0.2;
      const leftBias = parseFloat(raw.toFixed(6));
      row.push({ leftBias });
    }
    pegMap.push(row);
  }
  return pegMap;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Run the deterministic Plinko engine */
export function runEngine(combinedSeed: string, dropColumn: number): EngineResult {
  const prng = createPRNG(combinedSeed);

  // Step 1: Generate peg map (consumes PRNG for all peg biases)
  const pegMap = generatePegMap(prng);

  // Step 2: Hash peg map for verification
  const pegMapHash = createHash("sha256")
    .update(JSON.stringify(pegMap))
    .digest("hex");

  // Step 3: Compute drop column adjustment
  const adj = (dropColumn - Math.floor(ROWS / 2)) * 0.01;

  // Step 4: Simulate ball path
  const path: PathDecision[] = [];
  let pos = 0; // number of Right moves so far

  for (let r = 0; r < ROWS; r++) {
    const pegIndex = Math.min(pos, r);
    const leftBias = pegMap[r][pegIndex].leftBias;
    const adjustedBias = clamp(leftBias + adj, 0, 1);
    const rnd = prng.rand();
    const direction: "L" | "R" = rnd < adjustedBias ? "L" : "R";
    if (direction === "R") pos += 1;

    path.push({
      row: r,
      pegIndex,
      leftBias,
      adjustedBias: parseFloat(adjustedBias.toFixed(6)),
      rnd: parseFloat(rnd.toFixed(10)),
      direction,
      pos,
    });
  }

  return { pegMap, pegMapHash, path, binIndex: pos };
}

/** Payout multipliers for bins 0..12 (symmetric, edges high) */
export const PAYOUT_MULTIPLIERS: number[] = [
  10, 3, 1.5, 1, 0.5, 0.3, 0.2, 0.3, 0.5, 1, 1.5, 3, 10,
];

export function getPayoutMultiplier(binIndex: number): number {
  return PAYOUT_MULTIPLIERS[binIndex] ?? 0;
}
