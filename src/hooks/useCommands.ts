// src/hooks/useCommands.ts
import { useState, useEffect } from "react";
// 💡 Import the updated interfaces
import { Command } from "../data/Command";

// @ts-ignore: Electron's IPC bridge is attached to the window object via the preload script
//const electronApi = window.electronAPI || {};
const electronApi = (window as any).electronAPI || {};

export function useCommands() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommands = async () => {
    if (!electronApi.getAllCommands) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // CALL THE MAIN PROCESS VIA IPC
      const data: Command[] = await electronApi.getAllCommands();

      // 💡 DEBUG LOG 1: Check the data coming from the Main Process
      console.log("useCommands: ✅ Data fetched from DB.");
      console.log(`useCommands: Found ${data.length} commands.`);
      // 💡 The 'data' received here will have the fully parsed 'variations' array
      // because electron/db.js handled the JSON parsing during retrieval.

      // 💡 DEBUG LOG 2: Inspect the structure of the first command
      if (data.length > 0) {
        console.log("useCommands: First command structure:", data[0]);
        // 💡 Crucial check: are the variations present?
        console.log(
          "useCommands: First command variations length:",
          data[0].variations?.length
        );
      }

      setCommands(data);
    } catch (err) {
      console.error("Failed to load commands from DB:", err);
      setError(
        "Failed to load commands. Check database connection or sync status."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if the IPC bridge exists (i.e., running in Electron with preload)
    if (electronApi.getAllCommands) {
      fetchCommands();
    } else {
      // Fallback for when running outside of Electron (e.g., in a browser dev server)
      console.warn(
        "Electron API bridge not found. Using static data or showing empty state."
      );
      setIsLoading(false);
      // You might add a development-only static import here if necessary
    }
  }, []);

  // Return the data, loading state, and potential errors
  return { commands, isLoading, error, refreshCommands: fetchCommands };
}
