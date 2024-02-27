import React, { createContext, useState, useMemo, useCallback } from "react";

export const LoginContext = createContext([null, () => {}]);

export function LoginProvider({ children }) {
  // state variables
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [spotifyLoggedIn, setSpotifyLoggedIn] = useState(sessionStorage.getItem("accessToken") !== null);
  const [backendLoggedIn, setBackendLoggedIn] = useState(sessionStorage.getItem("backendToken") !== null);
  const [showLoginExpiredModal, setShowLoginExpiredModal] = useState(false);

  const loggedIn = useMemo(() => spotifyLoggedIn && backendLoggedIn, [spotifyLoggedIn, backendLoggedIn]);

  const isLoggedIn = useCallback(
    () =>
      Boolean(window !== undefined && sessionStorage.getItem("accessToken") && sessionStorage.getItem("backendToken")),
    [window],
  );

  const contextValue = useMemo(
    () => ({
      isLoggedIn,
      loggedIn,
      spotifyLoggedIn,
      setSpotifyLoggedIn,
      backendLoggedIn,
      setBackendLoggedIn,
      loginInProgress,
      setLoginInProgress,
      showLoginExpiredModal,
      setShowLoginExpiredModal,
    }),
    [
      loginInProgress,
      setLoginInProgress,
      spotifyLoggedIn,
      setSpotifyLoggedIn,
      backendLoggedIn,
      setBackendLoggedIn,
      showLoginExpiredModal,
      setShowLoginExpiredModal,
    ],
  );

  return <LoginContext.Provider value={contextValue}>{children}</LoginContext.Provider>;
}
