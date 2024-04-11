import defaultPlaylistImage from "../assets/images/defaultPlaylistImage.png";
import axiosInstance from "../axios/spotifyInstance";

export async function search(query, type, limit) {
  const params = { q: query, type: type, limit: limit };
  const response = await axiosInstance.get(`search/?${new URLSearchParams(params).toString()}`);
  return response.data;
}

export async function getArtist(artistId) {
  const res = await axiosInstance.get(`artists/${artistId}`);
  return res.data;
}

export async function getPlaylist(playlistId) {
  const res = await axiosInstance.get(`playlists/${playlistId}`);
  return res.data;
}

export async function getArt(imageArray, type, getlargest = false) {
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
}

export async function getArtistImage(artistId) {
  const artist = await getArtist(artistId);
  return getArt(artist.images, "artist", true);
}

export async function getPlaylistImage(playlistId) {
  const playlist = await getPlaylist(playlistId);
  return getArt(playlist.images, "playlist", true);
}

// const addTracksToPlaylist = useCallback(
//   async (playlistId, trackUris) => {
//     const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
//     return postRequest(url, {
//       uris: trackUris,
//     });
//   },
//   [postRequest],
// );

// const getCurrentUserInfo = useCallback(
//   async (accessToken) => {
//     const url = "https://api.spotify.com/v1/me";
//     try {
//       let response = await loadSpotifyRequest(url, {}, accessToken);
//       response = await response.json();
//       if (response.images && response.images.length === 0) {
//         response.images.push({
//           url: guestProfileImage,
//         });
//       }
//       return response;
//     } catch (e) {
//       console.error(e);
//       throw new Error("Problem getting current user info");
//     }
//   },
//   [loadSpotifyRequest],
// );

// const getUserInfo = useCallback(
//   async (userId) => {
//     try {
//       const url = `https://api.spotify.com/v1/users/${userId}`;
//       const response = await loadSpotifyRequest(url);
//       const responseData = await response.json();
//       if (responseData.images.length === 0) {
//         responseData.images.push({
//           url: guestProfileImage,
//         });
//       }
//       return responseData;
//     } catch (e) {
//       console.error(e);
//       throw new Error("Problem getting user info");
//     }
//   },
//   [loadSpotifyRequest],
