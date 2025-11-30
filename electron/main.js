var import_electron = require("electron");
var import_path = require("path");
const {
  initDb,
  updateCommands,
  getAllCommands,
  getLocalDataVersion
} = require("./db");
let mainWindow = null;
let popupWindow = null;
let tray = null;
const isDev = process.env.VITE_DEV_SERVER_URL || process.env.NODE_ENV === "development";
async function setupDatabaseAndSync() {
  try {
    await initDb();
    console.log(
      `MAIN PROCESS: Local command data version: ${getLocalDataVersion()}`
    );
    const VERSION_URL = "https://raw.githubusercontent.com/tharunShiv/command-helper-data-source/refs/heads/main/commands_version.json";
    console.log(
      `MAIN PROCESS: Attempting to fetch version from: ${VERSION_URL}`
    );
    const response = await fetch(VERSION_URL);
    if (!response.ok) {
      console.warn(
        `MAIN PROCESS: Failed to fetch version from GitHub: ${response.status}. Using local data.`
      );
      return;
    }
    const remoteVersion = await response.json();
    console.log(
      `MAIN PROCESS: Remote version found: ${remoteVersion.latestVersion}, Data URL: ${remoteVersion.dataUrl}`
    );
    if (remoteVersion.latestVersion > getLocalDataVersion()) {
      console.log(
        `MAIN PROCESS: New version found: ${remoteVersion.latestVersion}. Starting download...`
      );
      const dataResponse = await fetch(remoteVersion.dataUrl);
      if (!dataResponse.ok) {
        console.error(
          `MAIN PROCESS: Failed to download full data from GitHub: ${dataResponse.status}`
        );
        return;
      }
      const newCommands = await dataResponse.json();
      console.log(
        `MAIN PROCESS: \u2705 Downloaded ${newCommands.length} command objects.`
      );
      await updateCommands(newCommands);
    } else {
      console.log("MAIN PROCESS: Local command data is up to date.");
    }
  } catch (error) {
    console.error(
      "MAIN PROCESS: Failed to initialize DB or sync commands:",
      error
    );
  }
}
function createMainWindow() {
  console.log("createMainWindow called");
  mainWindow = new import_electron.BrowserWindow({
    fullscreen: !isDev,
    // Fullscreen in production, defined size in dev
    width: isDev ? 1280 : void 0,
    height: isDev ? 800 : void 0,
    show: false,
    // Start hidden - only show via tray menu action
    titleBarStyle: "hiddenInset",
    backgroundColor: "#0b0b0c",
    webPreferences: {
      preload: (0, import_path.join)(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  if (isDev) {
    const url = process.env.VITE_DEV_SERVER_URL;
    console.log(`Main window loading URL (dev): ${url}`);
    mainWindow.loadURL(url);
    mainWindow.webContents.openDevTools({ mode: "detach" });
    mainWindow.webContents.on(
      "did-fail-load",
      (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
        console.error(
          `Main did-fail-load: ${errorDescription} (${errorCode}) for ${validatedURL}`
        );
      }
    );
    mainWindow.webContents.on(
      "did-fail-provisional-load",
      (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
        console.error(
          `Main did-fail-provisional-load: ${errorDescription} (${errorCode}) for ${validatedURL}`
        );
      }
    );
    mainWindow.on("unresponsive", () => {
      console.error("Main window became unresponsive");
    });
  } else {
    const filePath = (0, import_path.join)(__dirname, "..", "dist", "index.html");
    console.log(`Main window loading file (prod): ${filePath}`);
    mainWindow.loadFile(filePath);
  }
  mainWindow.once("ready-to-show", () => {
    console.log("Main window ready-to-show");
  });
  mainWindow.on("closed", () => {
    console.log("Main window closed");
    mainWindow = null;
  });
}
function createPopupWindow() {
  console.log("createPopupWindow called");
  popupWindow = new import_electron.BrowserWindow({
    width: 600,
    // Current width
    height: 500,
    // Increased height for better fit
    maxHeight: 600,
    // Optional: Maximum height it can grow to
    show: false,
    // Start hidden
    frame: false,
    // No window frame
    resizable: true,
    // Allow resizing
    movable: true,
    alwaysOnTop: true,
    // Crucial for staying on top
    skipTaskbar: true,
    // Don't show in taskbar/dock
    backgroundColor: "#00000000",
    // Fully transparent background
    fullscreenable: false,
    focusable: true,
    // Allow interaction
    webPreferences: {
      preload: (0, import_path.join)(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  if (isDev) {
    const url = process.env.VITE_DEV_SERVER_URL + "#/popup";
    console.log(`Popup window loading URL (dev): ${url}`);
    popupWindow.loadURL(url);
    popupWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    const filePath = (0, import_path.join)(__dirname, "..", "dist", "index.html");
    console.log(
      `Popup window loading file (prod): ${filePath} with hash #popup`
    );
    popupWindow.loadFile(filePath, {
      hash: "popup"
    });
  }
  popupWindow.webContents.on("did-start-loading", () => {
    console.log("Popup window: did-start-loading");
  });
  try {
    popupWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    console.log("Popup setVisibleOnAllWorkspaces successful");
  } catch (e) {
    console.error("Failed to setVisibleOnAllWorkspaces for popup:", e);
  }
  popupWindow.on("closed", () => {
    console.log("Popup window closed");
    popupWindow = null;
  });
  popupWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      console.error(
        `Popup did-fail-load: ${errorDescription} (${errorCode}) for ${validatedURL}`
      );
    }
  );
  popupWindow.webContents.on(
    "did-fail-provisional-load",
    (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      console.error(
        `Popup did-fail-provisional-load: ${errorDescription} (${errorCode}) for ${validatedURL}`
      );
    }
  );
  popupWindow.on("unresponsive", () => {
    console.error("Popup window became unresponsive");
  });
  popupWindow.webContents.on("did-finish-load", async () => {
    try {
      const hash = await popupWindow.webContents.executeJavaScript(`window.location.hash`);
      console.log(`Renderer process hash (did-finish-load): ${hash}`);
      const mainProcessHash = popupWindow.webContents.getURL().split("#")[1] ? "#" + popupWindow.webContents.getURL().split("#")[1] : "";
      console.log(`Main process URL hash: ${mainProcessHash}`);
      if (hash === "#popup" && mainProcessHash === "#popup") {
        console.log(
          "Both renderer and main process confirm #popup hash. Popup component should be rendered."
        );
      } else {
        console.error(
          `Hash mismatch or incorrect hash: Renderer: ${hash}, Main Process URL: ${mainProcessHash}. Popup component might not be rendered.`
        );
      }
    } catch (e) {
      console.error("Failed to get hash from renderer:", e);
    }
  });
}
function togglePopup() {
  if (!popupWindow) {
    console.log("togglePopup: popupWindow is null, attempting to create it.");
    createPopupWindow();
    if (!popupWindow) {
      console.error("togglePopup: Failed to create popupWindow.");
      return;
    }
  }
  const currentPopupWindow = popupWindow;
  console.log("togglePopup called, popupWindow exists.");
  if (currentPopupWindow.isVisible()) {
    console.log("Popup is visible, hiding...");
    currentPopupWindow.hide();
  } else {
    console.log("Popup is hidden, showing...");
    const display = import_electron.screen.getDisplayNearestPoint(
      import_electron.screen.getCursorScreenPoint()
    );
    const workArea = display.workArea;
    const { width, height } = currentPopupWindow.getBounds();
    const targetX = Math.round(workArea.x + (workArea.width - width) / 2);
    const targetY = Math.round(workArea.y + (workArea.height - height) / 2);
    currentPopupWindow.setPosition(targetX, targetY, false);
    currentPopupWindow.show();
    currentPopupWindow.focus();
    currentPopupWindow.webContents.send("focus-search");
  }
}
function createTray() {
  console.log("createTray called");
  const trayIconPath = (0, import_path.join)(__dirname, "trayTemplate.png");
  let image;
  console.log(`Attempting to load tray icon from: ${trayIconPath}`);
  try {
    image = import_electron.nativeImage.createFromPath(trayIconPath);
    if (image && !image.isEmpty()) {
      image.setTemplateImage(true);
      console.log("Tray icon loaded successfully.");
    } else {
      console.warn(
        "Tray icon 'trayTemplate.png' not found or is empty. Using empty image."
      );
      image = import_electron.nativeImage.createEmpty();
    }
  } catch (err) {
    console.error("Failed to load tray icon:", err);
    image = import_electron.nativeImage.createEmpty();
  }
  if (!image || image.isEmpty()) {
    console.log("Ensuring valid (empty) image for tray.");
    image = import_electron.nativeImage.createEmpty();
  }
  tray = new import_electron.Tray(image);
  tray.setToolTip("Command Helper");
  console.log("Tray created and tooltip set.");
  const contextMenu = import_electron.Menu.buildFromTemplate([
    { label: "Show Main App", click: () => mainWindow?.show() },
    { label: "Toggle Command Palette", click: () => togglePopup() },
    { type: "separator" },
    { label: "Quit", role: "quit" }
  ]);
  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    console.log("Tray clicked, toggling popup...");
    togglePopup();
  });
}
function registerShortcuts() {
  console.log("registerShortcuts called");
  const accelerator = "CommandOrControl+Shift+D";
  import_electron.globalShortcut.register(accelerator, () => {
    console.log(`Global shortcut ${accelerator} pressed, toggling popup...`);
    togglePopup();
  });
  console.log(`Global shortcut ${accelerator} registered.`);
  import_electron.app.on("will-quit", () => {
    console.log("App will quit, unregistering global shortcuts.");
    import_electron.globalShortcut.unregisterAll();
  });
}
import_electron.ipcMain.handle("get-all-commands", async () => {
  console.log(
    "MAIN PROCESS: \u{1F680} Received 'get-all-commands' request. Fetching data..."
  );
  try {
    const commands = await getAllCommands();
    console.log(`MAIN PROCESS: \u2705 Returning ${commands.length} commands.`);
    return commands;
  } catch (error) {
    console.error(
      "MAIN PROCESS: \u274C Error during DB fetch (check db.js):",
      error
    );
    return [];
  }
});
import_electron.app.whenReady().then(async () => {
  console.log("App is ready.");
  await setupDatabaseAndSync();
  createMainWindow();
  createPopupWindow();
  createTray();
  registerShortcuts();
  import_electron.ipcMain.on("toggle-popup", () => {
    console.log("IPC 'toggle-popup' received, toggling popup...");
    togglePopup();
  });
  import_electron.app.on("activate", () => {
    console.log("App activated (macOS)");
    if (mainWindow === null) {
      console.log("Main window null on activate, recreating.");
      createMainWindow();
    } else {
      console.log("Main window exists on activate, showing.");
      mainWindow.show();
    }
  });
});
import_electron.app.on("window-all-closed", () => {
  console.log("All windows closed.");
  if (process.platform !== "darwin") {
    console.log("Quitting app (not macOS).");
    import_electron.app.quit();
  } else {
    console.log("App remains in tray (macOS).");
  }
});
import_electron.app.on("before-quit", () => {
  console.log("App before-quit, unregistering global shortcuts.");
  import_electron.globalShortcut.unregisterAll();
});
