var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var db_exports = {};
__export(db_exports, {
  addCustomCommand: () => addCustomCommand,
  deleteCustomCommand: () => deleteCustomCommand,
  getAllCommands: () => getAllCommands,
  getCustomCommands: () => getCustomCommands,
  getLocalDataVersion: () => getLocalDataVersion,
  initDb: () => initDb,
  updateCommands: () => updateCommands
});
module.exports = __toCommonJS(db_exports);
var import_better_sqlite3 = __toESM(require("better-sqlite3"));
var import_path = require("path");
var import_electron = require("electron");
let db;
let localDataVersion = 0;
async function initDb() {
  const dbPath = import_electron.app.isPackaged ? (0, import_path.join)(process.resourcesPath, "commands.sqlite") : (0, import_path.join)(process.cwd(), "commands.sqlite");
  console.log(`DB: Initializing SQLite database at: ${dbPath}`);
  try {
    db = new import_better_sqlite3.default(dbPath);
    db.pragma("journal_mode = WAL");
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
    const result = db.prepare("SELECT MAX(version) as maxVersion FROM commands").get();
    localDataVersion = result?.maxVersion || 0;
    console.log(
      `DB: Initialization complete. Local data version: ${localDataVersion}`
    );
  } catch (error) {
    console.error("DB: Failed to initialize database:", error);
    throw error;
  }
}
async function updateCommands(newCommands) {
  console.log(`DB: Starting update for ${newCommands.length} commands.`);
  if (newCommands.length === 0) return;
  try {
    const insert = db.prepare(`
      REPLACE INTO commands (id, name, platform, category, tags, variations_json, version) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMany = db.transaction((commands) => {
      for (const cmd of commands) {
        const variationsJson = JSON.stringify(cmd.variations || []);
        const tagsString = Array.isArray(cmd.tags) ? cmd.tags.join(",") : cmd.tags || "";
        insert.run(
          cmd.id,
          cmd.name,
          cmd.platform,
          cmd.category,
          tagsString,
          variationsJson,
          cmd.version || 1
          // Ensure a version is set
        );
      }
    });
    insertMany(newCommands);
    localDataVersion = Math.max(...newCommands.map((c) => c.version || 1));
    console.log(`DB: Update complete. New local version: ${localDataVersion}`);
  } catch (error) {
    console.error("DB: Command update failed:", error);
    throw error;
  }
}
async function getAllCommands() {
  if (!db) {
    await initDb();
  }
  const rows = db.prepare("SELECT * FROM commands").all();
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
    version: row.version
  }));
}
async function addCustomCommand(command) {
  if (!db) await initDb();
  try {
    const insert = db.prepare(`
      INSERT INTO custom_commands (id, name, platform, category, tags, variations_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const variationsJson = JSON.stringify(command.variations || []);
    const tagsString = Array.isArray(command.tags) ? command.tags.join(",") : command.tags || "";
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
async function getCustomCommands() {
  if (!db) await initDb();
  const rows = db.prepare("SELECT * FROM custom_commands").all();
  console.log(`DB: Found ${rows.length} custom commands.`);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    platform: row.platform,
    category: row.category,
    tags: row.tags ? row.tags.split(",") : [],
    variations: JSON.parse(row.variations_json),
    version: 0,
    // Custom commands don't track version sync
    isCustom: true
    // Flag to identify custom commands in UI
  }));
}
async function deleteCustomCommand(id) {
  if (!db) await initDb();
  try {
    db.prepare("DELETE FROM custom_commands WHERE id = ?").run(id);
    console.log(`DB: Deleted custom command: ${id}`);
  } catch (error) {
    console.error("DB: Failed to delete custom command:", error);
    throw error;
  }
}
function getLocalDataVersion() {
  return localDataVersion;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addCustomCommand,
  deleteCustomCommand,
  getAllCommands,
  getCustomCommands,
  getLocalDataVersion,
  initDb,
  updateCommands
});
