import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function truncateHash(hash: string, chars = 8): string {
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

export const PAYOUT_MULTIPLIERS = [10, 3, 1.5, 1, 0.5, 0.3, 0.2, 0.3, 0.5, 1, 1.5, 3, 10];

export function getBinColor(binIndex: number): string {
  const mult = PAYOUT_MULTIPLIERS[binIndex];
  if (mult >= 10) return "#ffd700";
  if (mult >= 3) return "#f97316";
  if (mult >= 1.5) return "#22c55e";
  if (mult >= 0.5) return "#3b82f6";
  return "#6b7280";
}
