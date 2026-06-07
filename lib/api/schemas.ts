import { z } from 'zod';

export const startRoundSchema = z.object({
  clientSeed: z.string().min(1).max(256),
  betCents: z.number().int().min(1).max(1_000_000),
  dropColumn: z.number().int().min(0).max(12),
});

export const verifyQuerySchema = z.object({
  serverSeed: z.string().min(1),
  clientSeed: z.string().min(1),
  nonce: z.string().min(1),
  dropColumn: z.coerce.number().int().min(0).max(12),
  roundId: z.string().optional(),
});
