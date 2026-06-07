"use client";
import { useEffect } from 'react';
import { useGameStore } from '@/lib/store';

export function useKeyboardControls(onDrop: () => void, disabled: boolean) {
  const store = useGameStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.key === 'ArrowLeft') store.setDropColumn(Math.max(0, store.dropColumn - 1));
      if (e.key === 'ArrowRight') store.setDropColumn(Math.min(12, store.dropColumn + 1));
      if (e.key === ' ') { e.preventDefault(); onDrop(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [disabled, onDrop, store]);
}
