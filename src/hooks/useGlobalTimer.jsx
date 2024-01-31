import { useCallback } from "react";

export default function useGlobalTimer() {
  const setTimer = useCallback((callback, delay, timerId = "") => {
    const storageKey = `timeout${timerId}`;
    if (sessionStorage.getItem(storageKey)) {
      clearTimeout(sessionStorage.getItem(storageKey));
      console.debug("replacing timer", timerId);
    }

    sessionStorage.setItem(
      storageKey,
      setTimeout(() => {
        sessionStorage.removeItem(storageKey);
        callback();
      }, delay),
    );
    console.debug("set timer", timerId, "for", delay, `(${new Date(Date.now() + delay).toLocaleTimeString()})`);
  }, []);

  const clearTimer = useCallback((timerId = "") => {
    const storageKey = `timeout${timerId}`;
    clearTimeout(sessionStorage.getItem(storageKey));
    console.debug("cancelled timer", timerId);
    sessionStorage.removeItem(storageKey);
  }, []);

  return {
    setTimer,
    clearTimer,
  };
}
