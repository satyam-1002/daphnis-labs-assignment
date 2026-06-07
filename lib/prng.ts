/**
 * xorshift32 PRNG - seeded from first 4 bytes of combinedSeed (big-endian)
 * Implements the exact algorithm specified in the assignment.
 */
export class Xorshift32 {
  private state: number;

  constructor(seed: number) {
    // Ensure non-zero state (xorshift32 fails with seed 0)
    this.state = seed >>> 0 || 1;
  }

  /** Advance state and return next uint32 */
  nextUint32(): number {
    let x = this.state;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0;
    return this.state;
  }

  /** Return next float in [0, 1) */
  rand(): number {
    return this.nextUint32() / 0x100000000;
  }
}

/**
 * Create an Xorshift32 PRNG seeded from the first 4 bytes of a hex string (big-endian).
 * combinedSeed is a 64-char hex string; first 8 hex chars = 4 bytes.
 */
export function createPRNG(combinedSeedHex: string): Xorshift32 {
  const seedHex = combinedSeedHex.slice(0, 8);
  const seed = parseInt(seedHex, 16);
  return new Xorshift32(seed);
}
