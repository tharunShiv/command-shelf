import { useEffect } from 'react';

interface KeyboardShortcutOptions {
  key: string;
  metaKey?: boolean;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
}

export function useKeyboardShortcut(
  options: KeyboardShortcutOptions,
  callback: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handler = (event: KeyboardEvent) => {
      const {
        key,
        metaKey = false,
        shiftKey = false,
        ctrlKey = false,
        altKey = false
      } = options;

      const matchesModifiers =
        event.metaKey === metaKey &&
        event.shiftKey === shiftKey &&
        event.ctrlKey === ctrlKey &&
        event.altKey === altKey;

      const matchesKey = event.key.toLowerCase() === key.toLowerCase();

      if (matchesModifiers && matchesKey) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [options, callback, enabled]);
}
