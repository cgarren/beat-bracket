// place for methods which handdle authenitcation for btoh spotify and backend
import { useContext } from "react";
import { useSpotify } from "./useSpotify";
import { useHelper } from "./useHelper";
import { useBackend } from "./useBackend";
import { LoginContext } from "../context/LoginContext";
import { navigate } from "gatsby";

export const useAuthentication = () => {
    //auth storage keys

    const refreshTokenKey = "refresh_token";
    const accessTokenKey = "access_token";
    const expiresAtKey = "expires_at";
    const sessionKey = "session_id";
    const userIdKey = "user_id";

    const {
        getCurrentUserInfo,
        loginCallback: spotifyLoginCallback,
        login: spotifyLogin,
        refreshLogin: spotifyRefreshLogin,
    } = useSpotify();
    const { setLoginInProgress, timerId, setTimerId } =
        useContext(LoginContext);
    const { authenticate: backendLogin } = useBackend();
    const { generateRandomString } = useHelper();

    //auth functions

    function setLoginTimer(expiresAt) {
        // clear timer if it exists
        if (timerId) {
            clearTimeout(timerId);
        }
        // refresh access token 1 minute before it expires
        const refreshTime = expiresAt - 60000 - Date.now();
        const tempTimerId = setTimeout(() => {
            login();
        }, refreshTime);
        setTimerId(tempTimerId);
        console.debug("set login timer for", refreshTime, "ms");
    }

    async function logout() {
        // clear session storage and refresh token key
        sessionStorage.clear();
        localStorage.removeItem(refreshTokenKey);
        window.dispatchEvent(new Event("storage"));
        // clear timer if it exists
        if (timerId) {
            clearTimeout(timerId);
        }
        console.log("logged out, going home");
        navigate("/", { state: { logout: true } });
    }

    async function login() {
        // case where user has been here before
        try {
            setLoginInProgress(true);
            if (localStorage.getItem(refreshTokenKey)) {
                let accessToken, refreshToken, expiresAt;
                try {
                    ({ accessToken, refreshToken, expiresAt } =
                        await spotifyRefreshLogin(
                            localStorage.getItem(refreshTokenKey)
                        ));
                } catch (error) {
                    console.error(error);
                    localStorage.removeItem(refreshTokenKey);
                    login();
                    return;
                }

                sessionStorage.setItem(accessTokenKey, accessToken);
                sessionStorage.setItem(expiresAtKey, expiresAt);
                if (refreshToken) {
                    localStorage.setItem(refreshTokenKey, refreshToken);
                }

                console.debug("refreshed session successfully");
                window.dispatchEvent(new Event("storage"));

                // get info about user from spotify and set session storage
                const res = await getCurrentUserInfo(accessToken);
                console.log(res);
                const userId = res.id;

                sessionStorage.setItem(userIdKey, userId);

                // get session id from session storage and set it if it doesn't exist
                let sessionId = sessionStorage.getItem(sessionKey);
                if (!sessionId) {
                    sessionId = generateRandomString(128);
                    sessionStorage.setItem(sessionKey, sessionId);
                }
                window.dispatchEvent(new Event("storage"));
                // refresh backend
                await backendLogin(userId, sessionId, expiresAt, accessToken);

                // set timer to refresh access token
                setLoginTimer(expiresAt);
            } else {
                //kick off spotify login process
                await spotifyLogin();
            }
        } catch (error) {
            throw error;
        } finally {
            setLoginInProgress(false);
        }
    }

    async function loginCallback(urlParams) {
        try {
            setLoginInProgress(true);
            // get data from spotify login callback and set session storage
            const { refreshToken, accessToken, expiresAt, state } =
                await spotifyLoginCallback(urlParams);
            console.log("finished spotify login callback, setting storage");
            localStorage.setItem(refreshTokenKey, refreshToken);
            sessionStorage.setItem(accessTokenKey, accessToken);
            sessionStorage.setItem(expiresAtKey, expiresAt);
            sessionStorage.setItem(sessionKey, state);

            window.dispatchEvent(new Event("storage"));

            // get info about user from spotify and set session storage
            const res = await getCurrentUserInfo(accessToken);
            console.log(res);
            const userId = res.id;
            sessionStorage.setItem(userIdKey, userId);
            window.dispatchEvent(new Event("storage"));

            // use the state value for the new session id
            const sessionId = state;

            // authenticate with backend
            await backendLogin(userId, sessionId, expiresAt, accessToken);

            // set timer to refresh access token
            setLoginTimer(expiresAt);
            //setLoginInProgress(false);
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
    }

    return {
        login,
        loginCallback,
        logout,
    };
};
