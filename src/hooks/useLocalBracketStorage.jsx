import { useCallback, useState, useEffect } from "react";

const SAVE_THRESHOLDS = {
  CHANGES: 5, // Save after 5 changes
  TIME: 60000, // Save after 60 seconds
};

export default function useLocalBracketStorage({ bracketId, ownerId }) {
  const [lastServerSync, setLastServerSync] = useState(Date.now());
  const [changesSinceSync, setChangesSinceSync] = useState(0);
  const [syncStatus, setSyncStatus] = useState("synced"); // "synced" | "local" | "syncing" | "error"
  const [localData, setLocalData] = useState(null);

  // Load data from localStorage on mount - just retrieve, don't make decisions
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(`bracket_${bracketId}`);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Only set local data if it matches the current owner
        if (parsedData.ownerId === ownerId) {
          setLocalData(parsedData);
          // Don't modify sync status here - let the parent component decide
        } else {
          // Clear invalid local data
          localStorage.removeItem(`bracket_${bracketId}`);
        }
      }
    } catch (e) {
      console.error("Error loading from localStorage:", e);
    }
  }, [bracketId, ownerId]);

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
      const saveObj = {
        data: bracketData,
        timestamp: Date.now(),
        bracketId,
        ownerId,
      };
      try {
        localStorage.setItem(`bracket_${bracketId}`, JSON.stringify(saveObj));
        setLocalData(saveObj);
        // Only set to local if we have changes since last sync
        if (changesSinceSync > 0) {
          setSyncStatus("local");
        }
        return true;
      } catch (e) {
        console.error("Error saving to localStorage:", e);
        if (e.name === "QuotaExceededError") {
          // Clean up old data
          cleanupOldBrackets();
          // Try again
          try {
            localStorage.setItem(`bracket_${bracketId}`, JSON.stringify(saveObj)); // Fixed: use saveObj here
            setLocalData(saveObj);
            if (changesSinceSync > 0) {
              setSyncStatus("local");
            }
            return true;
          } catch (retryError) {
            console.error("Error saving to localStorage after cleanup:", retryError);
            return false;
          }
        }
        return false;
      }
    },
    [bracketId, cleanupOldBrackets, ownerId, changesSinceSync],
  );

  // Check if we should sync to server
  const shouldSyncToServer = useCallback(
    (isWinner = false, forceSync = false) => {
      if (forceSync) return true;
      if (isWinner) return true;
      if (changesSinceSync >= SAVE_THRESHOLDS.CHANGES) return true;
      if (Date.now() - lastServerSync >= SAVE_THRESHOLDS.TIME) return true;
      return false;
    },
    [changesSinceSync, lastServerSync],
  );

  // Update sync status
  const updateSyncStatus = useCallback(
    (status) => {
      setSyncStatus(status);
      if (status === "synced") {
        setLastServerSync(Date.now());
        setChangesSinceSync(0);
        // Clear local data when synced to server
        localStorage.removeItem(`bracket_${bracketId}`);
        setLocalData(null);
      }
    },
    [bracketId],
  );

  // Clear local data without changing sync status
  const clearLocalData = useCallback(() => {
    localStorage.removeItem(`bracket_${bracketId}`);
    setLocalData(null);
  }, [bracketId]);

  return {
    saveLocal,
    shouldSyncToServer,
    changesSinceSync,
    lastServerSync,
    setChangesSinceSync,
    syncStatus,
    updateSyncStatus,
    localData,
    clearLocalData,
  };
}
