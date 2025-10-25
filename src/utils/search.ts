import { Command } from "../data/Command";
import React from "react";

export interface SearchResult extends Command {
  score: number;
  matchType: "name" | "tag" | "description" | "platform"; // Added 'platform' to search type

  // NOTE: We temporarily include the primary syntax here for easier use in CommandItem
  // This will hold the syntax string from the primary variation.
  primarySyntax: string;
}

/**
 * Search commands with prioritized scoring:
 * - Command name match: highest priority (100 points)
 * - Tag/argument match: medium priority (50 points)
 * - Description match: lowest priority (25 points)
 */
export function searchCommands(
  commands: Command[],
  query: string,
  recentCommandIds: string[] = []
): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  for (const command of commands) {
    let score = 0;
    let matchType: SearchResult["matchType"] = "description";

    // 💡 NEW: Get the primary syntax to search against
    const primaryVariation =
      command.variations.find((v) => v.isPrimary) || command.variations[0];
    const primarySyntax = primaryVariation?.syntax || "";

    // Check command name (highest priority)
    if (command.name.toLowerCase().includes(normalizedQuery)) {
      score += 100;
      matchType = "name";

      // Exact match bonus
      if (command.name.toLowerCase() === normalizedQuery) {
        score += 50;
      }

      // Starts with query bonus
      if (command.name.toLowerCase().startsWith(normalizedQuery)) {
        score += 30;
      }
    }

    if (command.platform.toLowerCase().includes(normalizedQuery)) {
      score += 80;
      if (matchType === "description") {
        matchType = "platform";
      }
    }

    // Check tags/arguments (medium priority)
    const tagMatch = command.tags.some((tag) =>
      tag.toLowerCase().includes(normalizedQuery)
    );

    if (tagMatch) {
      score += 50;
      if (matchType === "description") {
        matchType = "tag";
      }
    }

    // Check syntax for argument matches
    if (primarySyntax.toLowerCase().includes(normalizedQuery)) {
      score += 40;
      if (matchType === "description") {
        matchType = "tag";
      }
    }

    // Check category
    if (command.category.toLowerCase().includes(normalizedQuery)) {
      score += 35;
    }

    // Check description (lowest priority)
    if (command.description?.toLowerCase()?.includes(normalizedQuery)) {
      score += 25;
    }

    // Check examples
    const exampleMatch =
      command.examples && Array.isArray(command.examples)
        ? command.examples.some((example) =>
            example.toLowerCase().includes(normalizedQuery)
          )
        : false;
    if (exampleMatch) {
      score += 20;
    }

    // Boost score for recently used commands
    const recentIndex = recentCommandIds.indexOf(command.id);
    if (recentIndex !== -1) {
      // More recent = higher boost
      score += (recentCommandIds.length - recentIndex) * 10;
    }

    // Only include results with matches
    if (score > 0) {
      console.log(
        `Search: ✅ MATCH found for ${command.name} with score ${score}`
      );
      results.push({
        ...command,
        score,
        matchType,
        primarySyntax,
      });
    }
  }

  // Sort by score (highest first)
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Highlight matching text in a string
 */
export function highlightMatch(text: string, query: string): React.ReactNode {
  if (!text) {
    return "";
  }

  if (!query.trim()) {
    return text;
  }

  const normalizedQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();
  const index = lowerText.indexOf(normalizedQuery);

  if (index === -1) {
    return text;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return React.createElement(
    React.Fragment,
    null,
    before,
    React.createElement(
      "span",
      {
        className:
          "bg-yellow-200 dark:bg-yellow-900/50 text-foreground rounded px-0.5",
      },
      match
    ),
    highlightMatch(after, query)
  );
}
