import { createHash } from "crypto";

/** SHA256 of a string, returns lowercase hex */
export function sha256(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

/** Compute commitment: SHA256(serverSeed:nonce) */
export function computeCommitHex(serverSeed: string, nonce: string): string {
  return sha256(`${serverSeed}:${nonce}`);
}

/** Compute combined seed: SHA256(serverSeed:clientSeed:nonce) */
export function computeCombinedSeed(
  serverSeed: string,
  clientSeed: string,
  nonce: string
): string {
  return sha256(`${serverSeed}:${clientSeed}:${nonce}`);
}

/** Generate cryptographically random hex string of given byte length */
export function randomHex(bytes: number = 32): string {
  const { randomBytes } = require("crypto");
  return randomBytes(bytes).toString("hex");
}
