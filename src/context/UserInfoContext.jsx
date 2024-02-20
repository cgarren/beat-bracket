import React, { createContext, useContext, useEffect } from "react";
import useUserInfo from "../hooks/useUserInfo";
import { MixpanelContext } from "./MixpanelContext";

export const UserInfoContext = createContext([null, () => {}]);

export function UserInfoProvider({ children }) {
  const mixpanel = useContext(MixpanelContext);

  // set logininfo from storage on page load
  const { data: userInfo } = useUserInfo();

  useEffect(() => {
    if (userInfo?.id) {
      mixpanel.identify(userInfo.id);
    }
  }, [userInfo.id]);

  return <UserInfoContext.Provider value={userInfo}>{children}</UserInfoContext.Provider>;
}
