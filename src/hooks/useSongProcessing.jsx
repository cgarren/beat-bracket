import { useCallback } from "react";
import useHelper from "./useHelper";
import useSpotify from "./useSpotify";

export default function useSongProcessing() {
  const { loadSpotifyRequest } = useSpotify();
  const { popularitySort, shuffleArray } = useHelper();

  const sortTracks = useCallback(
    async (trackList, sortingMethod) => {
      switch (sortingMethod) {
        case "random":
          return shuffleArray(trackList);
        case "popularity":
          return trackList.toSorted(popularitySort);
        case "playlist":
          return trackList;
        case "custom":
          return trackList;
        default:
          return trackList;
      }
    },
    [popularitySort, shuffleArray],
  );

  const arrangeSeeds = useCallback(async (bracketList) => {
    let slice = 1;
    let temp;
    let newBracketList = [...bracketList];
    while (slice < newBracketList.length / 2) {
      temp = newBracketList;
      newBracketList = [];

      while (temp.length > 0) {
        newBracketList = newBracketList.concat(temp.splice(0, slice)); // n from the beginning
        newBracketList = newBracketList.concat(temp.splice(-slice, slice)); // n from the end
      }

      slice *= 2;
    }
    return newBracketList;
  }, []);

  const seedBracket = useCallback(
    async (trackList, seedingMethod) => {
      switch (seedingMethod) {
        case "random":
          return shuffleArray(trackList);
        case "popularity": {
          const temp = trackList.toSorted(popularitySort);
          // console.table(trackList);
          return arrangeSeeds(temp);
        }
        case "playlist":
          return arrangeSeeds(trackList);
        case "custom":
          return trackList;
        default:
          return trackList;
      }
    },
    [arrangeSeeds, popularitySort, shuffleArray],
  );

  const selectTrackVersion = useCallback((numTracks, tracks, featuredList) => {
    let highestPop = 0;
    let selectedTrack = null;
    for (let i = 0; i < numTracks; i += 1) {
      const track = tracks.shift();
      const feature = featuredList.shift();
      try {
        if (track?.popularity >= highestPop) {
          selectedTrack = track;
          selectedTrack.feature = feature;
          highestPop = track.popularity;
        }
      } catch (error) {
        console.debug("track:", track, "tracks:", tracks, "numTracks:", numTracks);
        throw error;
      }
    }
    return selectedTrack;
  }, []);

  const makeTrackObject = useCallback((track) => {
    try {
      return {
        name: track.name,
        feature: track.feature,
        art: track.album.images.length > 0 ? track.album.images[0].url : null,
        id: track.id,
        popularity: track.popularity,
        preview_url: track.preview_url,
        artist: track.artists[0].name,
        album: track.album.name,
      };
    } catch (error) {
      console.warn("error processing track:", track);
      return null;
    }
  }, []);

  const updatePreviewUrls = useCallback(
    async (trackList) =>
      Promise.all(
        trackList.map(async (track) => {
          if (!track.preview_url) {
            const url = `https://api.spotify.com/v1/tracks/${track.id}`;
            const response = await loadSpotifyRequest(url);
            const trackData = await response.json();
            return { ...track, preview_url: trackData.preview_url };
          }
          return track;
        }),
      ),
    [loadSpotifyRequest],
  );

  const loadTrackData = useCallback(
    async (idList, trackOptionsAmounts) => {
      const templist = [];
      if (idList.length !== 0) {
        let idString = "";
        const featuredList = [];
        for (let i = 0; i < idList.length; i += 1) {
          idString += idList[i][0];
          if (i !== idList.length - 1) {
            idString += ",";
          }
          featuredList.push(idList[i][1]);
        }
        const url = `https://api.spotify.com/v1/tracks?ids=${idString}`;
        const response = await loadSpotifyRequest(url);
        const trackList = await response.json();
        if (trackList.tracks.length > 0) {
          // eslint-disable-next-line no-restricted-syntax
          for (const numTracks of trackOptionsAmounts) {
            const selectedTrack = selectTrackVersion(numTracks, trackList.tracks, featuredList);
            const trackObject = makeTrackObject(selectedTrack);
            if (trackObject) {
              templist.push(trackObject);
            }
          }
        }
      }
      return templist;
    },
    [loadSpotifyRequest, makeTrackObject, selectTrackVersion],
  );

  const processTracks = useCallback(
    async (songs) => {
      let tempDataList = [];
      let runningList = [];
      let trackOptionsAmounts = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const idList of Object.values(songs)) {
        if (runningList.length + idList.length > 50) {
          const tempData = await loadTrackData(runningList, trackOptionsAmounts);
          if (tempData) {
            tempDataList = tempDataList.concat(tempData);
            runningList = [];
            trackOptionsAmounts = [];
          } else {
            return null;
          }
        }
        // limit to 50 potential tracks per song so that we don't break the API
        runningList.push(...idList.slice(0, 50));
        trackOptionsAmounts.push(idList.length);
      }
      const tempData = await loadTrackData(runningList, trackOptionsAmounts);
      if (tempData) {
        tempDataList = tempDataList.concat(tempData);
      } else {
        return null;
      }
      return tempDataList;
    },
    [loadTrackData],
  );

  const checkTaylorSwift = useCallback((trackName, artistId) => {
    // Gotta account for Taylor's Version
    if (artistId === "06HL4z0CvFAxyc27GXpf02") {
      return trackName.replace(" (Taylor’s Version)", "").replace(" (Taylor's Version)", "");
    }
    return trackName;
  }, []);

  const loadTracks = useCallback(
    async (url, songs, artistId) => {
      const newSongs = { ...songs };
      const response = await loadSpotifyRequest(url);
      const albumList = await response.json();
      if (albumList.albums.length > 0) {
        albumList.albums.forEach((album) => {
          if (album.images.length > 0) {
            // Iterate through the tracks
            album.tracks.items.forEach((track) => {
              // Iterate through the artists to make sure the artist in the bracket is acutally on the track
              for (let i = 0; i < track.artists.length; i += 1) {
                // Check if the artist is the one we're looking for
                if (track.artists[i].id === artistId) {
                  let feature = false;
                  if (i !== 0) {
                    // Main artist
                    feature = true;
                  }

                  // Check if the track is a Taylor's Version
                  const newTrackName = checkTaylorSwift(track.name, artistId);
                  // Check if the track already exists
                  if (newTrackName in newSongs) {
                    // If it does, add the id to the list
                    newSongs[newTrackName].push([track.id, feature]);
                  } else {
                    // If it doesn't, create a new entry
                    newSongs[newTrackName] = [[track.id, feature]];
                  }
                  break;
                }
              }
            });
          }
        });
      }
      return newSongs;
    },
    [loadSpotifyRequest, checkTaylorSwift],
  );

  const loadAlbums = useCallback(
    async (url, artistId, songs = {}) => {
      const response = await loadSpotifyRequest(url);
      const albumList = await response.json();
      if (albumList.items.length > 0) {
        const albumIds = [];
        albumList.items.forEach((item) => {
          albumIds.push(item.id);
        });
        const tracksurl = `https://api.spotify.com/v1/albums?ids=${albumIds.join()}`;
        // eslint-disable-next-line no-param-reassign
        songs = await loadTracks(tracksurl, songs, artistId);
      }
      if (albumList.next) {
        await loadAlbums(albumList.next, artistId, songs);
      }
      return songs;
    },
    [loadSpotifyRequest, loadTracks],
  );

  const loadPlaylistTracks = useCallback(
    async (url, songs = []) => {
      const response = await loadSpotifyRequest(url);
      const trackList = await response.json();
      if (trackList.items.length > 0) {
        await Promise.all(
          trackList.items.map(async (item) => {
            const trackObject = makeTrackObject(item.track);
            if (trackObject) {
              songs.push(trackObject);
            }
          }),
        );
      }
      if (trackList.next) {
        await loadPlaylistTracks(trackList.next, songs);
      }
      return songs;
    },
    [loadSpotifyRequest, makeTrackObject],
  );

  const loadPlaylists = useCallback(
    async (url, playlists = []) => {
      const response = await loadSpotifyRequest(url);
      const playlistList = await response.json();
      if (playlistList.items.length > 0) {
        playlists.push(...playlistList.items);
      }
      if (playlistList.next) {
        await loadPlaylists(playlistList.next, playlists);
      }
      return playlists;
    },
    [loadSpotifyRequest],
  );

  const getArtistTracks = useCallback(
    async (artistId) => {
      const tracks = await loadAlbums(
        `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single,compilation&limit=20`,
        artistId,
      );
      return processTracks(tracks);
    },
    [processTracks, loadAlbums],
  );

  const getPlaylistTracks = useCallback(
    async (playlistId) => loadPlaylistTracks(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`),
    [loadPlaylistTracks],
  );

  return {
    sortTracks,
    seedBracket,
    getArtistTracks,
    getPlaylistTracks,
    loadPlaylists,
    updatePreviewUrls,
  };
}
