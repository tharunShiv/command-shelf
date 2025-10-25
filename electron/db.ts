// electron/db.ts

import * as sqlite3 from "sqlite3";
import { open } from "sqlite";
import { join } from "path";

// Define the shape of a Command item for better type safety
interface Command {
  id: string;
  name: string;
  platform: string;
  category: string;
  tags: string[] | string; // Stored as a comma-separated string
  variations: any[]; // Variations will be stored as a JSON string
  version: number;
}

// Global variable for the database instance
let db: sqlite.Database;
let localDataVersion = 0; // Tracks the current version of the data in the database

/**
 * Initializes the SQLite database connection and creates the necessary table.
 */
export async function initDb() {
  const dbPath = join(process.cwd(), "commands.sqlite");
  console.log(`DB: Initializing SQLite database at: ${dbPath}`);

  try {
    // Open the database connection
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Create the commands table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS commands (
        id TEXT PRIMARY KEY,
        name TEXT,
        platform TEXT,
        category TEXT,
        tags TEXT,
        variations_json TEXT,  -- Storing variations as a JSON string
        version INTEGER
      );
    `);

    // Get the current local data version from the highest version number in the table
    const result = await db.get(
      "SELECT MAX(version) as maxVersion FROM commands"
    );
    localDataVersion = result?.maxVersion || 0;

    console.log(
      `DB: Initialization complete. Local data version: ${localDataVersion}`
    );
  } catch (error) {
    console.error("DB: Failed to initialize database:", error);
    throw error; // Re-throw to halt execution in main.ts if setup fails
  }
}

/**
 * Updates the commands table with new data from a remote source.
 * @param newCommands - An array of new command objects.
 */
export async function updateCommands(newCommands: Command[]) {
  console.log(`DB: Starting update for ${newCommands.length} commands.`);

  if (newCommands.length === 0) return;

  // Start a transaction for faster insertion
  await db.exec("BEGIN TRANSACTION");

  try {
    // Clear the existing table data

    const stmt = await db.prepare(`
      REPLACE INTO commands (id, name, platform, category, tags, variations_json, version) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const cmd of newCommands) {
      // Convert complex objects to storable strings
      const variationsJson = JSON.stringify(cmd.variations || []);
      const tagsString = Array.isArray(cmd.tags)
        ? cmd.tags.join(",")
        : cmd.tags || "";

      await stmt.run(
        cmd.id,
        cmd.name,
        cmd.platform,
        cmd.category,
        tagsString,
        variationsJson,
        cmd.version || 1 // Ensure a version is set
      );
    }

    await stmt.finalize();
    await db.exec("COMMIT");

    // Update the local version tracker
    localDataVersion = Math.max(...newCommands.map((c) => c.version || 1));
    console.log(`DB: Update complete. New local version: ${localDataVersion}`);
  } catch (error) {
    await db.exec("ROLLBACK");
    console.error("DB: Command update failed, rolled back transaction:", error);
    throw error;
  }
}

/**
 * Fetches all commands from the database and parses the JSON back.
 * @returns A promise that resolves to an array of Command objects.
 */
export async function getAllCommands(): Promise<Command[]> {
  if (!db) {
    await initDb(); // Ensure DB is initialized if somehow called prematurely
  }

  const rows = await db.all("SELECT * FROM commands");
  console.log(`DB: Found ${rows.length} rows for getAllCommands.`);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    platform: row.platform,
    category: row.category,
    // Convert tags string back to array if needed in the renderer, otherwise keep string
    tags: row.tags ? row.tags.split(",") : [],
    // CRITICAL: Parse the JSON string back into the variations array
    variations: JSON.parse(row.variations_json),
    version: row.version,
  })) as Command[];
}

/**
 * Getter for the current local data version.
 * @returns The version number.
 */
export function getLocalDataVersion(): number {
  return localDataVersion;
}
