import {
  app,
  BrowserWindow,
  Menu,
  Tray,
  globalShortcut,
  screen,
  nativeImage,
  ipcMain,
} from "electron";
import { join } from "path";

const {
  initDb,
  updateCommands,
  getAllCommands,
  getLocalDataVersion,
} = require("./db");

// We compile to CJS, __dirname is available

let mainWindow: BrowserWindow | null = null;
let popupWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const isDev =
  process.env.VITE_DEV_SERVER_URL || process.env.NODE_ENV === "development";

// ----------------------------------------------------------------------
// 💡 NEW: DATABASE AND SYNC SETUP LOGIC
// ----------------------------------------------------------------------

async function setupDatabaseAndSync() {
  try {
    await initDb();
    console.log(
      `MAIN PROCESS: Local command data version: ${getLocalDataVersion()}`
    );

    // 1. Check for remote updates
    // 💡 CHANGE THIS URL to your actual GitHub raw link!
    const VERSION_URL =
      "https://raw.githubusercontent.com/tharunShiv/command-helper-data-source/refs/heads/main/commands_version.json";

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

      // 2. Download full command data
      const dataResponse = await fetch(remoteVersion.dataUrl);

      if (!dataResponse.ok) {
        console.error(
          `MAIN PROCESS: Failed to download full data from GitHub: ${dataResponse.status}`
        );
        return;
      }

      const newCommands = await dataResponse.json();

      // 💥 DEBUG LOG D: Confirm data was downloaded successfully
      console.log(
        `MAIN PROCESS: ✅ Downloaded ${newCommands.length} command objects.`
      );

      // 3. Update local database
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
  mainWindow = new BrowserWindow({
    fullscreen: !isDev, // Fullscreen in production, defined size in dev
    width: isDev ? 1280 : undefined,
    height: isDev ? 800 : undefined,
    show: false, // Start hidden - only show via tray menu action
    titleBarStyle: "hiddenInset",
    backgroundColor: "#0b0b0c",
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    const url = process.env.VITE_DEV_SERVER_URL as string;
    console.log(`Main window loading URL (dev): ${url}`);
    mainWindow.loadURL(url);
    // Help diagnose renderer issues during development
    mainWindow.webContents.openDevTools({ mode: "detach" });
    mainWindow.webContents.on(
      "did-fail-load",
      (
        event: Electron.Event,
        errorCode: number,
        errorDescription: string,
        validatedURL: string,
        isMainFrame: boolean
      ) => {
        console.error(
          `Main did-fail-load: ${errorDescription} (${errorCode}) for ${validatedURL}`
        );
      }
    );
    mainWindow.webContents.on(
      "did-fail-provisional-load",
      (
        event: Electron.Event,
        errorCode: number,
        errorDescription: string,
        validatedURL: string,
        isMainFrame: boolean
      ) => {
        console.error(
          `Main did-fail-provisional-load: ${errorDescription} (${errorCode}) for ${validatedURL}`
        );
      }
    );
    mainWindow.on("unresponsive", () => {
      console.error("Main window became unresponsive");
    });
  } else {
    const filePath = join(__dirname, "..", "dist", "index.html");
    console.log(`Main window loading file (prod): ${filePath}`);
    mainWindow.loadFile(filePath);
  }

  mainWindow.once("ready-to-show", () => {
    console.log("Main window ready-to-show");
    // Don't auto-show main window - only show via tray menu
    // mainWindow?.show(); // Commented out to prevent auto-showing
  });

  mainWindow.on("closed", () => {
    console.log("Main window closed");
    mainWindow = null;
  });
}

function createPopupWindow() {
  console.log("createPopupWindow called");
  // Small floating popup that can appear even if the app is not focused
  popupWindow = new BrowserWindow({
    width: 600, // Current width
    height: 500, // Increased height for better fit
    maxHeight: 600, // Optional: Maximum height it can grow to
    show: false, // Start hidden
    frame: false, // No window frame
    resizable: true, // Allow resizing
    movable: true,
    alwaysOnTop: true, // Crucial for staying on top
    skipTaskbar: true, // Don't show in taskbar/dock
    backgroundColor: "#00000000", // Fully transparent background
    fullscreenable: false,
    focusable: true, // Allow interaction
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    const url = (process.env.VITE_DEV_SERVER_URL as string) + "#/popup";
    console.log(`Popup window loading URL (dev): ${url}`);
    popupWindow.loadURL(url);
    // Always open DevTools for popup in dev mode for debugging
    popupWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    const filePath = join(__dirname, "..", "dist", "index.html");
    console.log(
      `Popup window loading file (prod): ${filePath} with hash #popup`
    );
    popupWindow.loadFile(filePath, {
      hash: "popup",
    });
  }

  // Add a log to confirm if loading starts
  popupWindow.webContents.on("did-start-loading", () => {
    console.log("Popup window: did-start-loading");
  });

  // Ensure the popup sits above full-screen apps and across spaces on macOS
  try {
    popupWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    console.log("Popup setVisibleOnAllWorkspaces successful");
  } catch (e) {
    console.error("Failed to setVisibleOnAllWorkspaces for popup:", e);
  }

  // **CRUCIAL FOR DEBUGGING**: Prevent the window from closing
  popupWindow.on("closed", () => {
    console.log("Popup window closed");
    popupWindow = null;
  });

  // Additional error logging for popup window
  popupWindow.webContents.on(
    "did-fail-load",
    (
      event: Electron.Event,
      errorCode: number,
      errorDescription: string,
      validatedURL: string,
      isMainFrame: boolean
    ) => {
      console.error(
        `Popup did-fail-load: ${errorDescription} (${errorCode}) for ${validatedURL}`
      );
    }
  );
  popupWindow.webContents.on(
    "did-fail-provisional-load",
    (
      event: Electron.Event,
      errorCode: number,
      errorDescription: string,
      validatedURL: string,
      isMainFrame: boolean
    ) => {
      console.error(
        `Popup did-fail-provisional-load: ${errorDescription} (${errorCode}) for ${validatedURL}`
      );
    }
  );
  popupWindow.on("unresponsive", () => {
    console.error("Popup window became unresponsive");
  });

  // Request and log the hash from the renderer as soon as the page loads
  popupWindow.webContents.on("did-finish-load", async () => {
    try {
      // Use executeJavaScript to get the hash directly from the renderer
      const hash = await (
        popupWindow as BrowserWindow
      ).webContents.executeJavaScript(`window.location.hash`);
      console.log(`Renderer process hash (did-finish-load): ${hash}`);

      // Also, directly check the hash in the main process context
      const mainProcessHash = (popupWindow as BrowserWindow).webContents
        .getURL()
        .split("#")[1]
        ? "#" +
          (popupWindow as BrowserWindow).webContents.getURL().split("#")[1]
        : "";
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
  // Ensure popupWindow exists. If not, create it.
  if (!popupWindow) {
    console.log("togglePopup: popupWindow is null, attempting to create it.");
    createPopupWindow();
    // After creation, if it's still null (e.g., failed to create), then return.
    if (!popupWindow) {
      console.error("togglePopup: Failed to create popupWindow.");
      return;
    }
  }

  // Now that popupWindow is guaranteed to exist, proceed.
  const currentPopupWindow = popupWindow; // Use a local variable for null safety
  console.log("togglePopup called, popupWindow exists.");

  if (currentPopupWindow.isVisible()) {
    console.log("Popup is visible, hiding...");
    currentPopupWindow.hide();
  } else {
    console.log("Popup is hidden, showing...");
    // Center popup on the active display
    const display = screen.getDisplayNearestPoint(
      screen.getCursorScreenPoint()
    );
    const workArea = display.workArea;
    const { width, height } = currentPopupWindow.getBounds();
    const targetX = Math.round(workArea.x + (workArea.width - width) / 2);
    const targetY = Math.round(workArea.y + (workArea.height - height) / 2);
    currentPopupWindow.setPosition(targetX, targetY, false);

    currentPopupWindow.show();
    currentPopupWindow.focus();
    // Signal renderer to focus its search input
    currentPopupWindow.webContents.send("focus-search");
  }
}

function createTray() {
  console.log("createTray called");
  const trayIconPath = join(__dirname, "trayTemplate.png");
  let image: Electron.NativeImage | undefined;
  console.log(`Attempting to load tray icon from: ${trayIconPath}`);

  try {
    image = nativeImage.createFromPath(trayIconPath);
    if (image && !image.isEmpty()) {
      image.setTemplateImage(true); // Adapts to light/dark menu bar
      console.log("Tray icon loaded successfully.");
    } else {
      console.warn(
        "Tray icon 'trayTemplate.png' not found or is empty. Using empty image."
      );
      image = nativeImage.createEmpty(); // Fallback
    }
  } catch (err) {
    console.error("Failed to load tray icon:", err);
    image = nativeImage.createEmpty(); // Fallback on error
  }

  // Ensure we always have a valid image for the tray
  if (!image || image.isEmpty()) {
    console.log("Ensuring valid (empty) image for tray.");
    image = nativeImage.createEmpty();
  }

  tray = new Tray(image);
  tray.setToolTip("Command Helper");
  console.log("Tray created and tooltip set.");

  const contextMenu = Menu.buildFromTemplate([
    { label: "Show Main App", click: () => mainWindow?.show() },
    { label: "Toggle Command Palette", click: () => togglePopup() },
    { type: "separator" },
    { label: "Quit", role: "quit" },
  ]);
  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    console.log("Tray clicked, toggling popup...");
    togglePopup(); // Click opens/closes popup
  });
}

function registerShortcuts() {
  console.log("registerShortcuts called");
  // Global shortcut to toggle the popup (Cmd+Shift+D on Mac, Ctrl+Shift+D on Win/Linux)
  const accelerator = "CommandOrControl+Shift+D";
  globalShortcut.register(accelerator, () => {
    console.log(`Global shortcut ${accelerator} pressed, toggling popup...`);
    togglePopup();
  });
  console.log(`Global shortcut ${accelerator} registered.`);

  app.on("will-quit", () => {
    console.log("App will quit, unregistering global shortcuts.");
    globalShortcut.unregisterAll();
  });
}

ipcMain.handle("get-all-commands", async () => {
  // 💥 CRUCIAL LOG: This confirms the Main Process received the request.
  console.log(
    "MAIN PROCESS: 🚀 Received 'get-all-commands' request. Fetching data..."
  );

  try {
    const commands = await getAllCommands();
    console.log(`MAIN PROCESS: ✅ Returning ${commands.length} commands.`);
    return commands;
  } catch (error) {
    console.error(
      "MAIN PROCESS: ❌ Error during DB fetch (check db.js):",
      error
    );
    return [];
  }
});

app.whenReady().then(async () => {
  // 💡 CHANGE: Must be async now
  console.log("App is ready.");

  // 💡 NEW: Run DB setup and sync first, awaiting completion
  await setupDatabaseAndSync();

  createMainWindow();
  createPopupWindow();
  createTray();
  registerShortcuts();

  // IPC for renderer to request popup toggle (if needed)
  ipcMain.on("toggle-popup", () => {
    console.log("IPC 'toggle-popup' received, toggling popup...");
    togglePopup();
  });

  // Handle app activation on macOS (e.g., clicking dock icon if it's shown)
  app.on("activate", () => {
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

// Quit when all windows are closed, unless on macOS (then keep in tray)
app.on("window-all-closed", () => {
  console.log("All windows closed.");
  if (process.platform !== "darwin") {
    console.log("Quitting app (not macOS).");
    app.quit();
  } else {
    console.log("App remains in tray (macOS).");
  }
});

// On macOS, if the main window is closed, ensure the app still runs in the background
// but doesn't exit until explicitly told to quit.
// This is redundant with "window-all-closed" if only one window exists but good practice.
app.on("before-quit", () => {
  console.log("App before-quit, unregistering global shortcuts.");
  globalShortcut.unregisterAll();
  // Clean up if you registered any other native resources
});
