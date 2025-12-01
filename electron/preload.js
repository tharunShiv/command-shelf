var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("electronAPI", {
  togglePopup: () => import_electron.ipcRenderer.send("toggle-popup"),
  onFocusSearch: (callback) => {
    const listener = () => callback();
    import_electron.ipcRenderer.on("focus-search", listener);
    return () => import_electron.ipcRenderer.off("focus-search", listener);
  },
  // 💥 NEW: Expose the IPC function using invoke for request/response
  getAllCommands: () => import_electron.ipcRenderer.invoke("get-all-commands"),
  checkForUpdates: () => import_electron.ipcRenderer.invoke("check-for-updates"),
  addCustomCommand: (command) => import_electron.ipcRenderer.invoke("add-custom-command", command),
  deleteCustomCommand: (id) => import_electron.ipcRenderer.invoke("delete-custom-command", id)
});
