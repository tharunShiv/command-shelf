// preload.ts
import { contextBridge, ipcRenderer } from "electron";

// 💡 1. Update the Interface: Add the IPC function signature
interface ElectronAPI {
  togglePopup: () => void;
  onFocusSearch: (callback: () => void) => () => void;

  /**
   * Invokes the main process to fetch all commands from the DB.
   * Returns a Promise that resolves to an array of Command objects.
   */
  getAllCommands: () => Promise<any[]>; // Use 'any[]' since the specific Command type is in the renderer bundle

  checkForUpdates: () => Promise<string | null>;
  addCustomCommand: (command: any) => Promise<{ success: boolean; error?: string }>;
  deleteCustomCommand: (id: string) => Promise<{ success: boolean; error?: string }>;
}

// 💡 2. Update the Exposure: Add the implementation
contextBridge.exposeInMainWorld("electronAPI", {
  togglePopup: () => ipcRenderer.send("toggle-popup"),

  onFocusSearch: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on("focus-search", listener);
    return () => ipcRenderer.off("focus-search", listener);
  },

  // 💥 NEW: Expose the IPC function using invoke for request/response
  getAllCommands: () => ipcRenderer.invoke("get-all-commands"),

  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),

  addCustomCommand: (command: any) => ipcRenderer.invoke("add-custom-command", command),
  deleteCustomCommand: (id: string) => ipcRenderer.invoke("delete-custom-command", id),
} as ElectronAPI); // Cast to ElectronAPI to ensure types match
