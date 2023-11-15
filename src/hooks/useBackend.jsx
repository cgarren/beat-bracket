import { useCallback, useContext } from "react";
import { LoginContext } from "../context/LoginContext";

export const useBackend = () => {
    const maxBracketsKey = "max_brackets";

    const baseUrl = process.env.GATSBY_BACKEND_URL;

    const { loginInfo } = useContext(LoginContext);

    const loadBackendRequest = useCallback(
        async (path, method, params, data, headers = {}, credentials) => {
            let url = baseUrl + path;
            if (params) {
                url = url + "?" + new URLSearchParams(params);
            }
            let requestOptions = {
                method: method,
                headers: headers,
            };
            if (credentials) {
                requestOptions.credentials = credentials;
            }
            if (data) {
                requestOptions.body = JSON.stringify(data);
            }

            let response;
            try {
                response = await fetch(url, requestOptions);
            } catch (error) {
                console.error(error);
                throw new Error("Network error");
            }
            if (!response.ok) {
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
        [baseUrl]
    );

    const getBrackets = useCallback(
        async (userId, sessionId) => {
            const response = await loadBackendRequest("/brackets", "GET", {
                ownerId: userId,
                sessionId: sessionId,
            });
            return response.json();
        },
        [loadBackendRequest]
    );

    const getBracket = useCallback(
        async (id, userId) => {
            const response = await loadBackendRequest("/bracket", "GET", {
                id: id,
                ownerId: userId,
            });
            return response.json();
        },
        [loadBackendRequest]
    );

    const getTemplate = useCallback(
        async (id, userId) => {
            const response = await loadBackendRequest("/template", "GET", {
                id: id,
                ownerId: userId,
            });
            return response.json();
        },
        [loadBackendRequest]
    );

    const createBracket = useCallback(
        async (bracket) => {
            await loadBackendRequest(
                "/bracket",
                "PUT",
                { ownerId: loginInfo.userId, sessionId: loginInfo.sessionId },
                bracket
            );
            console.debug("Written Bracket:", bracket);
        },
        [loadBackendRequest, loginInfo]
    );

    const updateBracket = useCallback(
        async (id, updateObject) => {
            await loadBackendRequest(
                "/bracket",
                "PATCH",
                {
                    id: id,
                    ownerId: loginInfo.userId,
                    sessionId: loginInfo.sessionId,
                },
                updateObject
            );
        },
        [loadBackendRequest, loginInfo]
    );

    const deleteBracket = useCallback(
        async (id) => {
            await loadBackendRequest("/bracket", "DELETE", {
                id: id,
                ownerId: loginInfo.userId,
                sessionId: loginInfo.sessionId,
            });
        },
        [loadBackendRequest, loginInfo]
    );

    const getMaxBrackets = useCallback(() => {
        // eventually make this a call to the backend
        if (typeof window !== "undefined") {
            return localStorage.getItem(maxBracketsKey);
        }
        return null;
    }, []);

    const authenticate = useCallback(
        async (userId, sessionId, expireTime, accessToken) => {
            const response = await loadBackendRequest(
                "/auth",
                "POST",
                null,
                {
                    userId: userId,
                    sessionId: sessionId,
                    expireTime: expireTime,
                    accessToken: accessToken,
                },
                {},
                "include"
            );
            const { maxBrackets } = await response.json();
            localStorage.setItem(maxBracketsKey, maxBrackets);
            window.dispatchEvent(new Event("storage"));
        },
        [loadBackendRequest]
    );

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
};
