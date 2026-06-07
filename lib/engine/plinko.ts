// Re-export from canonical engine implementation
export * from '../engine';
export const PAYOUT_TABLE: Record<number, number> = {
  0: 10, 1: 3, 2: 1.5, 3: 1, 4: 0.5, 5: 0.3, 6: 0.2,
  7: 0.3, 8: 0.5, 9: 1, 10: 1.5, 11: 3, 12: 10,
};
