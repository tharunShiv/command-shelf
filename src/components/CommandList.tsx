import { useEffect, useRef } from "react";
import { Command } from "../data/commands";
import { CommandItem } from "./CommandItem";
import { ScrollArea } from "./ui/scroll-area";

interface CommandListProps {
  commands: Command[];
  query: string;
  selectedIndex: number;
  recentCommandIds: string[];
  onSelect: (command: Command) => void;
  onHover: (index: number) => void;
  className?: string; // New prop
}

export function CommandList({
  commands,
  query,
  selectedIndex,
  recentCommandIds,
  onSelect,
  onHover,
  className,
}: CommandListProps) {
  const selectedRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedRef.current && containerRef.current) {
      const container = containerRef.current;
      const selected = selectedRef.current;

      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const selectedTop = selected.offsetTop;
      const selectedBottom = selectedTop + selected.clientHeight;

      if (selectedTop < containerTop) {
        container.scrollTop = selectedTop;
      } else if (selectedBottom > containerBottom) {
        container.scrollTop = selectedBottom - container.clientHeight;
      }
    }
  }, [selectedIndex]);

  if (commands.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-muted-foreground">
        <p>No commands found</p>
        <p className="text-sm mt-1">Try a different search term</p>
      </div>
    );
  }

  return (
    <ScrollArea className={`h-full ${className || ""}`}>
      <div ref={containerRef} className="max-h-[400px]">
        {commands.map((command, index) => (
          <div
            key={command.id}
            ref={index === selectedIndex ? selectedRef : null}
          >
            <CommandItem
              command={command}
              query={query}
              isSelected={index === selectedIndex}
              isRecent={recentCommandIds.includes(command.id)}
              onClick={() => onSelect(command)}
              onMouseEnter={() => onHover(index)}
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
