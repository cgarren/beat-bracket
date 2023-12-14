import React, { createContext } from "react";

export const MixpanelContext = createContext();

export function MixpanelProvider({ children, mixpanel }) {
  return <MixpanelContext.Provider value={mixpanel}>{children}</MixpanelContext.Provider>;
}
