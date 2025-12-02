import { useEffect, useRef } from "react";
import { CommandVariant } from "../data/Command";
import { VariationItem } from "./VariationItem";
import { ScrollArea } from "./ui/scroll-area";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

interface VariationListProps {
  variations: CommandVariant[];
  commandName: string;
  query: string;
  selectedIndex: number;
  onSelect: (variation: CommandVariant) => void;
  onBack: () => void;
  onHover: (index: number) => void;
  className?: string;
}

export function VariationList({
  variations,
  commandName,
  query,
  selectedIndex,
  onSelect,
  onBack,
  onHover,
  className,
}: VariationListProps) {
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

  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      <div className="px-4 py-2 border-b border-border flex items-center gap-2 bg-muted/10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 -ml-2"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          Variations for <span className="text-foreground">{commandName}</span>
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div ref={containerRef} className="max-h-[400px]">
          {variations.map((variation, index) => (
            <div
              key={index}
              ref={index === selectedIndex ? selectedRef : null}
            >
              <VariationItem
                variation={variation}
                query={query}
                isSelected={index === selectedIndex}
                onClick={() => onSelect(variation)}
                onMouseEnter={() => onHover(index)}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
