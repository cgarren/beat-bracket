import axios from "axios";
import { useEffect, useContext, useCallback } from "react";
import { LoginContext } from "../context/LoginContext";

const clientId = "fff2634975884bf88e3d3c9c2d77763d";
const tokenURL = "https://accounts.spotify.com/api/token";

const axiosInstance = axios.create({
  baseURL: "https://api.spotify.com/v1",
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
  },
});

const calculateExpiresAt = (expiresIn) => Date.now() + parseInt(expiresIn, 10) * 1000;

const refreshLogin = async (refreshToken) => {
  console.debug("refreshing spotify tokens");
  const response = await axios.post(
    tokenURL,
    {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
    },
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    },
  );

  const expiresAt = calculateExpiresAt(response.data.expires_in);
  console.debug("refreshed spotify tokens successfully");
  return {
    accessToken: response.data.access_token,
    expiresAt: expiresAt,
    refreshToken: response.data.refresh_token,
  };
};

const refreshExpiredTokenClosure = () => {
  let isCalled = false;
  let runningPromise;
  return (refreshToken) => {
    if (isCalled) {
      return runningPromise;
    }
    isCalled = true;
    runningPromise = refreshLogin(refreshToken).finally(() => {
      isCalled = false;
    });
    return runningPromise;
  };
};

// stores the function returned by refreshExpiredTokenClosure
const refreshExpiredToken = refreshExpiredTokenClosure();

const Interceptor = ({ children }) => {
  const { setShowLoginExpiredModal, showLoginExpiredModal, setSpotifyLoggedIn, setLoginInProgress } =
    useContext(LoginContext);

  const logoutUser = useCallback(() => {
    console.debug("logging out user");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("accessToken");
    setShowLoginExpiredModal(true);
    setSpotifyLoggedIn(false);
    setLoginInProgress(false);
  }, [setShowLoginExpiredModal]);

  useEffect(() => {
    const resInterceptor = (response) => response;

    const errInterceptor = async (error) => {
      const originalRequest = error.config;

      // logout user's session if refresh token api responds 401 UNAUTHORIZED
      if ([400, 401].includes(error?.response?.status) && originalRequest.url === tokenURL) {
        logoutUser();
        return Promise.reject(error);
      }

      // if request fails with 401 UNAUTHORIZED status and 'Token has expired' as response message
      // then it calls the api to generate new access token
      if (error?.response?.status === 401) {
        if (localStorage.getItem("refreshToken")) {
          const { accessToken, refreshToken } = await refreshExpiredToken(localStorage.getItem("refreshToken"));
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          sessionStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          return axiosInstance(originalRequest);
        }
        if (!showLoginExpiredModal) {
          logoutUser();
        }
      }
      return Promise.reject(error);
    };

    const interceptor = axiosInstance.interceptors.response.use(resInterceptor, errInterceptor);

    return () => axiosInstance.interceptors.response.eject(interceptor);
  }, []);
  return children;
};

// axiosInstance.interceptors.response.use(
//   (response) => response,

//   async (error) => {
//     const originalRequest = error.config;

//     // logout user's session if refresh token api responds 401 UNAUTHORIZED
//     if (error.response.status === 401 && originalRequest.url === tokenURL) {
//       localStorage.removeItem("refreshToken");
//       sessionStorage.removeItem("accessToken");
//       axiosInstance.defaults.headers = {};
//       // window.location.href = "/login";
//       return Promise.reject(error);
//     }

//     // if request fails with 401 UNAUTHORIZED status and 'Token has expired' as response message
//     // then it calls the api to generate new access token
//     if (error.response.status === 401) {
//       // error.response.data.msg === "Token has expired" &&
//       const { accessToken, refreshToken } = await refreshExpiredToken();
//       originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//       sessionStorage.setItem("accessToken", accessToken);
//       localStorage.setItem("refreshToken", refreshToken);
//       return axiosInstance(originalRequest);
//     }

//     return Promise.reject(error);
//   },
// );

axiosInstance.interceptors.request.use((config) => {
  const newConfig = config;
  const bad = Math.random() < 0.08;
  if (bad) {
    console.debug("simulating bad request");
    newConfig.headers.Authorization = `Bearer fgdgfd`;
  } else {
    newConfig.headers.Authorization = `Bearer ${sessionStorage.getItem("accessToken")}`;
  }
  return newConfig;
});

export default axiosInstance;
export { Interceptor };
