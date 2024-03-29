// place for methods which handdle authenitcation for btoh spotify and backend
import { useContext, useCallback, useRef } from "react";
import { navigate } from "gatsby";
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

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

  const isCurrentUser = useCallback(
    (userId) => {
      if (userId && userId === loginInfo.userId) {
        return true;
      }
      return false;
    },
    [loginInfo],
  );

  // auth functions

  const logout = useCallback(async () => {
    // clear storage including refresh token key
    mixpanel.track("User Logout");
    setLoginInfo({
      userId: undefined,
      accessToken: undefined,
      backendToken: undefined,
      expiresAt: undefined,
      refreshToken: undefined,
    });
    localStorage.clear();
    sessionStorage.clear();
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
    async (inputRefreshToken) => {
      const { accessToken, refreshToken, expiresAt } = await spotifyRefreshLogin(inputRefreshToken);

      // get info about user from spotify
      const res = await getCurrentUserInfo(accessToken);
      const userId = res.id;

      // refresh backend
      const backendToken = await backendLogin(userId, expiresAt, accessToken);

      // identify user in mixpanel
      mixpanel.identify(userId);

      // set login info
      setLoginInfo({
        backendToken: backendToken,
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
        localStorage.removeItem("refreshToken");
        if (loginInfo.refreshToken) {
          try {
            await loginWithRefreshToken(loginInfo.refreshToken);
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
        queryClient.removeQueries();
        setLoginInProgress(false);
      }
    },
    [loginInfo, setLoginInfo, setLoginInProgress, setupSpotifyLogin, loginWithRefreshToken],
  );

  const loginCallback = useCallback(
    async (urlParams) => {
      try {
        setLoginInProgress(true);
        // get data from spotify login callback
        const { refreshToken, accessToken, expiresAt } = await spotifyLoginCallback(urlParams);

        // get info about user from spotify
        const res = await getCurrentUserInfo(accessToken);
        const userId = res.id;

        // authenticate with backend
        const backendToken = await backendLogin(userId, expiresAt, accessToken);

        // identify user in mixpanel
        mixpanel.identify(userId);

        // set login info
        setLoginInfo({
          backendToken: backendToken,
          userId: userId,
          accessToken: accessToken,
          expiresAt: expiresAt,
          refreshToken: refreshToken,
        });

        const prevPath = sessionStorage.getItem(prevKey);
        if (prevPath) {
          sessionStorage.removeItem(prevKey);
          navigate(prevPath, { replace: true });
        } else {
          navigate("/my-brackets", { replace: true });
        }

        return { userId: userId };
      } catch (error) {
        if (error.message !== "Invalid url params") {
          throw error;
        } else {
          return "Invalid url parameters";
        }
      } finally {
        queryClient.removeQueries();
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
    isCurrentUser,
  };
}
