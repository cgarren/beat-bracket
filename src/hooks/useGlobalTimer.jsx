import { useCallback } from "react";

export const useGlobalTimer = () => {
    const setTimer = useCallback((callback, delay, timerId = "") => {
        const storageKey = "timeout" + timerId;
        if (localStorage.getItem(storageKey)) {
            clearTimeout(localStorage.getItem(storageKey));
            console.debug("cancelled timer", timerId);
        }

        localStorage.setItem(
            storageKey,
            setTimeout(() => {
                localStorage.removeItem(storageKey);
                callback();
            }, delay)
        );
        console.debug("set timer", timerId, "for", delay);
    }, []);

    const clearTimer = useCallback((timerId = "") => {
        const storageKey = "timeout" + timerId;
        clearTimeout(localStorage.getItem(storageKey));
        console.debug("cancelled timer", timerId);
        localStorage.removeItem(storageKey);
    }, []);

    return {
        setTimer,
        clearTimer,
    };
};
