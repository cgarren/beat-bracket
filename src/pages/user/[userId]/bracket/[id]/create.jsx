/* eslint-disable prettier/prettier */
// React
import React, { useEffect, useState, useMemo, useCallback, useContext } from "react";
import { navigate } from "gatsby";
import toast from "react-hot-toast";
// Third Party
// import Mousetrap from "mousetrap";
import { useQuery } from "@tanstack/react-query";
// Components
import Seo from "../../../../../components/SEO";
import Layout from "../../../../../components/Layout";
import LoadingIndicator from "../../../../../components/LoadingIndicator";
import BracketOptions from "../../../../../components/Controls/BracketOptions";
import CreateBracket from "../../../../../components/Bracket/CreateBracket";
// Hooks
import useBracketGeneration from "../../../../../hooks/useBracketGeneration";
import useHelper from "../../../../../hooks/useHelper";
import useBackend from "../../../../../hooks/useBackend";
import useSpotify from "../../../../../hooks/useSpotify";
import useSongProcessing from "../../../../../hooks/useSongProcessing";
// Context
import { LoginContext } from "../../../../../context/LoginContext";

export default function App({ params, location }) {
  const defaultValues = useMemo(
    () => ({
      owner: { name: undefined, id: params.userId },
      seedingMethod: "popularity",
      inclusionMethod: "popularity",
      limit: 32,
      allTracks: [],
      bracket: new Map(),
      template: { id: null, ownerId: null, displayName: null },
      songSource: { type: undefined },
      showBracket: false,
      loadingText: "Loading...",
      alertInfo: { show: false, message: null, type: null, timeoutId: null },
    }),
    [params.userId],
  );

  const [owner, setOwner] = useState(defaultValues.owner);
  const [seedingMethod, setSeedingMethod] = useState(defaultValues.seedingMethod);
  const [inclusionMethod, setInclusionMethod] = useState(defaultValues.inclusionMethod);
  const [limit, setLimit] = useState(defaultValues.limit);
  const [allTracks, setAllTracks] = useState(defaultValues.allTracks);
  // const [commands, setCommands] = useState(defaultValues.commands);
  const [bracket, setBracket] = useState(defaultValues.bracket);
  const [songSource, setSongSource] = useState(defaultValues.songSource);
  const [showBracket, setShowBracket] = useState(defaultValues.showBracket);
  const [loadingText, setLoadingText] = useState(defaultValues.loadingText);
  const [playbackEnabled] = useState(defaultValues.playbackEnabled);
  const { loggedIn } = useContext(LoginContext);
  const { isCurrentUser, getUserInfo, getArt } = useSpotify();
  const { nearestLesserPowerOf2 } = useHelper();
  const { createBracket, getBracket } = useBackend();
  const { seedBracket, sortTracks, loadAlbums, processTracks, loadPlaylistTracks } = useSongProcessing();
  const { getNumberOfColumns, fillBracket } = useBracketGeneration();

  const editable = loggedIn && isCurrentUser(owner.id);
  const { data: art } = useQuery({
    queryKey: ["art-large", { spotifyId: songSource[songSource.type] && songSource[songSource.type].id }],
    queryFn: () => getArt(songSource[songSource.type].images, songSource.type, true),
    enabled: songSource && Boolean(songSource[songSource.type]?.images),
  });

  const bracketTracks = useMemo(() => {
    const tracks = [];
    if (bracket) {
      bracket.forEach((item) => {
        if (item.song && item.col === 0) {
          tracks.push(item.song);
        }
      });
    }
    return tracks;
  }, [bracket]);

  // START BRACKET

  const makeCreationObject = useCallback(async () => {
    const bracketObject = Object.fromEntries(bracket);
    return {
      bracketId: params.id,
      ownerUsername: owner.name,
      seedingMethod: seedingMethod,
      inclusionMethod: inclusionMethod,
      displayName: null,
      songSource: songSource,
      tracks: bracketTracks,
      bracketData: bracketObject,
    };
  }, [bracket, bracketTracks, inclusionMethod, owner.name, seedingMethod, songSource]);

  const startBracket = useCallback(async () => {
    try {
      const creationObj = await makeCreationObject();
      await createBracket(creationObj);
      console.debug("Bracket created");
      navigate(`/user/${owner.id}/bracket/${params.id}/fill`);
      return true;
    } catch (error) {
      if (error.cause && error.cause.code === 429) {
        toast.error("Error creating bracket! Please try again later");
        console.error(error);
      } else {
        toast.error(error.message);
        console.error(error);
      }
      return false;
    }
  }, [makeCreationObject, createBracket]);

  // GET TRACKS

  const getTracks = useCallback(
    async (newSongSource, newLimit) => {
      if (!newSongSource || !newSongSource.type) {
        return [];
      }

      console.debug("Getting tracks...");
      // load the tracks from spotify
      let templist;
      let selectionName = "";
      if (newSongSource.type === "artist") {
        selectionName = newSongSource.artist.name;
      } else if (newSongSource.type === "playlist") {
        selectionName = newSongSource.playlist.name;
      }
      if (newSongSource.type === "artist") {
        setLoadingText(`Gathering Spotify tracks for ${newSongSource.artist.name}...`);
        const songPossibilities = await loadAlbums(
          `https://api.spotify.com/v1/artists/${newSongSource.artist.id}/albums?include_groups=album,single,compilation&limit=20`,
          newSongSource.artist.id,
        );
        if (!songPossibilities) {
          toast.error("Error loading tracks from Spotify");
          return [];
        }
        // load data for the songs
        setLoadingText("Gathering track information...");
        templist = await processTracks(songPossibilities);
      } else if (newSongSource.type === "playlist") {
        setLoadingText(`Gathering Spotify tracks from ${newSongSource.playlist.name}...`);
        templist = await loadPlaylistTracks(
          `https://api.spotify.com/v1/playlists/${newSongSource.playlist.id}/tracks?limit=50`,
        );
        // throw new Error("Playlists not supported yet");
      } else {
        throw new Error(`Invalid songSource type: ${newSongSource.type}`);
      }
      if (!templist) {
        toast.error("Error loading tracks from Spotify");
        return [];
      }
      // if there are than 8 songs, stop
      if (templist.length < 8) {
        alert(`${selectionName} doesn't have enough songs on Spotify! Try another ${newSongSource.type}.`);
        setSongSource({ type: undefined, name: undefined, id: undefined });
        navigate("/my-brackets");
        return [];
      }
      setAllTracks(templist);
      if (templist.length < newLimit) {
        const power = nearestLesserPowerOf2(templist.length);
        setLimit(power);
      }
      setLoadingText("Generating bracket...");
      console.debug("Done getting tracks...");
      return templist;
    },
    [setAllTracks, setLimit, setSongSource, loadAlbums, loadPlaylistTracks, processTracks, nearestLesserPowerOf2],
  );

  const changeBracket = useCallback(
    async (
      customAllTracks = allTracks,
      customLimit = limit,
      customSeedingMethod = seedingMethod,
      customInclusionMethod = inclusionMethod,
    ) => {
      let tracks = customAllTracks;
      if (!tracks || tracks.length === 0) {
        tracks = await getTracks(songSource, customLimit);
      }
      const power = nearestLesserPowerOf2(tracks.length);
      // setLoadingText("Seeding tracks by " + seedingMethod + "...");
      // sort the list by include method
      let newCustomAllTracks = await sortTracks(tracks, customInclusionMethod);
      const numTracks = customLimit < power ? customLimit : power;
      // cut the list dowwn to the max number of tracks
      newCustomAllTracks = newCustomAllTracks.slice(0, numTracks);
      // seed the bracket
      newCustomAllTracks = await seedBracket(newCustomAllTracks, customSeedingMethod);
      if (newCustomAllTracks && newCustomAllTracks.length > 0) {
        const temp = await fillBracket(newCustomAllTracks, getNumberOfColumns(newCustomAllTracks.length));
        setBracket(temp);
        return temp;
      }
      return null;
    },
    [
      allTracks,
      limit,
      seedingMethod,
      inclusionMethod,
      songSource,
      getTracks,
      sortTracks,
      seedBracket,
      fillBracket,
      nearestLesserPowerOf2,
      getNumberOfColumns,
    ],
  );

  const initializeBracketFromSource = useCallback(
    async (newSongSource, ownerId, newLimit) => {
      console.debug("Creating new bracket...");

      // set owner details
      const newUserInfo = await getUserInfo(ownerId);
      setOwner({ id: newUserInfo.id, name: newUserInfo.display_name });

      // don't show the bracket while we get things ready
      setShowBracket(false);

      // set song source from passed in data
      setSongSource(newSongSource);

      // get tracks from spotify
      console.debug("Kicking off track getting...");
      const tempTrackList = await getTracks(newSongSource, newLimit);

      // kick off the bracket creation process
      await changeBracket(tempTrackList);
    },
    [changeBracket, getTracks, getUserInfo, setShowBracket, setSongSource],
  );

  // INITIALIZE BRACKET

  const kickOff = useCallback(async () => {
    if (location.state?.artist || location.state?.playlist) {
      try {
        const initObject = location.state;
        delete initObject.key;
        await initializeBracketFromSource(initObject, owner.id, limit);
      } catch (e) {
        toast.error("Error creating bracket");
        console.error(e);
        // throw e;
      }
    } else {
      // Bracket doesn't exist and no artist was passed in
      setBracket(null);
    }
  }, [initializeBracketFromSource, owner.id, limit, setBracket, getBracket]);

  useEffect(() => {
    kickOff();
  }, []);

  const noChanges = useCallback((navigateAway) => {
    if (navigateAway && window.confirm("You have bracket changes that will be lost! Proceed anyways?")) {
      return true;
    }
    return false;
  }, []);

  // UNDO

  // think about implementing undo functionality in the future

  // function undo() {
  //   const lastCommand = commands[commands.length - 1];
  //   if (lastCommand) {
  //     // remove the last element
  //     setCommands(commands.splice(0, commands.length - 1));
  //     // run the function that was just popped
  //     lastCommand.inverse();
  //   }
  //   return false;
  // }

  // if (Mousetrap.bind) {
  //   Mousetrap.bind("mod+z", undo);
  // }

  // CHANGE HANDLING

  const limitChange = useCallback(
    async (e) => {
      setLimit(parseInt(e.target.value, 10));
      setShowBracket(false);
      let tempInclusionMethod = inclusionMethod;
      let tempSeedingMethod = seedingMethod;
      if (inclusionMethod === "custom") {
        tempInclusionMethod = "popularity";
        setInclusionMethod("popularity");
      }
      if (seedingMethod === "custom") {
        tempSeedingMethod = "popularity";
        setSeedingMethod("popularity");
      }
      changeBracket(undefined, e.target.value, tempSeedingMethod, tempInclusionMethod);
    },
    [inclusionMethod, seedingMethod, changeBracket],
  );

  const seedingChange = useCallback(
    async (e) => {
      setSeedingMethod(e.target.value);
      setShowBracket(false);
      if (inclusionMethod === "custom") {
        changeBracket(bracketTracks, undefined, e.target.value);
      } else {
        changeBracket(undefined, undefined, e.target.value);
      }
    },
    [bracketTracks, inclusionMethod, changeBracket],
  );

  const inclusionChange = useCallback(
    async (e) => {
      setInclusionMethod(e.target.value);
      setShowBracket(false);
      let tempSeedingMethod = seedingMethod;
      if (tempSeedingMethod === "custom" || (e.target.value !== "playlist" && tempSeedingMethod === "playlist")) {
        tempSeedingMethod = "popularity";
        setSeedingMethod("popularity");
      }
      changeBracket(undefined, undefined, tempSeedingMethod, e.target.value);
    },
    [seedingMethod, changeBracket],
  );

  // redirect
  if (!(location.state?.artist || location.state?.playlist)) {
    navigate(`/user/${params.userId}/bracket/${params.id}`);
    // return <Redirect to={`/user/${params.userId}/bracket/${params.id}/fill`} />;
  }

  return (
    <Layout noChanges={noChanges} path={location.pathname}>
      <div className="text-center">
        <h1>
          {owner.name && songSource && bracket && bracketTracks && (
            <div className="mx-auto mb-2 flex flex-col gap-0 items-center justify-center max-w-[90%]">
              <div className="flex flex-row text-xl items-center justify-center gap-1 max-w-full">
                <span className="truncate w-auto font-bold">Customize Bracket</span>
              </div>
              {art && <img src={art} alt={songSource[songSource.type].name} className="h-32 w-32" />}
              {songSource[songSource.type].name}
            </div>
          )}
        </h1>
      </div>
      <hr />
      <LoadingIndicator hidden={showBracket || !owner.name || !songSource} loadingText={loadingText} />
      <div hidden={!showBracket || !editable} className="text-lg">
        {"<CHANGE THIS FOR EDIT MODE>"}Customize using the controls below. Drag and drop to rearrange songs!
      </div>
      <div hidden={!showBracket || !songSource} className="text-center">
        <div className="text-xs -space-x-px rounded-md sticky mx-auto top-0 w-fit z-30">
          <div className="flex items-center gap-2">
            {editable ? (
              <div className="">
                <BracketOptions
                  songSourceType={songSource.type}
                  limitChange={limitChange}
                  showBracket={showBracket}
                  limit={limit}
                  hardLimit={allTracks.length}
                  seedingChange={seedingChange}
                  seedingMethod={seedingMethod}
                  inclusionChange={inclusionChange}
                  inclusionMethod={inclusionMethod}
                  playbackEnabled={playbackEnabled}
                  startBracket={() => startBracket()}
                />
              </div>
            ) : null}
          </div>
        </div>
        <CreateBracket
          bracket={bracket}
          setBracket={setBracket}
          bracketTracks={bracketTracks}
          allTracks={allTracks}
          setShowBracket={setShowBracket}
          showBracket={showBracket}
          editable={editable}
          songSource={songSource}
          setSeedingMethod={setSeedingMethod}
          setInclusionMethod={setInclusionMethod}
        />
      </div>
    </Layout>
  );
}

export function Head({ params }) {
  // const [name, setName] = useState(null);
  // const [userName, setUserName] = useState(null);

  // useEffect(() => {
  //   async function updateTitle() {
  //     if (params && params.id && params.userId) {
  //       try {
  //         const loadedBracket = await getBracket(params.id, params.userId);
  //         if (loadedBracket && loadedBracket.userName) {
  //           setUserName(loadedBracket.userName);
  //           if (loadedBracket.songSource && loadedBracket.songSource.type === "artist") {
  //             setName(loadedBracket.songSource.artist.name);
  //           } else if (loadedBracket.songSource && loadedBracket.songSource.type === "playlist") {
  //             setName(loadedBracket.songSource.playlist.name);
  //           }
  //         }
  //       } catch (error) {

  //       }
  //     }
  //   }
  //   updateTitle();
  // }, [params]);

  return (
    // name && userName ? `${name} bracket by ${userName}` : "View/edit bracket"
    <Seo title="View/edit bracket" />
  );
}
