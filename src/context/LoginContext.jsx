import React, { createContext, useState, useEffect, useMemo } from "react";
import { useSpotify } from "../hooks/useSpotify";
export const LoginContext = createContext([null, () => {}]);

export function LoginProvider({ children }) {
    // auth storage keys

    const refreshTokenKey = "refresh_token";
    const accessTokenKey = "access_token";
    const expiresAtKey = "expires_at";
    const sessionKey = "session_id";
    const userIdKey = "user_id";

    // state variables
    const [loginInProgress, setLoginInProgress] = useState(false);
    const loginInfo = {
        userId: sessionStorage.getItem(userIdKey),
        accessToken: sessionStorage.getItem(accessTokenKey),
        sessionId: sessionStorage.getItem(sessionKey),
        expiresAt: sessionStorage.getItem(expiresAtKey),
        refreshToken: localStorage.getItem(refreshTokenKey),
    };
    const [userInfo, setUserInfo] = useState(null);
    const [timerId, setTimerId] = useState(null);
    const loggedIn = useMemo(() => {
        if (typeof sessionStorage !== "undefined") {
            let expiresAtDate = new Date(parseInt(loginInfo.expiresAt, 10));
            if (
                loginInfo.expiresAt &&
                loginInfo.accessToken &&
                expiresAtDate.toString() !== "Invalid Date" &&
                Date.now() < expiresAtDate
            ) {
                //console.debug("logged in");
                return true;
            }
        }
        console.log("not logged in");
        return false;
    }, [loginInfo.expiresAt, loginInfo.accessToken]);

    const { getCurrentUserInfo } = useSpotify();

    const [, updateState] = useState();

    console.log("init loggedIn:", loggedIn);

    useEffect(() => {
        // set new loginInfo object when localstorage changes
        if (typeof window !== "undefined") {
            window.onstorage = async () => {
                console.log("UPDATING INFO FROM STORAGE");
                updateState();
            };
        } else {
            return null;
        }
        return () => {
            window.onstorage = null;
        };
    }, []);

    useEffect(() => {
        // set new userInfo object when loginInfo changes
        if (loggedIn && loginInfo.accessToken) {
            console.log("getting user info");
            getCurrentUserInfo(loginInfo.accessToken).then((info) => {
                setUserInfo(info);
            });
        }
    }, [loggedIn, loginInfo.accessToken, getCurrentUserInfo]);

    return (
        <LoginContext.Provider
            value={{
                loggedIn,
                loginInfo,
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
