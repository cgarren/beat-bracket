import React, { createContext, useState, useEffect, useMemo } from "react";
import { useSpotify } from "../hooks/useSpotify";
import { navigate } from "gatsby";
export const LoginContext = createContext([null, () => {}]);

export function LoginProvider({ children }) {
    // auth storage keys

    // state variables
    const [loginInProgress, setLoginInProgress] = useState(false);
    // set logininfo from localstorage on page load
    const [loginInfo, setLoginInfo] = useState({
        userId: localStorage.getItem("userId"),
        accessToken: localStorage.getItem("accessToken"),
        sessionId: localStorage.getItem("sessionId"),
        expiresAt: localStorage.getItem("expiresAt"),
        refreshToken: localStorage.getItem("refreshToken"),
    });
    const [userInfo, setUserInfo] = useState(null);
    const [timerId, setTimerId] = useState(null);

    // loggedIn status
    const loggedIn = useMemo(() => {
        let expiresAtDate = new Date(parseInt(loginInfo.expiresAt, 10));
        if (
            loginInfo.accessToken &&
            loginInfo.sessionId &&
            loginInfo.userId &&
            loginInfo.expiresAt &&
            expiresAtDate.toString() !== "Invalid Date" &&
            Date.now() < expiresAtDate
        ) {
            console.debug("logged in");
            return true;
        }
        console.debug("not logged in");
        return false;
    }, [loginInfo]);

    const { getCurrentUserInfo } = useSpotify();

    // keep loginInfo in sync with localstorage
    useEffect(() => {
        // set new loginInfo object when localstorage changes in another tab
        if (typeof window !== "undefined") {
            window.onstorage = async (e) => {
                console.debug("UPDATING INFO FROM STORAGE");
                const { key, newValue } = e;
                if (key in loginInfo) {
                    setLoginInfo({
                        ...loginInfo,
                        [key]: newValue,
                    });
                }
            };
        } else {
            return null;
        }
        return () => {
            window.onstorage = null;
        };
    }, [loginInfo, setLoginInfo]);

    // keep localstorage in sync with loginInfo
    useEffect(() => {
        for (const key in loginInfo) {
            if (loginInfo[key]) {
                localStorage.setItem(key, loginInfo[key]);
            } else {
                localStorage.removeItem(key);
            }
        }
    }, [loginInfo]);

    // keep userInfo in sync with loginInfo
    useEffect(() => {
        if (loginInfo.accessToken !== null && loggedIn) {
            getCurrentUserInfo(loginInfo.accessToken).then((info) => {
                setUserInfo(info);
            });
        } else {
            setUserInfo(null);
        }
    }, [loginInfo.accessToken, getCurrentUserInfo, loggedIn]);

    // redirect to login page on logout
    useEffect(() => {
        if (
            loginInfo.accessToken === undefined &&
            loginInfo.sessionId === undefined &&
            loginInfo.userId === undefined &&
            loginInfo.expiresAt === undefined &&
            loginInfo.refreshToken === undefined
        ) {
            console.debug("Just logged out, redirecting to home page");
            navigate("/");
        }
    }, [loginInfo, loggedIn, loginInProgress, timerId]);

    // useEffect(() => {
    //     console.log("loggedIn:", loggedIn);
    //     if (!loggedIn) {
    //         // display some kind fo error?
    //     }
    // }, [loggedIn]);

    return (
        <LoginContext.Provider
            value={{
                loggedIn,
                loginInfo,
                setLoginInfo,
                userInfo,
                setUserInfo,
                loginInProgress,
                setLoginInProgress,
                timerId,
                setTimerId,
            }}
        >
            {children}
        </LoginContext.Provider>
    );
}
