import { contextBridge, ipcRenderer } from "electron";

interface ElectronAPI {
  togglePopup: () => void;
  onFocusSearch: (callback: () => void) => () => void;
}

contextBridge.exposeInMainWorld("electronAPI", {
  togglePopup: () => ipcRenderer.send("toggle-popup"),
  onFocusSearch: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on("focus-search", listener);
    return () => ipcRenderer.off("focus-search", listener);
  },
});
