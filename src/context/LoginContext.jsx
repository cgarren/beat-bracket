import React, { createContext, useState, useEffect, useMemo } from "react";
import { navigate } from "gatsby";

export const LoginContext = createContext([null, () => {}]);

export function LoginProvider({ children }) {
  // state variables
  const [loginInProgress, setLoginInProgress] = useState(false);
  // set logininfo from storage on page load
  const [loginInfo, setLoginInfo] = useState(() => {
    if (typeof window === "undefined") {
      return {
        accessToken: null,
        backendToken: null,
        // expiresAt: null,
        refreshToken: null,
        fromStorage: true,
      };
    }
    return {
      accessToken: sessionStorage.getItem("accessToken"),
      backendToken: sessionStorage.getItem("backendToken"),
      // expiresAt: sessionStorage.getItem("expiresAt"),
      refreshToken: localStorage.getItem("refreshToken"),
    };
  });

  const spotifyLoggedIn = useMemo(() => loginInfo.accessToken !== null, [loginInfo]);
  const backendLoggedIn = useMemo(() => loginInfo.backendToken !== null, [loginInfo]);
  const loggedIn = useMemo(() => spotifyLoggedIn && backendLoggedIn, [spotifyLoggedIn, backendLoggedIn]);

  // // keep loginInfo in sync with localstorage
  // useEffect(() => {
  //   // set new loginInfo object when localstorage changes in another tab
  //   if (typeof window !== "undefined") {
  //     window.onstorage = async (e) => {
  //       console.debug("UPDATING INFO FROM STORAGE");
  //       const { key, newValue } = e;
  //       console.log(key, newValue, e);
  //       if (key === null) {
  //         console.log("setting login info to null");
  //         // setLoginInfo({
  //         //     userId: null,
  //         //     accessToken: null,
  //         //     backendToken: null,
  //         //     expiresAt: null,
  //         //     refreshToken: null,
  //         //     fromStorage: true,
  //         // });
  //       } else if (key in loginInfo) {
  //         setLoginInfo({
  //           ...loginInfo,
  //           [key]: newValue,
  //           fromStorage: true,
  //         });
  //       }
  //     };
  //   } else {
  //     return null;
  //   }
  //   return () => {
  //     window.onstorage = null;
  //   };
  // }, [loginInfo, setLoginInfo]);

  // keep localstorage in sync with loginInfo

  useEffect(() => {
    if (loginInfo && !loginInfo.fromStorage) {
      // console.debug("UPDATING STORAGE FROM INFO");
      Object.keys(loginInfo).forEach((key) => {
        if (key === "refreshToken" && loginInfo[key]) {
          localStorage.setItem(key, loginInfo[key]);
        } else if (loginInfo[key]) {
          sessionStorage.setItem(key, loginInfo[key]);
        } else {
          localStorage.removeItem(key);
        }
      });
    }
  }, [loginInfo]);

  // const setLoginTimer = useCallback(
  //     (expiresAt, callbackFuncion) => {
  //         // clear timer if it exists
  //         if (timerId) {
  //             clearTimeout(timerId);
  //         }
  //         // refresh access token 1 minute before it expires
  //         const refreshTime = 20000; //expiresAt - 60000 - Date.now();
  //         const tempTimerId = setTimeout(() => {
  //             callbackFuncion();
  //         }, refreshTime);
  //         setTimerId(tempTimerId);
  //         console.debug(
  //             "set login timer for",
  //             refreshTime,
  //             "ms from now. TimerId:",
  //             tempTimerId
  //         );
  //     },
  //     [timerId, setTimerId]
  // );

  const contextValue = useMemo(
    () => ({
      loggedIn,
      spotifyLoggedIn,
      backendLoggedIn,
      loginInfo,
      setLoginInfo,
      loginInProgress,
      setLoginInProgress,
    }),
    [loggedIn, loginInfo, setLoginInfo, loginInProgress, setLoginInProgress],
  );

  return <LoginContext.Provider value={contextValue}>{children}</LoginContext.Provider>;
}
