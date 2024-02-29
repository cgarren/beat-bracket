import React, { createContext, useState, useMemo } from "react";

export const LoginContext = createContext([null, () => {}]);

export function LoginProvider({ children }) {
  // state variables
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [showLoginExpiredModal, setShowLoginExpiredModal] = useState(false);
  const [setupDone, setSetupDone] = useState(false);

  const contextValue = useMemo(
    () => ({
      loginInProgress,
      setLoginInProgress,
      showLoginExpiredModal,
      setShowLoginExpiredModal,
      setupDone,
      setSetupDone,
    }),
    [loginInProgress, setLoginInProgress, showLoginExpiredModal, setShowLoginExpiredModal, setupDone, setSetupDone],
  );

  return <LoginContext.Provider value={contextValue}>{children}</LoginContext.Provider>;
}
