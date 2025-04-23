import axios from "axios";
import { useEffect, useContext, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LoginContext } from "../context/LoginContext";
import { MixpanelContext } from "../context/MixpanelContext";
import { UserInfoContext } from "../context/UserInfoContext";
import { accessTokenKey, refreshExpiredToken as refreshExpiredSpotifyToken } from "./spotifyInstance";

const sessionStorage = typeof window !== "undefined" ? window.sessionStorage : null;
const localStorage = typeof window !== "undefined" ? window.localStorage : null;

// MARK:Constants
const authURL = "auth";
// auth storage keys
const backendTokenKey = "backendToken";
export const maxBracketsKey = "maxBrackets";

// axios instance
const axiosInstance = axios.create({
  baseURL: process.env.GATSBY_BACKEND_URL,
  timeout: 10000,
});

// helpers for export

export const tokenExists = () => {
  const token = sessionStorage.getItem(backendTokenKey);
  return Boolean(token);
};

// login functions for export

export const login = async (userId, accessToken) => {
  const response = await axiosInstance.post(
    authURL,
    {
      userId: userId,
      accessToken: accessToken,
    },
    {
      withCredentials: true,
      // headers: {
      //   "content-type": "application/x-www-form-urlencoded",
      //   Authorization: null,
      // },
    },
  );
  const { maxBrackets, token } = response.data;

  return {
    maxBrackets: maxBrackets,
    token: token,
  };
};

// Closure for refreshing expired token

const refreshExpiredTokenClosure = () => {
  let isCalled = false;
  let runningPromise;
  return (...params) => {
    if (isCalled) {
      return runningPromise;
    }
    isCalled = true;
    runningPromise = login(...params).finally(() => {
      isCalled = false;
    });
    return runningPromise;
  };
};

const refreshExpiredToken = refreshExpiredTokenClosure();

// MARK:Interceptor

export const Interceptor = ({ children }) => {
  const { setShowLoginExpiredModal, showLoginExpiredModal, setLoginInProgress, setSetupDone } =
    useContext(LoginContext);
  const mixpanel = useContext(MixpanelContext);
  const userInfo = useContext(UserInfoContext);
  const queryClient = useQueryClient();

  const logoutUser = useCallback(() => {
    if (!showLoginExpiredModal) {
      sessionStorage.removeItem(backendTokenKey);
      mixpanel.track("Login Expired Modal Shown");
      queryClient.removeQueries({ queryKey: ["backend"] });
      setShowLoginExpiredModal(true);
      setLoginInProgress(false);
    }
  }, [setShowLoginExpiredModal]);

  const resInterceptor = (response) => {
    const originalRequest = response.config;
    if (originalRequest.url === authURL) {
      sessionStorage.setItem(backendTokenKey, response.data.token);
      localStorage.setItem(maxBracketsKey, response.data.maxBrackets);
      // console.debug("invalidateQueries");
      // queryClient.invalidateQueries({ queryKey: ["backend"] });
    }
    return response;
  };

  const errInterceptor = async (error) => {
    const originalRequest = error.config;

    // either loguout the user on auth error or attmept to refresh the token and try again
    if ([400, 401].includes(error?.response?.status) && originalRequest.url === authURL) {
      if (error?.response?.status === 401) {
        const res = await refreshExpiredSpotifyToken();
        const { accessToken } = res;
        const newRequest = {
          ...originalRequest,
          data: { ...JSON.parse(originalRequest.data), accessToken: accessToken },
          params: { ...originalRequest.params, secondTry: true },
        };
        return axiosInstance(newRequest);
      }
      logoutUser();
      console.debug("logging out user");
      return Promise.reject(error);
    }

    if (error?.response?.status === 403) {
      await refreshExpiredToken(userInfo?.id, sessionStorage.getItem(accessTokenKey));
      const newRequest = {
        ...originalRequest,
        params: { ...originalRequest.params, secondTry: true },
      };
      return axiosInstance(newRequest);
    }

    const newError = {
      ...error,
      cause: { code: error?.response?.status },
      message: () => {
        if (typeof error?.response?.data === "string") return error?.response?.data;
        return error.message;
      },
    };

    console.debug("error", newError);

    return Promise.reject(newError);
  };

  const reqInterceptor = async (config) => {
    const newConfig = config;
    // const rand = Math.random();
    // const bad = rand < 0.5;
    // if (bad) {
    //   //  && config.url !== authURL
    //   console.debug("simulating bad request", rand);
    //   newConfig.params = { ...config.params, token: "bdsjbds" };
    // } else
    if (config.includeAuth && config.url !== authURL) {
      newConfig.params = { ...config.params, token: sessionStorage.getItem(backendTokenKey), ownerId: userInfo?.id };
    }
    return newConfig;
  };

  useEffect(() => {
    // console.debug("setting up backend interceptor");
    const resInterceptorRef = axiosInstance.interceptors.response.use(resInterceptor, errInterceptor);
    const reqInterceptorRef = axiosInstance.interceptors.request.use(reqInterceptor);
    setSetupDone(true);

    return () => {
      // console.debug("removing backend interceptor");
      axiosInstance.interceptors.response.eject(resInterceptorRef);
      axiosInstance.interceptors.request.eject(reqInterceptorRef);
    };
  }, [userInfo, setSetupDone, logoutUser]);
  return children;
};

export default axiosInstance;
