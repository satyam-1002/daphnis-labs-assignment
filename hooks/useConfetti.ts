"use client";
import { useState, useCallback } from 'react';

export function useConfetti() {
  const [active, setActive] = useState(false);

  const trigger = useCallback(() => {
    setActive(true);
    setTimeout(() => setActive(false), 3000);
  }, []);

  return { active, trigger };
}
