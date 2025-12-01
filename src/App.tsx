import { useState, useEffect } from "react";
import { Terminal, Keyboard, Zap, Shield, Search } from "lucide-react";
import { CommandPalette } from "./components/CommandPalette";
import { useKeyboardShortcut } from "./hooks/useKeyboardShortcut";
import { useRecentCommands } from "./hooks/useRecentCommands";
import { Button } from "./components/ui/button";
import { Toaster, toast } from "sonner";

export default function App() {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const { recentCommandIds, addRecentCommand } = useRecentCommands();

  useEffect(() => {
    const electronApi = (window as any).electronAPI;
    if (electronApi && electronApi.checkForUpdates) {
      console.log("App.tsx: Checking for updates...");
      const check = async () => {
        const newVersion = await electronApi.checkForUpdates();
        console.log("App.tsx: Version check result:", newVersion);
        if (newVersion) {
          console.log("App.tsx: Showing toast for version:", newVersion);
          toast.custom(
            (t) => (
              <div
                className="rounded-xl shadow-2xl p-6 w-96"
                style={{
                  backgroundColor: "#09090b",
                  borderColor: "#27272a",
                  borderWidth: "1px",
                  borderStyle: "solid",
                }}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 rounded-xl text-white shrink-0">
                      <Zap className="size-6" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-semibold text-white text-base">
                        New version available
                      </h3>
                      <p className="text-sm text-gray-400" style={{ color: "#a1a1aa" }}>
                        Version {newVersion} is available.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-4 text-sm hover:bg-white/10 cursor-pointer active:scale-95 transition-transform"
                      style={{ color: "#a1a1aa" }}
                      onClick={() => toast.dismiss(t)}
                    >
                      Later
                    </Button>
                    <Button
                      size="sm"
                      className="h-9 px-4 text-sm font-medium cursor-pointer active:scale-95 transition-transform"
                      style={{
                        backgroundColor: "#ffffff",
                        color: "#000000",
                      }}
                      onClick={() => {
                        window.open(
                          "https://github.com/tharunShiv/command-helper/blob/main/README.md#-how-to-update-for-users",
                          "_blank"
                        );
                        toast.dismiss(t);
                        // Close the popup window
                        if (electronApi.togglePopup) {
                          electronApi.togglePopup();
                        }
                      }}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              </div>
            ),
            { duration: Infinity }
          );
        }
      };
      check();
    }
  }, []);

  // Global keyboard shortcut: Cmd+Shift+D (Mac) or Ctrl+Shift+D (Windows/Linux)
  useKeyboardShortcut(
    {
      key: "d",
      metaKey: true,
      shiftKey: true,
    },
    () => setIsPaletteOpen(true),
    !isPaletteOpen
  );

  const handleCommandUsed = (commandId: string) => {
    addRecentCommand(commandId);
  };

  return (
    <div className="min-h-screen bg-background">
      <CommandPalette
        isOpen={true} // Always open for the main app
        onClose={() => {
          /* No-op for main app, handled by Electron window close */
        }}
        recentCommandIds={recentCommandIds}
        onCommandUsed={handleCommandUsed}
        isOverlay={true} // Always fullscreen overlay
      />
      <Toaster position="top-center" style={{ zIndex: 99999 }} />
    </div>
  );
}
