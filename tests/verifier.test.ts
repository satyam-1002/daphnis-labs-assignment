import { describe, it, expect } from "vitest";
import { computeCommitHex, computeCombinedSeed } from "../lib/crypto";
import { runEngine } from "../lib/engine";

describe("Verifier Integration — full pipeline", () => {
  const serverSeed = "b2a5f3f32a4d9c6ee7a8c1d33456677890abcdeffedcba0987654321ffeeddcc";
  const clientSeed = "candidate-hello";
  const nonce = "42";
  const dropColumn = 6;

  it("commitHex matches test vector", () => {
    expect(computeCommitHex(serverSeed, nonce)).toBe(
      "bb9acdc67f3f18f3345236a01f0e5072596657a9005c7d8a22cff061451a6b34"
    );
  });

  it("combinedSeed matches test vector", () => {
    expect(computeCombinedSeed(serverSeed, clientSeed, nonce)).toBe(
      "e1dddf77de27d395ea2be2ed49aa2a59bd6bf12ee8d350c16c008abd406c07e0"
    );
  });

  it("binIndex=6 for test vector", () => {
    const combined = computeCombinedSeed(serverSeed, clientSeed, nonce);
    const { binIndex } = runEngine(combined, dropColumn);
    expect(binIndex).toBe(6);
  });

  it("verifier replay is identical to original round", () => {
    const combined = computeCombinedSeed(serverSeed, clientSeed, nonce);
    const original = runEngine(combined, dropColumn);
    const replay = runEngine(combined, dropColumn);
    expect(original).toEqual(replay);
  });
});
