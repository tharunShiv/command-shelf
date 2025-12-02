import { CommandVariant } from "../data/Command";
import { highlightMatch } from "../utils/search";
import { Copy, Star } from "lucide-react";

interface VariationItemProps {
  variation: CommandVariant;
  query: string;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

export function VariationItem({
  variation,
  query,
  isSelected,
  onClick,
  onMouseEnter,
}: VariationItemProps) {
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
          {variation.isPrimary ? (
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
          ) : (
            <div className="w-4 h-4" /> // Spacer
          )}
        </div>

        <div className="flex-1 min-w-0">
          <code className="block text-sm font-mono font-normal text-primary mb-1 break-all">
            {highlightMatch(variation.syntax, query)}
          </code>

          <p className="text-sm text-muted-foreground font-normal line-clamp-2">
            {highlightMatch(variation.description, query)}
          </p>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground">
          <Copy className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
