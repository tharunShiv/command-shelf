import React, { useState, useEffect, useMemo } from "react";
import { Search, X, Zap } from "lucide-react";
import { commands, Command } from "../data/commands";
import { searchCommands } from "../utils/search";
import { copyCommandToClipboard } from "../utils/clipboard";
import { CommandList } from "./CommandList";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  recentCommandIds: string[];
  onCommandUsed: (commandId: string) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  isOverlay?: boolean; // New prop
}

export function CommandPalette({
  isOpen,
  onClose,
  recentCommandIds,
  onCommandUsed,
  inputRef,
  isOverlay,
}: CommandPaletteProps) {
  console.log(`CommandPalette - isOverlay: ${isOverlay}`);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Get recent commands
  const recentCommands = useMemo(() => {
    return recentCommandIds
      .map((id) => commands.find((cmd) => cmd.id === id))
      .filter((cmd): cmd is Command => cmd !== undefined)
      .slice(0, 5);
  }, [recentCommandIds]);

  // Search results
  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return [];
    }
    return searchCommands(commands, query, recentCommandIds).slice(0, 10);
  }, [query, recentCommandIds]);

  // Display list: search results or recent commands
  const displayCommands = query.trim() ? searchResults : recentCommands;

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [displayCommands.length]);

  // Reset query when palette opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle command selection
  const handleSelectCommand = async (command: Command) => {
    try {
      await copyCommandToClipboard(command.syntax, command.name);
      onCommandUsed(command.id);
      toast.success("Command copied to clipboard!", {
        description: `${command.name} - Ready to paste`,
        duration: 2000,
      });
      onClose();
    } catch (error) {
      toast.error("Failed to copy command", {
        description: "Please try again",
        duration: 2000,
      });
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < displayCommands.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && displayCommands.length > 0) {
        e.preventDefault();
        handleSelectCommand(displayCommands[selectedIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, displayCommands, selectedIndex, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={
        isOverlay
          ? "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center"
          : ""
      }
      onClick={onClose}
    >
      <div
        className={
          isOverlay
            ? "bg-card border border-border rounded-xl shadow-2xl w-full h-full max-w-2xl overflow-hidden"
            : "flex flex-col w-full h-full"
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={isOverlay ? "border-b border-border" : ""}>
          <div
            className={
              isOverlay
                ? "flex items-center gap-3 px-4 py-3"
                : "flex items-center gap-3 p-0"
            }
          >
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <Input
              type="text"
              placeholder="Search all Linux commands"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground"
              autoFocus
              ref={inputRef}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Info bar */}
          <div
            className={
              isOverlay
                ? "px-4 py-2 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground"
                : "flex items-center justify-between text-xs text-muted-foreground p-0"
            }
          >
            <div className="flex items-center gap-4">
              {!query.trim() && recentCommands.length > 0 && (
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Recent Commands
                </span>
              )}
              {query.trim() && (
                <span>
                  {searchResults.length} result
                  {searchResults.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs">
                ↑↓
              </kbd>
              <span>Navigate</span>
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs">
                ⏎
              </kbd>
              <span>Select</span>
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs">
                Cmd + Shift + D
              </kbd>
              <span>Close</span>
            </div>
          </div>
        </div>

        {/* Results */}
        {displayCommands.length > 0 ? (
          <CommandList
            commands={displayCommands}
            query={query}
            selectedIndex={selectedIndex}
            recentCommandIds={recentCommandIds}
            onSelect={handleSelectCommand}
            onHover={setSelectedIndex}
            className={isOverlay ? "" : "flex-1"}
          />
        ) : (
          <div
            className={
              isOverlay
                ? "px-4 py-12 text-center custom-height-results"
                : "flex-1 text-center"
            }
          >
            {query.trim() ? (
              <>
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                <p className="text-muted-foreground">No commands found</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Try searching for "grep", "docker", "ssh", or "tcpdump"
                </p>
              </>
            ) : (
              <>
                <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                <p className="text-muted-foreground">No recent commands</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Start typing to search for Linux commands
                </p>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div
          className={
            isOverlay
              ? "border-t border-border px-4 py-2 bg-muted/20 text-xs text-muted-foreground text-center"
              : "text-xs text-muted-foreground text-center p-0"
          }
        >
          Commands are prefixed with # comment for safety
        </div>
      </div>
    </div>
  );
}
