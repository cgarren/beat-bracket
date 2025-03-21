import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const SAVE_THRESHOLDS = {
  CHANGES: 5, // Save after 5 changes
  TIME: 60000, // Save after 60 seconds
  FORCE: true, // Always save on winner
};

export default function useBracketSync({ bracketId, ownerId, saveMutation }) {
  const [lastServerSync, setLastServerSync] = useState(Date.now());
  const [changesSinceSync, setChangesSinceSync] = useState(0);
  const [syncStatus, setSyncStatus] = useState("synced"); // "synced" | "local" | "syncing" | "error"
  const [syncError, setSyncError] = useState(null);

  // Clean up old brackets from localStorage
  const cleanupOldBrackets = useCallback(() => {
    const keys = Object.keys(localStorage);
    const bracketKeys = keys.filter((key) => key.startsWith("bracket_"));
    const brackets = bracketKeys.map((key) => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        return {
          key,
          timestamp: data.timestamp,
        };
      } catch (e) {
        return { key, timestamp: 0 };
      }
    });

    // Sort by timestamp and remove oldest if we have more than 10
    if (brackets.length > 10) {
      brackets
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(0, brackets.length - 10)
        .forEach((bracket) => {
          localStorage.removeItem(bracket.key);
        });
    }
  }, []);

  // Save to localStorage
  const saveLocal = useCallback(
    (bracketData) => {
      try {
        const saveObj = {
          data: bracketData,
          timestamp: Date.now(),
          bracketId,
          ownerId,
        };
        localStorage.setItem(`bracket_${bracketId}`, JSON.stringify(saveObj));
        setSyncStatus("local");
        setChangesSinceSync((prev) => prev + 1);
        return true;
      } catch (e) {
        console.error("Error saving to localStorage:", e);
        if (e.name === "QuotaExceededError") {
          // Clean up old data
          cleanupOldBrackets();
          // Try again
          try {
            localStorage.setItem(`bracket_${bracketId}`, JSON.stringify(bracketData));
            return true;
          } catch (retryError) {
            console.error("Error saving to localStorage after cleanup:", retryError);
            return false;
          }
        }
        return false;
      }
    },
    [bracketId, cleanupOldBrackets, ownerId],
  );

  // Save to server
  const saveServer = useCallback(
    async (bracketData) => {
      try {
        setSyncStatus("syncing");
        await saveMutation(bracketData);
        setLastServerSync(Date.now());
        setChangesSinceSync(0);
        setSyncStatus("synced");
        setSyncError(null);
        return true;
      } catch (error) {
        console.error("Error saving to server:", error);
        setSyncStatus("error");
        setSyncError(error);
        return false;
      }
    },
    [saveMutation],
  );

  // Check if we should sync to server
  const shouldSyncToServer = useCallback(
    (isWinner = false, forceSync = false) => {
      if (forceSync) return true;
      if (isWinner && SAVE_THRESHOLDS.FORCE) return true;
      if (changesSinceSync >= SAVE_THRESHOLDS.CHANGES) return true;
      if (Date.now() - lastServerSync >= SAVE_THRESHOLDS.TIME) return true;
      return false;
    },
    [changesSinceSync, lastServerSync],
  );

  // Main save function
  const saveBracket = useCallback(
    async (bracketData, isWinner = false, forceSync = false) => {
      // Always save locally
      const localSaved = saveLocal(bracketData);
      if (!localSaved) {
        toast.error("Error saving bracket locally!");
        return false;
      }

      // Check if we should sync to server
      if (shouldSyncToServer(isWinner, forceSync)) {
        const serverSaved = await saveServer(bracketData);
        if (!serverSaved && (isWinner || forceSync)) {
          toast.error("Error saving bracket to server! Your progress is saved locally.");
        }
        return serverSaved;
      }

      return true;
    },
    [saveLocal, saveServer, shouldSyncToServer],
  );

  // Recovery function
  const recoverFromLocal = useCallback(() => {
    try {
      const localData = localStorage.getItem(`bracket_${bracketId}`);
      if (localData) {
        const parsed = JSON.parse(localData);
        if (parsed.bracketId === bracketId && parsed.ownerId === ownerId) {
          return parsed.data;
        }
      }
    } catch (e) {
      console.error("Error recovering from localStorage:", e);
    }
    return null;
  }, [bracketId, ownerId]);

  // Auto-sync effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (shouldSyncToServer()) {
        const localData = recoverFromLocal();
        if (localData) {
          saveServer(localData);
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [shouldSyncToServer, recoverFromLocal, saveServer]);

  return {
    saveBracket,
    recoverFromLocal,
    syncStatus,
    syncError,
    lastServerSync,
    changesSinceSync,
  };
}
