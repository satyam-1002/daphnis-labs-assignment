import { describe, it, expect } from "vitest";
import { Xorshift32, createPRNG } from "../lib/prng";

const COMBINED_SEED = "e1dddf77de27d395ea2be2ed49aa2a59bd6bf12ee8d350c16c008abd406c07e0";
const EXPECTED_RANDS = [0.1106166649, 0.7625129214, 0.0439292176, 0.4578678815, 0.3438999297];

describe("xorshift32 PRNG", () => {
  it("matches assignment test vector — first 5 rand() values", () => {
    const prng = createPRNG(COMBINED_SEED);
    for (const expected of EXPECTED_RANDS) {
      expect(prng.rand()).toBeCloseTo(expected, 5);
    }
  });

  it("is fully deterministic", () => {
    const p1 = createPRNG(COMBINED_SEED);
    const p2 = createPRNG(COMBINED_SEED);
    for (let i = 0; i < 20; i++) {
      expect(p1.rand()).toBe(p2.rand());
    }
  });

  it("produces values in [0, 1)", () => {
    const prng = new Xorshift32(12345);
    for (let i = 0; i < 1000; i++) {
      const v = prng.rand();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
