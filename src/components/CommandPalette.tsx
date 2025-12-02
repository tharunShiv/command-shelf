// src/components/CommandPallete.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Search, X, Zap, Loader2, Plus } from "lucide-react"; // 💡 Added Plus here
import { Command } from "../data/Command";
import { searchCommands, SearchResult } from "../utils/search";
import { copyCommandToClipboard } from "../utils/clipboard";
import { CommandList } from "./CommandList";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useCommands } from "../hooks/useCommands";
import { AddCommandForm } from "./AddCommandForm";
import { VariationList } from "./VariationList";
import { CommandVariant } from "../data/Command";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  recentCommandIds: string[];
  onCommandUsed: (commandId: string) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  isOverlay?: boolean; // New prop
}

type SelectableCommand = Command | SearchResult;

export function CommandPalette({
  isOpen,
  onClose,
  recentCommandIds,
  onCommandUsed,
  inputRef,
  isOverlay,
}: CommandPaletteProps) {
  console.log(`CommandPalette - isOverlay: ${isOverlay}`);
  // Get data from the hook
  const { commands, isLoading, error, refreshCommands } = useCommands();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  // View state: 'list', 'add', or 'variations'
  const [view, setView] = useState<"list" | "add" | "variations">("list");
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);

  const allCommands = useMemo(() => commands, [commands]);

  // Get recent commands
  const recentCommands = useMemo(() => {
    return (
      recentCommandIds
        // 💡 CHANGE: We map over the full 'allCommands' array now
        .map((id) => allCommands.find((cmd) => cmd.id === id))
        // 💡 NEW: We must derive the primarySyntax to use it in CommandItem/clipboard
        .filter((cmd): cmd is Command => cmd !== undefined)
        .map((cmd) => {
          const primaryVariant =
            cmd.variations.find((v) => v.isPrimary) || cmd.variations[0];
          return {
            ...cmd,
            primarySyntax: primaryVariant?.syntax || "",
          } as Command & { primarySyntax: string }; // Cast for typing
        })
        .slice(0, 5)
    );
  }, [recentCommandIds, allCommands]); // Depend on allCommands now

  // Search results
  const searchResults: SearchResult[] = useMemo(() => {
    if (!query.trim() || isLoading) {
      return [];
    }
    const results = searchCommands(allCommands, query, recentCommandIds).slice(
      0,
      10
    );
    return results;
  }, [query, recentCommandIds, allCommands, isLoading]);

  // Display list: search results or recent commands
  const displayCommands = query.trim() ? searchResults : recentCommands;

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [displayCommands.length]);

  // Reset query and view when palette opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setView("list");
      setSelectedCommand(null);
    }
  }, [isOpen]);

  // Handle command selection
  const handleSelectCommand = (command: SelectableCommand) => {
    if ("primarySyntax" in command) {
      // It's a Command object (either from search or recent)
      setSelectedCommand(command);
      setView("variations");
      setSelectedIndex(0);
      setQuery(""); // Clear query when entering variations view
    }
  };

  const handleSelectVariation = async (variation: CommandVariant) => {
    if (!selectedCommand) return;

    try {
      await copyCommandToClipboard(variation.syntax, selectedCommand.name);
      onCommandUsed(selectedCommand.id);
      toast.success("Command copied to clipboard!", {
        description: `${selectedCommand.name} - Ready to paste`,
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

  const handleBack = () => {
    setView("list");
    setSelectedCommand(null);
    setSelectedIndex(0);
    // Optional: Restore previous query if we wanted to be fancy, but clearing is fine for now
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || view === "add") return;

    const currentListLength =
      view === "variations" && selectedCommand
        ? selectedCommand.variations.length
        : displayCommands.length;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < currentListLength - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && currentListLength > 0) {
        e.preventDefault();
        if (view === "variations" && selectedCommand) {
          handleSelectVariation(selectedCommand.variations[selectedIndex]);
        } else {
          handleSelectCommand(displayCommands[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (view === "variations") {
          handleBack();
        } else {
          onClose();
        }
      } else if (e.key === "Backspace" && query === "" && view === "variations") {
        // Allow backspace to go back if query is empty
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, displayCommands, selectedIndex, onClose, view, selectedCommand, query]);

  if (!isOpen) {
    return null;
  }

  const renderLoadingOrError = () => {
    if (isLoading) {
      return (
        <div className="px-4 py-12 text-center custom-height-results">
          <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
          <p className="text-muted-foreground">Loading commands...</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Fetching data from the server.
          </p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="px-4 py-12 text-center custom-height-results">
          <X className="w-8 h-8 text-destructive mx-auto mb-3" />
          <p className="text-muted-foreground">Error Loading Data</p>
          <p className="text-sm text-destructive/70 mt-1">{error}</p>
          <p className="text-xs text-muted-foreground/50 mt-2">
            The app will use available local data if possible.
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
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
          {view === "add" ? (
            <AddCommandForm
              onCancel={() => setView("list")}
              onCommandAdded={() => {
                refreshCommands?.();
                setView("list");
              }}
            />
          ) : view === "variations" && selectedCommand ? (
            <VariationList
              variations={selectedCommand.variations}
              commandName={selectedCommand.name}
              query={query}
              selectedIndex={selectedIndex}
              onSelect={handleSelectVariation}
              onBack={handleBack}
              onHover={setSelectedIndex}
              className={isOverlay ? "" : "flex-1"}
            />
          ) : (
            <>
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
                    autoFocus={view === "list"}
                    ref={inputRef}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setView("add")}
                    className="flex-shrink-0"
                    title="Add Custom Command"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
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
              {renderLoadingOrError() ||
                (displayCommands.length > 0 ? (
                  <CommandList
                    commands={
                      displayCommands as (Command & { primarySyntax: string })[]
                    }
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
                ))}
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
            </>
          )}
        </div>
      </div>
    </>
  );
}
