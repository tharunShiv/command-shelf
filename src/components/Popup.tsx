import React from "react";
import { CommandPalette } from "./CommandPalette";
import { useRecentCommands } from "../hooks/useRecentCommands";
import { Toaster } from "./ui/sonner";
import { useEffect, useRef } from "react";

export default function Popup() {
  const { recentCommandIds, addRecentCommand } = useRecentCommands();
  // console.log(`Popup.tsx - Initial hash: ${window.location.hash}`);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Listen for main process instruction to focus the search input
    const off = (window as any).electronAPI?.onFocusSearch?.(() => {
      // focus the input inside CommandPalette via ref
      inputRef.current?.focus();
    });
    return () => {
      if (typeof off === "function") off();
    };
  }, []);

  const handleCommandUsed = (commandId: string) => {
    addRecentCommand(commandId);
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-transparent p-0 text-white text-2xl font-bold">
      {/* Popup Component Loaded */}
      {/* Ensure Toaster is still present for messages if needed */}
      <Toaster position="top-center" />
      {/* The CommandPalette should ideally be a direct child here */}
      <CommandPalette
        isOpen={true} // Always open for the popup
        onClose={() => {
          /* Closing handled by main process, no-op here */
        }}
        recentCommandIds={recentCommandIds}
        onCommandUsed={handleCommandUsed}
        inputRef={inputRef}
        isOverlay={true} // Pass false for popup
      />
    </div>
  );
}
