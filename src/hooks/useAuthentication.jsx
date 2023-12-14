// place for methods which handdle authenitcation for btoh spotify and backend
import { useContext, useCallback, useRef } from "react";
import { navigate } from "gatsby";
import useSpotify from "./useSpotify";
import useHelper from "./useHelper";
import useBackend from "./useBackend";
import { LoginContext } from "../context/LoginContext";
import { MixpanelContext } from "../context/MixpanelContext";
import useGlobalTimer from "./useGlobalTimer";

export default function useAuthentication() {
  const prevKey = "prevPath";

  const mixpanel = useContext(MixpanelContext);
  const {
    getCurrentUserInfo,
    loginCallback: spotifyLoginCallback,
    login: spotifyLogin,
    refreshLogin: spotifyRefreshLogin,
  } = useSpotify();
  const { loginInfo, setLoginInfo, setLoginInProgress } = useContext(LoginContext);
  const { authenticate: backendLogin } = useBackend();
  const { generateRandomString } = useHelper();

  const { clearTimer } = useGlobalTimer();

  // prev path helpers

  const getPrevPath = useCallback(() => {
    const prevPath = sessionStorage.getItem(prevKey);
    if (prevPath) {
      return prevPath;
    }
    return "/my-brackets";
  }, []);

  const removePrevPath = useCallback(() => {
    sessionStorage.removeItem(prevKey);
  }, []);

  const setPrevPath = useCallback((path) => {
    removePrevPath();
    const callbackRegex = /^\/callback(\/?\?.*|\/?)?$/;
    if (!callbackRegex.test(path)) {
      sessionStorage.setItem(prevKey, path);
    }
  }, []);

  const toPrevPage = useCallback(() => {
    const prevPath = getPrevPath();
    removePrevPath();
    navigate(prevPath);
  }, []);

  // auth functions

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
    clearTimer("auth");
    console.log("logged out");
  }, [mixpanel, setLoginInfo, clearTimer]);

  const setupSpotifyLogin = useCallback(async () => {
    if (window.location.pathname !== "/") {
      setPrevPath(window.location.pathname);
    }
    await spotifyLogin();
  }, [prevKey, spotifyLogin]);

  const loginWithRefreshToken = useCallback(
    async (inputRefreshToken, inputSessionId) => {
      const { accessToken, refreshToken, expiresAt } = await spotifyRefreshLogin(inputRefreshToken);

      // get info about user from spotify and set session storage
      const res = await getCurrentUserInfo(accessToken);
      const userId = res.id;

      // get session id from session storage and set it if it doesn't exist
      let sessionId = inputSessionId;
      if (!sessionId) {
        sessionId = generateRandomString(128);
      }

      // refresh backend
      await backendLogin(userId, sessionId, expiresAt, accessToken);

      // identify user in mixpanel
      mixpanel.identify(userId);

      // set timer info
      setLoginInfo({
        sessionId: sessionId,
        userId: userId,
        accessToken: accessToken,
        expiresAt: expiresAt,
        refreshToken: refreshToken || inputRefreshToken,
      });

      console.debug("refreshed spotify and backend sessions successfully");
      return true;
    },
    [backendLogin, getCurrentUserInfo, generateRandomString, mixpanel, spotifyRefreshLogin, setLoginInfo],
  );

  const login = useCallback(
    async (refreshTokenOnly = false) => {
      try {
        setLoginInProgress(true);
        // case where user has been here before and has a refresh token
        if (loginInfo.refreshToken) {
          try {
            await loginWithRefreshToken(loginInfo.refreshToken, loginInfo.sessionId);
            return true;
          } catch (error) {
            console.log("Problem refreshing with refresh token:");
            console.error(error);
            setLoginInfo({
              ...loginInfo,
              refreshToken: null,
            });

            if (refreshTokenOnly) {
              return false;
            }

            // kick off spotify login process
            await setupSpotifyLogin();
            return true;
          }
        } else {
          if (refreshTokenOnly) {
            return false;
          }
          // kick off spotify login process
          await setupSpotifyLogin();
          return true;
        }
      } finally {
        setLoginInProgress(false);
      }
    },
    [loginInfo, setLoginInfo, setLoginInProgress, setupSpotifyLogin, loginWithRefreshToken],
  );

  const loginCallback = useCallback(
    async (urlParams) => {
      try {
        setLoginInProgress(true);
        // get data from spotify login callback and set session storage
        const { refreshToken, accessToken, expiresAt, state } = await spotifyLoginCallback(urlParams);

        // get info about user from spotify and set session storage
        const res = await getCurrentUserInfo(accessToken);
        const userId = res.id;

        // use the state value for the new session id
        const sessionId = state;

        // authenticate with backend
        await backendLogin(userId, sessionId, expiresAt, accessToken);

        // identify user in mixpanel
        mixpanel.identify(userId);

        // set login info
        setLoginInfo({
          sessionId: sessionId,
          userId: userId,
          accessToken: accessToken,
          expiresAt: expiresAt,
          refreshToken: refreshToken,
        });

        const prevPath = sessionStorage.getItem(prevKey);
        if (prevPath) {
          sessionStorage.removeItem(prevKey);
          navigate(prevPath);
        } else {
          navigate("/my-brackets");
        }

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
    [backendLogin, getCurrentUserInfo, mixpanel, setLoginInfo, spotifyLoginCallback, setLoginInProgress],
  );

  const loginRef = useRef(login);

  loginRef.current = login;

  return {
    login,
    loginRef,
    loginCallback,
    logout,
    toPrevPage,
  };
}
