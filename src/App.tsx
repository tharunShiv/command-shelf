import { useState } from "react";
import { Terminal, Keyboard, Zap, Shield, Search } from "lucide-react";
import { CommandPalette } from "./components/CommandPalette";
import { useKeyboardShortcut } from "./hooks/useKeyboardShortcut";
import { useRecentCommands } from "./hooks/useRecentCommands";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const { recentCommandIds, addRecentCommand } = useRecentCommands();

  // Global keyboard shortcut: Cmd+Shift+D (Mac) or Ctrl+Shift+D (Windows/Linux)
  useKeyboardShortcut(
    {
      key: "d",
      metaKey: true,
      shiftKey: true,
    },
    () => setIsPaletteOpen(true),
    !isPaletteOpen
  );

  const handleCommandUsed = (commandId: string) => {
    addRecentCommand(commandId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      <CommandPalette
        isOpen={true} // Always open for the main app
        onClose={() => {
          /* No-op for main app, handled by Electron window close */
        }}
        recentCommandIds={recentCommandIds}
        onCommandUsed={handleCommandUsed}
        isOverlay={true} // Always fullscreen overlay
      />
    </div>
  );
}
