import { useCallback } from "react";
import { popularitySort, shuffleArray } from "../utils/helpers";
import axiosInstance from "../axios/spotifyInstance";

export default function useSongProcessing() {
  const sortTracks = useCallback(async (trackList, sortingMethod) => {
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
  }, []);

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
    [arrangeSeeds],
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
            const response = await axiosInstance.get(`tracks/${track.id}`);
            const trackData = response.data;
            return { ...track, preview_url: trackData.preview_url };
          }
          return track;
        }),
      ),
    [],
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
        const response = await axiosInstance.get(`tracks?ids=${idString}`);
        const trackList = response.data;
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
    [makeTrackObject, selectTrackVersion],
  );

  // could proabbaly amke this mroe efficient by creating the promises and calling them all at once
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
      const response = await axiosInstance.get(url);
      const albumList = response.data;
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
    [checkTaylorSwift],
  );

  const loadAlbums = useCallback(
    async (url, artistId, songs = {}) => {
      const response = await axiosInstance.get(url);
      const albumList = response.data;
      if (albumList?.items.length > 0) {
        const albumIds = [];
        albumList?.items?.forEach((item) => {
          albumIds.push(item?.id);
        });
        const tracksurl = `albums?ids=${albumIds.join()}`;
        // eslint-disable-next-line no-param-reassign
        songs = await loadTracks(tracksurl, songs, artistId);
      }
      if (albumList?.next) {
        await loadAlbums(albumList?.next, artistId, songs);
      }
      return songs;
    },
    [loadTracks],
  );

  const loadPlaylistTracks = useCallback(
    async (url, songs = []) => {
      const response = await axiosInstance.get(url);
      const trackList = response.data;
      if (trackList?.items.length > 0) {
        await Promise.all(
          trackList?.items?.map(async (item) => {
            const trackObject = makeTrackObject(item?.track);
            if (trackObject) {
              songs.push(trackObject);
            }
          }),
        );
      }
      if (trackList?.next) {
        await loadPlaylistTracks(trackList?.next, songs);
      }
      return songs;
    },
    [makeTrackObject],
  );

  const loadPlaylists = useCallback(async (url, playlists = [], playlistIds = {}) => {
    const response = await axiosInstance.get(url);
    const playlistList = response.data;
    if (playlistList?.items.length > 0) {
      // playlists.push(...playlistList.items);
      playlistList.items.forEach((playlist) => {
        // Check if the playlist is already in the list to avoid duplicates (have to do this since the spotify API SUCKS!!!!!!!)
        if (playlistIds[playlist.id] === undefined) {
          playlistIds[playlist.id] = playlist.name; // eslint-disable-line no-param-reassign
          playlists.push(playlist);
        }
      });
    }
    if (playlistList.next) {
      await loadPlaylists(playlistList.next, playlists, playlistIds);
    }
    return playlists;
  }, []);

  const getArtistTracks = useCallback(
    async (artistId) => {
      const tracks = await loadAlbums(
        `artists/${artistId}/albums?include_groups=album,single,compilation&limit=20`,
        artistId,
      );
      return processTracks(tracks);
    },
    [processTracks, loadAlbums],
  );

  const getPlaylistTracks = useCallback(
    async (playlistId) => loadPlaylistTracks(`playlists/${playlistId}/tracks?limit=50`),
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
