import { describe, it, expect } from "vitest";
import { sha256, computeCommitHex, computeCombinedSeed } from "../lib/crypto";

const TV = {
  serverSeed: "b2a5f3f32a4d9c6ee7a8c1d33456677890abcdeffedcba0987654321ffeeddcc",
  nonce: "42",
  clientSeed: "candidate-hello",
  commitHex: "bb9acdc67f3f18f3345236a01f0e5072596657a9005c7d8a22cff061451a6b34",
  combinedSeed: "e1dddf77de27d395ea2be2ed49aa2a59bd6bf12ee8d350c16c008abd406c07e0",
};

describe("SHA256 crypto", () => {
  it("produces correct commitHex from test vector", () => {
    expect(computeCommitHex(TV.serverSeed, TV.nonce)).toBe(TV.commitHex);
  });

  it("produces correct combinedSeed from test vector", () => {
    expect(computeCombinedSeed(TV.serverSeed, TV.clientSeed, TV.nonce)).toBe(TV.combinedSeed);
  });

  it("sha256 is deterministic", () => {
    expect(sha256("hello")).toBe(sha256("hello"));
  });

  it("commitHex is 64-char lowercase hex", () => {
    expect(computeCommitHex("seed", "42")).toMatch(/^[0-9a-f]{64}$/);
  });
});
