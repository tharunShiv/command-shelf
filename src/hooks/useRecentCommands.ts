import { useState, useEffect } from 'react';

const STORAGE_KEY = 'linux-command-palette-recent';
const MAX_RECENT = 10;

export function useRecentCommands() {
  const [recentCommandIds, setRecentCommandIds] = useState<string[]>([]);

  // Load recent commands from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentCommandIds(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load recent commands:', error);
    }
  }, []);

  // Add a command to recent list
  const addRecentCommand = (commandId: string) => {
    setRecentCommandIds(prev => {
      // Remove if already exists
      const filtered = prev.filter(id => id !== commandId);
      
      // Add to front
      const updated = [commandId, ...filtered].slice(0, MAX_RECENT);
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recent commands:', error);
      }
      
      return updated;
    });
  };

  // Clear all recent commands
  const clearRecentCommands = () => {
    setRecentCommandIds([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear recent commands:', error);
    }
  };

  return {
    recentCommandIds,
    addRecentCommand,
    clearRecentCommands
  };
}
