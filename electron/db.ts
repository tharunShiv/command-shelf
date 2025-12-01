// electron/db.ts

import Database from "better-sqlite3";
import { join } from "path";
import { app } from "electron";

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
let db: Database.Database;
let localDataVersion = 0; // Tracks the current version of the data in the database

/**
 * Initializes the SQLite database connection and creates the necessary table.
 */
export async function initDb() {
  const dbPath = app.isPackaged
    ? join(process.resourcesPath, "commands.sqlite")
    : join(process.cwd(), "commands.sqlite");
    
  console.log(`DB: Initializing SQLite database at: ${dbPath}`);

  try {
    // Open the database connection synchronously
    db = new Database(dbPath);
    
    // Optimize performance
    db.pragma('journal_mode = WAL');

    // Create the commands table
    db.exec(`
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

    // Create the custom_commands table
    db.exec(`
      CREATE TABLE IF NOT EXISTS custom_commands (
        id TEXT PRIMARY KEY,
        name TEXT,
        platform TEXT,
        category TEXT,
        tags TEXT,
        variations_json TEXT,
        created_at INTEGER
      );
    `);

    // Get the current local data version from the highest version number in the table
    const result = db.prepare("SELECT MAX(version) as maxVersion FROM commands").get() as { maxVersion: number };
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

  try {
    const insert = db.prepare(`
      REPLACE INTO commands (id, name, platform, category, tags, variations_json, version) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((commands: Command[]) => {
      for (const cmd of commands) {
        // Convert complex objects to storable strings
        const variationsJson = JSON.stringify(cmd.variations || []);
        const tagsString = Array.isArray(cmd.tags)
          ? cmd.tags.join(",")
          : cmd.tags || "";

        insert.run(
          cmd.id,
          cmd.name,
          cmd.platform,
          cmd.category,
          tagsString,
          variationsJson,
          cmd.version || 1 // Ensure a version is set
        );
      }
    });

    insertMany(newCommands);

    // Update the local version tracker
    localDataVersion = Math.max(...newCommands.map((c) => c.version || 1));
    console.log(`DB: Update complete. New local version: ${localDataVersion}`);
  } catch (error) {
    console.error("DB: Command update failed:", error);
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

  const rows = db.prepare("SELECT * FROM commands").all() as any[];
  console.log(`DB: Found ${rows.length} standard commands.`);

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
 * Adds a new custom command to the database.
 */
export async function addCustomCommand(command: Command): Promise<void> {
  if (!db) await initDb();

  try {
    const insert = db.prepare(`
      INSERT INTO custom_commands (id, name, platform, category, tags, variations_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const variationsJson = JSON.stringify(command.variations || []);
    const tagsString = Array.isArray(command.tags)
      ? command.tags.join(",")
      : command.tags || "";

    insert.run(
      command.id,
      command.name,
      command.platform,
      command.category,
      tagsString,
      variationsJson,
      Date.now()
    );
    console.log(`DB: Added custom command: ${command.name}`);
  } catch (error) {
    console.error("DB: Failed to add custom command:", error);
    throw error;
  }
}

/**
 * Fetches all custom commands.
 */
export async function getCustomCommands(): Promise<Command[]> {
  if (!db) await initDb();

  const rows = db.prepare("SELECT * FROM custom_commands").all() as any[];
  console.log(`DB: Found ${rows.length} custom commands.`);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    platform: row.platform,
    category: row.category,
    tags: row.tags ? row.tags.split(",") : [],
    variations: JSON.parse(row.variations_json),
    version: 0, // Custom commands don't track version sync
    isCustom: true // Flag to identify custom commands in UI
  })) as Command[];
}

/**
 * Deletes a custom command by ID.
 */
export async function deleteCustomCommand(id: string): Promise<void> {
  if (!db) await initDb();
  
  try {
    db.prepare("DELETE FROM custom_commands WHERE id = ?").run(id);
    console.log(`DB: Deleted custom command: ${id}`);
  } catch (error) {
    console.error("DB: Failed to delete custom command:", error);
    throw error;
  }
}

/**
 * Getter for the current local data version.
 * @returns The version number.
 */
export function getLocalDataVersion(): number {
  return localDataVersion;
}
