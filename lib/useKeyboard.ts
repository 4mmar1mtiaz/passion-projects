'use client';

import { useEffect, useState } from 'react';

export function useKeyboard() {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey) return;
      const key = e.key === '\\' ? '\\' : e.key.toLowerCase();
      setPressedKeys((prev) => new Set([...prev, key]));
    };
    const onUp = (e: KeyboardEvent) => {
      const key = e.key === '\\' ? '\\' : e.key.toLowerCase();
      setPressedKeys((prev) => { const s = new Set(prev); s.delete(key); return s; });
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  return pressedKeys;
}
