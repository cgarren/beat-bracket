// place for methods which handdle authenitcation for btoh spotify and backend
import { useContext, useCallback } from "react";
import { useSpotify } from "./useSpotify";
import { useHelper } from "./useHelper";
import { useBackend } from "./useBackend";
import { LoginContext } from "../context/LoginContext";
import { MixpanelContext } from "../context/MixpanelContext";

export const useAuthentication = () => {
    const mixpanel = useContext(MixpanelContext);
    const {
        getCurrentUserInfo,
        loginCallback: spotifyLoginCallback,
        login: spotifyLogin,
        refreshLogin: spotifyRefreshLogin,
    } = useSpotify();
    const { loginInfo, setLoginInfo, setLoginInProgress, timerId, setTimerId } =
        useContext(LoginContext);
    const { authenticate: backendLogin } = useBackend();
    const { generateRandomString } = useHelper();

    //auth functions

    const setLoginTimer = useCallback(
        (expiresAt, callbackFuncion) => {
            // clear timer if it exists
            if (timerId) {
                clearTimeout(timerId);
            }
            // refresh access token 1 minute before it expires
            const refreshTime = expiresAt - 60000 - Date.now();
            const tempTimerId = setTimeout(() => {
                callbackFuncion();
            }, refreshTime);
            setTimerId(tempTimerId);
            console.debug("set login timer for", refreshTime, "ms");
        },
        [timerId, setTimerId]
    );

    const logout = useCallback(async () => {
        // clear storage including refresh token key
        setLoginInfo({
            userId: undefined,
            accessToken: undefined,
            sessionId: undefined,
            expiresAt: undefined,
            refreshToken: undefined,
        });
        localStorage.clear();
        mixpanel.reset();
        // clear timer if it exists
        if (timerId) {
            clearTimeout(timerId);
        }
        console.log("logged out");
    }, [mixpanel, setLoginInfo, timerId]);

    const login = useCallback(async () => {
        // case where user has been here before
        try {
            setLoginInProgress(true);
            if (loginInfo.refreshToken) {
                try {
                    const { accessToken, refreshToken, expiresAt } =
                        await spotifyRefreshLogin(loginInfo.refreshToken);

                    console.debug("refreshed spotify session successfully");

                    // get info about user from spotify and set session storage
                    const res = await getCurrentUserInfo(accessToken);
                    const userId = res.id;

                    // get session id from session storage and set it if it doesn't exist
                    let sessionId = loginInfo.sessionId;
                    if (!sessionId) {
                        sessionId = generateRandomString(128);
                    }

                    // refresh backend
                    await backendLogin(
                        userId,
                        sessionId,
                        expiresAt,
                        accessToken
                    );

                    // identify user in mixpanel
                    mixpanel.identify(userId);

                    // set timer to refresh access token
                    setLoginTimer(expiresAt, login);
                    setLoginInfo({
                        sessionId: sessionId,
                        userId: userId,
                        accessToken: accessToken,
                        expiresAt: expiresAt,
                        refreshToken: refreshToken
                            ? refreshToken
                            : loginInfo.refreshToken,
                    });
                } catch (error) {
                    console.debug("Problem refreshing spotify login:");
                    console.error(error);
                    setLoginInfo({
                        ...loginInfo,
                        refreshToken: null,
                    });
                }
            } else {
                //kick off spotify login process
                await spotifyLogin();
            }
        } catch (error) {
            throw error;
        } finally {
            setLoginInProgress(false);
        }
    }, [
        backendLogin,
        getCurrentUserInfo,
        generateRandomString,
        loginInfo,
        mixpanel,
        setLoginInfo,
        setLoginInProgress,
        setLoginTimer,
        spotifyLogin,
        spotifyRefreshLogin,
    ]);

    const loginCallback = useCallback(
        async (urlParams) => {
            try {
                setLoginInProgress(true);
                // get data from spotify login callback and set session storage
                const { refreshToken, accessToken, expiresAt, state } =
                    await spotifyLoginCallback(urlParams);

                // get info about user from spotify and set session storage
                const res = await getCurrentUserInfo(accessToken);
                const userId = res.id;

                // use the state value for the new session id
                const sessionId = state;

                // authenticate with backend
                await backendLogin(userId, sessionId, expiresAt, accessToken);

                // identify user in mixpanel
                mixpanel.identify(userId);

                // set timer to refresh access token
                setLoginTimer(expiresAt, login);
                setLoginInfo({
                    sessionId: sessionId,
                    userId: userId,
                    accessToken: accessToken,
                    expiresAt: expiresAt,
                    refreshToken: refreshToken,
                });
                return { userId: userId, sessionId: sessionId };
            } catch (error) {
                if (error.message !== "Invalid url params") {
                    throw error;
                } else {
                    return "Invalid url parameters";
                }
            } finally {
                setLoginInProgress(false);
            }
        },
        [
            backendLogin,
            getCurrentUserInfo,
            mixpanel,
            setLoginInfo,
            spotifyLoginCallback,
            setLoginInProgress,
            setLoginTimer,
            login,
        ]
    );

    return {
        login,
        loginCallback,
        logout,
    };
};
