import { useCallback, useContext } from "react";
import { navigate } from "gatsby";
import defaultPlaylistImage from "../assets/images/defaultPlaylistImage.png";
import useHelper from "./useHelper";
import guestProfileImage from "../assets/images/guestProfileImage.png";
import { LoginContext } from "../context/LoginContext";

export default function useSpotify() {
  // auth storage keys
  const codeVerifierKey = "spotify_auth_code_verifier";
  const stateKey = "spotify_auth_state";
  // auth constants
  const clientId = "fff2634975884bf88e3d3c9c2d77763d";
  const redirectUri =
    typeof window !== "undefined" ? `${window.location.origin}/callback` : "https://www.beatbracket.com/callback";
  const scope =
    "playlist-modify-private playlist-modify-public user-read-private playlist-read-private playlist-read-collaborative";
  const codeChallengeMethod = "S256";

  const { loginInfo, loggedIn } = useContext(LoginContext);
  const { generateRandomString } = useHelper();

  const postRequest = useCallback(
    async (url, params, data) => {
      const modifiedUrl = params ? `${url}?${new URLSearchParams(params)}` : url;
      const response = await fetch(modifiedUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginInfo.accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        return response.json(); // parses JSON response into native JavaScript objects
      }
      if (response.status === 429) {
        throw new Error(`Too many requests. Code: ${response.status}`);
      } else {
        throw new Error(`Unknown request error. Code: ${response.status}`);
      }
    },
    [loginInfo],
  );

  const loadSpotifyRequest = useCallback(
    async (url, params, accessToken) => {
      const token = accessToken || loginInfo.accessToken;
      if (loggedIn || token) {
        const modifiedUrl = params ? `${url}?${new URLSearchParams(params)}` : url;
        const response = await fetch(modifiedUrl, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorMessage = await response.text();
          if (errorMessage) {
            throw new Error(errorMessage, {
              cause: { code: response.status },
            });
          } else {
            console.log("Spotify response:", response);
            throw new Error("Unknown error loading spotify request");
          }
        }
        return response;
      }
      throw new Error("Not logged in");
      // return null;
    },
    [loginInfo, loggedIn],
  );

  const search = useCallback(
    async (query, type, limit) => {
      const params = { q: query, type: type, limit: limit };
      const response = await loadSpotifyRequest(
        `https://api.spotify.com/v1/search/?${new URLSearchParams(params).toString()}`,
      );
      return response.json();
    },
    [loadSpotifyRequest],
  );

  const getArtist = useCallback(
    async (artistId) => {
      const res = await loadSpotifyRequest(`https://api.spotify.com/v1/artists/${artistId}`);
      return res.json();
    },
    [loadSpotifyRequest],
  );

  const getPlaylist = useCallback(
    async (playlistId) => {
      const res = await loadSpotifyRequest(`https://api.spotify.com/v1/playlists/${playlistId}`);
      return res.json();
    },
    [loadSpotifyRequest],
  );

  const getArt = useCallback(async (imageArray, type, getlargest = false) => {
    if (imageArray && imageArray.length > 0) {
      if (getlargest) {
        for (let i = 0; i < imageArray.length; i += 1) {
          if (imageArray[i].url) {
            return imageArray[i].url;
          }
        }
      } else {
        for (let i = imageArray.length - 1; i >= 0; i -= 1) {
          if (imageArray[i].url) {
            return imageArray[i].url;
          }
        }
      }
    }
    if (type === "playlist") {
      return defaultPlaylistImage;
    }
    return null;
  }, []);

  const getArtistImage = useCallback(
    async (artistId) => {
      const artist = await getArtist(artistId);
      return getArt(artist.images, "artist", true);
    },
    [getArtist, getArt],
  );

  const getPlaylistImage = useCallback(
    async (playlistId) => {
      const playlist = await getPlaylist(playlistId);
      return getArt(playlist.images, "playlist", true);
    },
    [getPlaylist, getArt],
  );

  const addTracksToPlaylist = useCallback(
    async (playlistId, trackUris) => {
      const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
      return postRequest(url, {
        uris: trackUris,
      });
    },
    [postRequest],
  );

  const getCurrentUserInfo = useCallback(
    async (accessToken) => {
      const url = "https://api.spotify.com/v1/me";
      try {
        let response = await loadSpotifyRequest(url, {}, accessToken);
        response = await response.json();
        if (response.images && response.images.length === 0) {
          response.images.push({
            url: guestProfileImage,
          });
        }
        return response;
      } catch (e) {
        console.error(e);
        throw new Error("Problem getting current user info");
      }
    },
    [loadSpotifyRequest],
  );

  const getUserInfo = useCallback(
    async (userId) => {
      try {
        const url = `https://api.spotify.com/v1/users/${userId}`;
        const response = await loadSpotifyRequest(url);
        const responseData = await response.json();
        if (responseData.images.length === 0) {
          responseData.images.push({
            url: guestProfileImage,
          });
        }
        return responseData;
      } catch (e) {
        console.error(e);
        throw new Error("Problem getting user info");
      }
    },
    [loadSpotifyRequest],
  );

  const openBracket = useCallback(
    async (uuid, userId, mode = "", state = {}, replace = false) => {
      console.debug(`Opening Bracket: ${uuid}`);
      // open the bracket editor and pass the bracket id off
      if (typeof window !== "undefined") {
        console.log("nav to", `/user/${userId || getUserInfo(userId).id}/bracket/${uuid}/${mode}`, state);
        navigate(`/user/${userId || getUserInfo(userId).id}/bracket/${uuid}/${mode}`, {
          state: state,
          replace: replace,
        });
      }
    },
    [getUserInfo],
  );

  const generateCodeChallenge = useCallback(async (codeVerifier) => {
    function base64encode(string) {
      return window
        .btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);

    return base64encode(digest);
  }, []);

  // AUTH FUNCTIONS

  const login = useCallback(async () => {
    // Generate and save state
    const state = generateRandomString(16);
    sessionStorage.setItem(stateKey, state);

    // Generate and save code verifier
    const codeVerifier = generateRandomString(128);
    sessionStorage.setItem(codeVerifierKey, codeVerifier);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const args = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: scope,
      redirect_uri: redirectUri,
      state: state,
      code_challenge_method: codeChallengeMethod,
      code_challenge: codeChallenge,
    });

    console.debug("going to:", `https://accounts.spotify.com/authorize?${args}`);

    window.location = `https://accounts.spotify.com/authorize?${args}`;
  }, [generateCodeChallenge, generateRandomString, redirectUri]);

  const calculateExpiresAt = useCallback((expiresIn) => Date.now() + parseInt(expiresIn, 10) * 1000, []);

  const loginCallback = useCallback(
    async (urlParams) => {
      if (urlParams && urlParams.has("code") && urlParams.get("state") === sessionStorage.getItem(stateKey)) {
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code: urlParams.get("code"),
            redirect_uri: redirectUri,
            client_id: clientId,
            code_verifier: sessionStorage.getItem(codeVerifierKey),
          }),
        });
        // Make sure request is successful
        if (!response.ok) {
          throw new Error("Problem logging in");
        }
        // Parse and store data
        const data = await response.json();
        const expiresAt = calculateExpiresAt(data.expires_in);
        // remove spotify auth state
        sessionStorage.removeItem(stateKey);
        // remove spotify auth code verifier
        sessionStorage.removeItem(codeVerifierKey);
        return {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: expiresAt,
        };
      }
      throw new Error("Invalid url params");
    },
    [redirectUri],
  );

  const refreshLogin = useCallback(async (refreshToken) => {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
      }),
    });
    // Make sure request is successful
    if (!response.ok) {
      throw new Error("Problem refreshing login");
    }
    // Parse and store data
    const data = await response.json();
    const expiresAt = calculateExpiresAt(data.expires_in);
    return {
      accessToken: data.access_token,
      expiresAt: expiresAt,
      refreshToken: data.refresh_token,
    };
  }, []);

  return {
    addTracksToPlaylist,
    getArt,
    login,
    loginCallback,
    refreshLogin,
    getCurrentUserInfo,
    getUserInfo,
    postRequest,
    loadSpotifyRequest,
    openBracket,
    getArtist,
    getPlaylist,
    getArtistImage,
    getPlaylistImage,
    search,
  };
}
