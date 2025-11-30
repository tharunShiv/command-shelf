export interface Command {
  id: string;
  name: string;
  // REMOVED: syntax: string; ❌
  description: string; // The overall high-level description of the command (e.g., "List directory contents")
  category: string;
  platform: "Linux" | "MySQL" | "GlusterFS" | "Hadoop" | "General";
  version: number;
  examples: string[];
  tags: string[];

  // 💡 NEW: Array of distinct, selectable variations
  variations: CommandVariant[];
}

// 💡 NEW: Define a structure for the remote version check
export interface RemoteVersion {
  latestVersion: number;
  dataUrl: string; // The URL to the full commands JSON file
}

// Define the structure for a single command variant
export interface CommandVariant {
  syntax: string;
  description: string; // Describes what this specific variation does (e.g., "Sort by time, newest first")
  isPrimary?: boolean; // Optional: Flag the most common/default one
}
