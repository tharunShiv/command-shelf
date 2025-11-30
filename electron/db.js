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
  getAllCommands: () => getAllCommands,
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
    version: row.version
  }));
}
function getLocalDataVersion() {
  return localDataVersion;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getAllCommands,
  getLocalDataVersion,
  initDb,
  updateCommands
});
