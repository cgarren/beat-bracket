import { useCallback, useContext } from "react";
import { LoginContext } from "../context/LoginContext";
import { UserInfoContext } from "../context/UserInfoContext";

export default function useBackend() {
  const maxBracketsKey = "max_brackets";

  const baseUrl = process.env.GATSBY_BACKEND_URL;

  const { setLoginInProgress } = useContext(LoginContext);
  const userInfo = useContext(UserInfoContext);

  const authenticate = useCallback(
    async (userId, accessToken) => {
      setLoginInProgress(true);
      // const response = await loadBackendRequest(
      //   "/auth",
      //   "POST",
      //   null,
      //   {
      //     userId: userId,
      //     accessToken: accessToken,
      //   },
      //   "include",
      //   {},
      // );
      const url = `${baseUrl}/auth`;
      const requestOptions = {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          userId: userId,
          accessToken: accessToken,
        }),
      };
      const response = await fetch(url, requestOptions);
      setLoginInProgress(false);
      if (response.ok) {
        const { maxBrackets, token } = await response.json();
        localStorage.setItem(maxBracketsKey, maxBrackets);
        return token;
      }
      throw new Error("Authentication failed");
    },
    [baseUrl],
  );

  const loadBackendRequest = useCallback(
    async (path, method, params, includeToken, data, credentials, headers = {}) => {
      let url = baseUrl + path;
      const finalParams = includeToken ? { ...params, token: sessionStorage.getItem("backendToken") } : params;
      if (finalParams) {
        url = `${url}?${new URLSearchParams(finalParams)}`;
      }
      const requestOptions = {
        method: method,
        headers: headers,
      };
      if (credentials) {
        requestOptions.credentials = credentials;
      }
      if (data) {
        requestOptions.body = JSON.stringify(data);
      }

      if (includeToken) {
        console.debug("including token");
      }

      console.debug("fetching", url, requestOptions);

      let response;
      try {
        response = await fetch(url, requestOptions);
      } catch (error) {
        console.error(error);
        throw new Error("Network error");
      }
      if (!response.ok) {
        if (response.status === 403) {
          sessionStorage.removeItem("backendToken");
          const spotifyToken = sessionStorage.getItem("accessToken");
          if (userInfo?.id && spotifyToken) {
            console.debug("refreshing backend token");
            try {
              const newBackendToken = await authenticate(userInfo?.id, spotifyToken);
              if (newBackendToken) {
                sessionStorage.setItem("backendToken", newBackendToken);
                return loadBackendRequest(
                  path,
                  method,
                  { ...params, token: newBackendToken },
                  false,
                  data,
                  credentials,
                  headers,
                );
              }
            } catch (e) {
              console.error(e);
            }
            throw new Error("Problem refreshing backend token");
          }
        }

        const errorMessage = await response.text();
        if (errorMessage) {
          throw new Error(errorMessage, {
            cause: { code: response.status },
          });
        } else {
          throw new Error("Unknown error");
        }
      }
      return response;
    },
    [baseUrl],
  );

  const getBrackets = useCallback(
    async (userId) => {
      const response = await loadBackendRequest(
        "/brackets",
        "GET",
        {
          ownerId: userId,
        },
        true,
      );
      return response.json();
    },
    [loadBackendRequest],
  );

  const getBracket = useCallback(
    async (id, userId) => {
      const response = await loadBackendRequest("/bracket", "GET", {
        id: id,
        ownerId: userId,
      });
      return response.json();
    },
    [loadBackendRequest],
  );

  const getTemplate = useCallback(
    async (id, userId) => {
      const response = await loadBackendRequest("/template", "GET", {
        id: id,
        ownerId: userId,
      });
      return response.json();
    },
    [loadBackendRequest],
  );

  const createBracket = useCallback(
    async (bracket) => {
      await loadBackendRequest("/bracket", "PUT", { ownerId: userInfo.id }, true, bracket);
      console.debug("Written Bracket:", bracket);
    },
    [loadBackendRequest],
  );

  const updateBracket = useCallback(
    async (id, updateObject) => {
      await loadBackendRequest(
        "/bracket",
        "PATCH",
        {
          id: id,
          ownerId: userInfo.id,
        },
        true,
        updateObject,
      );
    },
    [loadBackendRequest],
  );

  const deleteBracket = useCallback(
    async (id) =>
      loadBackendRequest(
        "/bracket",
        "DELETE",
        {
          id: id,
          ownerId: userInfo.id,
        },
        true,
      ),
    [loadBackendRequest],
  );

  const getMaxBrackets = useCallback(() => {
    // eventually make this a call to the backend
    if (typeof window !== "undefined") {
      return localStorage.getItem(maxBracketsKey);
    }
    return null;
  }, []);

  return {
    deleteBracket,
    getMaxBrackets,
    authenticate,
    getBrackets,
    getBracket,
    updateBracket,
    createBracket,
    getTemplate,
  };
}
