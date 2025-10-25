import { Command } from "../data/Command";
import { highlightMatch } from "../utils/search";
import { Terminal, Copy, Clock } from "lucide-react";

type CommandWithSyntax = Command & { primarySyntax: string };

interface CommandItemProps {
  command: Command;
  query: string;
  isSelected: boolean;
  isRecent: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

export function CommandItem({
  command,
  query,
  isSelected,
  isRecent,
  onClick,
  onMouseEnter,
}: CommandItemProps) {
  return (
    <div
      className={`
        px-4 py-3 cursor-pointer transition-colors border-l-2
        ${
          isSelected
            ? "bg-accent border-primary"
            : "border-transparent hover:bg-accent/50"
        }
      `}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 text-muted-foreground">
          {isRecent ? (
            <Clock className="w-4 h-4" />
          ) : (
            <Terminal className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <code className="text-sm font-mono text-primary">
              {highlightMatch(command.name, query)}
            </code>
            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
              {/* 💡 NEW: Show the platform which is a new field */}
              {command.platform} / {command.category}
            </span>
          </div>

          <code className="block text-xs font-mono text-foreground/80 mb-2 break-all">
            {/* 💡 CHANGE: Use the new primarySyntax field */}
            {highlightMatch(command.primarySyntax, query)}
          </code>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {highlightMatch(command.description, query)}
          </p>

          {command.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {command.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-muted-foreground/70 bg-muted/50 px-1.5 py-0.5 rounded"
                >
                  {highlightMatch(tag, query)}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-muted-foreground">
          <Copy className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
