import axios from "axios";
import { useEffect, useContext, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LoginContext } from "../context/LoginContext";
import { MixpanelContext } from "../context/MixpanelContext";
import { generateRandomString, generateCodeChallenge } from "../utils/helpers";

// constants
const clientId = "fff2634975884bf88e3d3c9c2d77763d";
const tokenURL = "https://accounts.spotify.com/api/token";
// auth storage keys
const codeVerifierKey = "spotify_auth_code_verifier";
const stateKey = "spotify_auth_state";
export const accessTokenKey = "accessToken";
const refreshTokenKey = "refreshToken";
// auth constants
const redirectUri =
  typeof window !== "undefined" ? `${window.location.origin}/callback` : "https://www.beatbracket.com/callback";
const scope =
  "playlist-modify-private playlist-modify-public user-read-private playlist-read-private playlist-read-collaborative";
const codeChallengeMethod = "S256";

const sessionStorage = typeof window !== "undefined" ? window.sessionStorage : null;
const localStorage = typeof window !== "undefined" ? window.localStorage : null;

// axios instance
const axiosInstance = axios.create({
  baseURL: "https://api.spotify.com/v1",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionStorage?.getItem(accessTokenKey)}`,
  },
});

// helpers for export

export const tokensExist = () => {
  const accessToken = sessionStorage?.getItem(accessTokenKey);
  const refreshToken = localStorage?.getItem(refreshTokenKey);
  return Boolean(accessToken && refreshToken);
};

// login functions for export

export const refreshLogin = async () => {
  console.debug("refreshing spotify tokens");
  const response = await axiosInstance.post(
    tokenURL,
    {
      grant_type: "refresh_token",
      refresh_token: localStorage?.getItem(refreshTokenKey),
      client_id: clientId,
    },
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization: null,
      },
    },
  );

  console.debug("refreshed spotify tokens successfully");
  return {
    accessToken: response.data.access_token,
  };
};

export async function login() {
  // Generate and save state
  const state = generateRandomString(16);
  sessionStorage?.setItem(stateKey, state);

  // Generate and save code verifier
  const codeVerifier = generateRandomString(128);
  sessionStorage?.setItem(codeVerifierKey, codeVerifier);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Set the authorization parameters
  const args = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectUri,
    state: state,
    code_challenge_method: codeChallengeMethod,
    code_challenge: codeChallenge,
  });

  // Redirect to the Spotify authorization page
  window.location = `https://accounts.spotify.com/authorize?${args}`;
}

export async function loginCallback(urlParams) {
  // Verify state and code parameters
  if (urlParams && urlParams.get("code") && urlParams.get("state") === sessionStorage?.getItem(stateKey)) {
    // Request the access token
    console.debug("requesting spotify access token");
    const response = await axiosInstance.post(
      "https://accounts.spotify.com/api/token",
      {
        grant_type: "authorization_code",
        code: urlParams.get("code"),
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: sessionStorage?.getItem(codeVerifierKey),
      },
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          Authorization: null,
        },
      },
    );

    // remove spotify auth state and auth code verifier
    sessionStorage?.removeItem(stateKey);
    sessionStorage?.removeItem(codeVerifierKey);
    return {
      accessToken: response.data.access_token,
    };
  }
  throw new Error("Invalid url parameters");
}

// Closure for refreshing expired token

const refreshExpiredTokenClosure = () => {
  let isCalled = false;
  let runningPromise;
  return () => {
    if (isCalled) {
      return runningPromise;
    }
    isCalled = true;
    runningPromise = refreshLogin().finally(() => {
      isCalled = false;
    });
    return runningPromise;
  };
};

export const refreshExpiredToken = refreshExpiredTokenClosure();

// Interceptor for axios instance

export const Interceptor = ({ children }) => {
  const { setShowLoginExpiredModal, showLoginExpiredModal, setLoginInProgress, setSetupDone } =
    useContext(LoginContext);
  const mixpanel = useContext(MixpanelContext);
  const queryClient = useQueryClient();

  const logoutUser = useCallback(() => {
    if (!showLoginExpiredModal) {
      localStorage.removeItem(refreshTokenKey);
      sessionStorage.removeItem(accessTokenKey);
      mixpanel.track("Login Expired Modal Shown");
      queryClient.removeQueries({ queryKey: ["spotify"] });
      setShowLoginExpiredModal(true);
      setLoginInProgress(false);
    }
  }, [setShowLoginExpiredModal]);

  const resInterceptor = (response) => {
    const originalRequest = response.config;
    if (originalRequest.url === tokenURL) {
      sessionStorage.setItem(accessTokenKey, response.data.access_token);
      localStorage.setItem(refreshTokenKey, response.data.refresh_token);
      console.debug("invalidateQueries");
      queryClient.invalidateQueries({ queryKey: ["spotify"] });
    }
    return response;
  };

  const errInterceptor = async (error) => {
    const originalRequest = error.config;

    // logout user's session if refresh token api responds 401 UNAUTHORIZED
    if ([400, 401].includes(error?.response?.status) && originalRequest.url === tokenURL) {
      logoutUser();
      console.debug("logging out user");
      return Promise.reject(error);
    }

    if (error?.response?.status === 401) {
      if (localStorage.getItem(refreshTokenKey)) {
        const { accessToken } = await refreshExpiredToken();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      }
      logoutUser();
      console.debug("logging out user");
    }
    return Promise.reject(error);
  };

  useEffect(() => {
    // console.debug("setting up spotify interceptor");
    const interceptor = axiosInstance.interceptors.response.use(resInterceptor, errInterceptor);
    setSetupDone(true);

    return () => {
      // console.debug("removing spotify interceptor");
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, []);
  return children;
};

axiosInstance.interceptors.request.use((config) => {
  const newConfig = config;
  // const bad = Math.random() < 0.08;
  // if (bad && config.url !== tokenURL) {
  //   console.debug("simulating bad request");
  //   newConfig.headers.Authorization = `Bearer fgdgfd`;
  // } else
  if (config.url !== tokenURL) {
    newConfig.headers.Authorization = `Bearer ${sessionStorage.getItem(accessTokenKey)}`;
  }
  return newConfig;
});

export default axiosInstance;
