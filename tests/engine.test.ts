import { describe, it, expect } from "vitest";
import { runEngine, PAYOUT_MULTIPLIERS, getPayoutMultiplier } from "../lib/engine";
import { computeCombinedSeed } from "../lib/crypto";

const TV_COMBINED = "e1dddf77de27d395ea2be2ed49aa2a59bd6bf12ee8d350c16c008abd406c07e0";

describe("Deterministic Engine", () => {
  it("produces binIndex=6 for test vector with dropColumn=6", () => {
    const { binIndex } = runEngine(TV_COMBINED, 6);
    expect(binIndex).toBe(6);
  });

  it("is fully deterministic", () => {
    const r1 = runEngine(TV_COMBINED, 6);
    const r2 = runEngine(TV_COMBINED, 6);
    expect(r1.binIndex).toBe(r2.binIndex);
    expect(r1.pegMapHash).toBe(r2.pegMapHash);
    expect(r1.path).toEqual(r2.path);
  });

  it("peg map row r has r+1 pegs", () => {
    const { pegMap } = runEngine(TV_COMBINED, 6);
    expect(pegMap.length).toBe(12);
    for (let r = 0; r < 12; r++) {
      expect(pegMap[r].length).toBe(r + 1);
    }
  });

  it("row 0 peg matches assignment (leftBias ~0.422123)", () => {
    const { pegMap } = runEngine(TV_COMBINED, 6);
    expect(pegMap[0][0].leftBias).toBeCloseTo(0.422123, 4);
  });

  it("path has 12 decisions, all L or R", () => {
    const { path } = runEngine(TV_COMBINED, 6);
    expect(path.length).toBe(12);
    for (const step of path) expect(["L", "R"]).toContain(step.direction);
  });

  it("binIndex equals R-count in path", () => {
    const { path, binIndex } = runEngine(TV_COMBINED, 6);
    expect(binIndex).toBe(path.filter(s => s.direction === "R").length);
  });

  it("payout multipliers are symmetric", () => {
    expect(PAYOUT_MULTIPLIERS[0]).toBe(PAYOUT_MULTIPLIERS[12]);
    expect(PAYOUT_MULTIPLIERS[1]).toBe(PAYOUT_MULTIPLIERS[11]);
  });
});
