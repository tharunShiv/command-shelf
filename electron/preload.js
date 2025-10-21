var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("electronAPI", {
  togglePopup: () => import_electron.ipcRenderer.send("toggle-popup"),
  onFocusSearch: (callback) => {
    const listener = () => callback();
    import_electron.ipcRenderer.on("focus-search", listener);
    return () => import_electron.ipcRenderer.off("focus-search", listener);
  }
});
