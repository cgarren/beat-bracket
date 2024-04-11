// place for methods which handdle authenitcation for btoh spotify and backend
import { useContext, useCallback, useRef } from "react";
import { navigate } from "gatsby";
import { useQueryClient } from "@tanstack/react-query";
import { LoginContext } from "../context/LoginContext";
import { UserInfoContext } from "../context/UserInfoContext";
import { MixpanelContext } from "../context/MixpanelContext";
import { login as spotifyLogin, refreshLogin as spotifyRefreshLogin, tokensExist } from "../axios/spotifyInstance";
import { login as backendLogin } from "../axios/backendInstance";

export default function useAuthentication() {
  const prevKey = "prevPath";

  const mixpanel = useContext(MixpanelContext);
  const { setLoginInProgress } = useContext(LoginContext);
  const userInfo = useContext(UserInfoContext);
  const queryClient = useQueryClient();

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

  const toPrevPage = useCallback((replace = false) => {
    const prevPath = getPrevPath();
    removePrevPath();
    navigate(prevPath, { replace: replace });
  }, []);

  const isCurrentUser = useCallback(
    (userId) => {
      if (userId && userId === userInfo?.id) {
        return true;
      }
      return false;
    },
    [userInfo?.id],
  );

  // auth functions

  const logout = useCallback(async () => {
    // clear storage including refresh token key
    mixpanel.track("User Logout");
    localStorage.clear();
    sessionStorage.clear();
    mixpanel.reset();
    console.log("logged out");
    navigate("/", { state: { justLoggedOut: true } });
  }, [mixpanel]);

  const setupSpotifyLogin = useCallback(async () => {
    if (window.location.pathname !== "/") {
      setPrevPath(window.location.pathname);
    }
    await spotifyLogin();
  }, [prevKey]);

  const loginWithRefreshToken = useCallback(async () => {
    const { accessToken } = await spotifyRefreshLogin();

    // refresh backend
    await backendLogin(userInfo?.id, accessToken);

    console.debug("refreshed spotify and backend sessions successfully");
    return true;
  }, [mixpanel, setLoginInProgress, userInfo?.id]);

  const login = useCallback(
    async (refreshTokenOnly = false) => {
      try {
        setLoginInProgress(true);
        // case where user has been here before and has a refresh token
        const refreshToken = tokensExist();
        if (refreshToken) {
          try {
            await loginWithRefreshToken();
            return true;
          } catch (error) {
            console.log("Problem refreshing with refresh token:");
            console.error(error);

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
    [setLoginInProgress, setupSpotifyLogin, loginWithRefreshToken],
  );

  // const loginCallback = useCallback(
  //   async (urlParams) => {
  //     try {
  //       setLoginInProgress(true);
  //       // get data from spotify login callback
  //       const { refreshToken, accessToken, expiresAt } = await spotifyLoginCallback(urlParams);

  //       // get info about user from spotify
  //       const res = await getCurrentUserInfo(accessToken);
  //       const userId = res.id;

  //       // authenticate with backend
  //       const backendToken = await backendLogin(userId, expiresAt, accessToken);

  //       // identify user in mixpanel
  //       mixpanel.identify(userId);

  //       // set login info
  //       setLoginInfo({
  //         backendToken: backendToken,
  //         userId: userId,
  //         accessToken: accessToken,
  //         expiresAt: expiresAt,
  //         refreshToken: refreshToken,
  //       });

  //       const prevPath = sessionStorage.getItem(prevKey);
  //       if (prevPath) {
  //         sessionStorage.removeItem(prevKey);
  //         navigate(prevPath, { replace: true });
  //       } else {
  //         navigate("/my-brackets", { replace: true });
  //       }

  //       return { userId: userId };
  //     } catch (error) {
  //       if (error.message !== "Invalid url params") {
  //         throw error;
  //       } else {
  //         return "Invalid url parameters";
  //       }
  //     } finally {
  //       queryClient.removeQueries();
  //       setLoginInProgress(false);
  //     }
  //   },
  //   [backendLogin, getCurrentUserInfo, mixpanel, setLoginInfo, spotifyLoginCallback, setLoginInProgress],
  // );

  const loginRef = useRef(login);

  loginRef.current = login;

  return {
    login,
    loginRef,
    logout,
    toPrevPage,
    isCurrentUser,
    getPrevPath,
  };
}
