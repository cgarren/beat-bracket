/* eslint-disable prettier/prettier */
// React
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "gatsby";
import toast from "react-hot-toast";
// Third Party
import mixpanel from "mixpanel-browser";
// import Mousetrap from "mousetrap";
import { useQuery } from "@tanstack/react-query";
// Components
import Seo from "../../../../../components/SEO";
import Layout from "../../../../../components/Layout";
import LoadingIndicator from "../../../../../components/LoadingIndicator";
import BracketOptions from "../../../../../components/Controls/BracketOptions";
import CreateBracket from "../../../../../components/Bracket/CreateBracket";
import BracketHeader from "../../../../../components/BracketHeader";
// Hooks
import useBracketGeneration from "../../../../../hooks/useBracketGeneration";
import useHelper from "../../../../../hooks/useHelper";
import useBackend from "../../../../../hooks/useBackend";
import useSpotify from "../../../../../hooks/useSpotify";
import useSongProcessing from "../../../../../hooks/useSongProcessing";
import useAuthentication from "../../../../../hooks/useAuthentication";
import useUserInfo from "../../../../../hooks/useUserInfo";
import { Button } from "../../../../../components/ui/button";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../../../components/ui/accordion";

export default function App({ params, location }) {
  const [seedingMethod, setSeedingMethod] = useState("popularity");
  const [inclusionMethod, setInclusionMethod] = useState("popularity");
  const [limit, setLimit] = useState(32);
  // const [commands, setCommands] = useState(defaultValues.commands);
  const [bracket, setBracket] = useState(new Map());
  const [showBracket, setShowBracket] = useState(false);
  const [playbackEnabled] = useState(true);

  const { openBracket } = useSpotify();
  const { isCurrentUser } = useAuthentication();
  const { nearestLesserPowerOf2 } = useHelper();
  const { createBracket } = useBackend();
  const { seedBracket, sortTracks, getArtistTracks, getPlaylistTracks } = useSongProcessing();
  const { getNumberOfColumns, fillBracket } = useBracketGeneration();

  const { data: userInfo } = useUserInfo();

  const songSource = useMemo(() => {
    const newSongSource = location?.state;
    if (newSongSource?.key) {
      delete newSongSource.key;
    }
    return newSongSource;
  }, [location?.state]);

  const owner = useMemo(
    () => ({ name: userInfo?.display_name, id: params.userId }),
    [userInfo?.display_name, params?.userId],
  );

  const getTracks = useCallback(async () => {
    if (songSource?.type === "artist") {
      return getArtistTracks(songSource.artist.id);
    }

    if (songSource?.type === "playlist") {
      return getPlaylistTracks(songSource.playlist.id);
    }
    return [];
  }, [getArtistTracks, getPlaylistTracks, songSource]);

  const { data: allTracks, isPending: loadingTracks } = useQuery({
    queryKey: ["tracks", { id: songSource ? songSource[songSource.type].id : null }],
    queryFn: async () => getTracks(songSource),
    enabled: Boolean(songSource),
    refetchOnWindowFocus: false,
    staleTime: 3600000,
    meta: {
      errorMessage: "Error loading tracks from Spotify",
    },
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
    if (owner?.name) {
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
    }
    return null;
  }, [bracket, bracketTracks, inclusionMethod, owner?.name, seedingMethod, songSource]);

  const startBracket = useCallback(async () => {
    if (owner?.name) {
      try {
        const creationObj = await makeCreationObject();
        await createBracket(creationObj);
        console.debug("Bracket created");
        // navigate(`/user/${owner.id}/bracket/${params.id}/fill`);
        openBracket(params.id, owner.id, "fill", {}, { replace: true });
        return true;
      } catch (error) {
        if (error.cause && error.cause.code === 429) {
          toast.error("Error creating bracket! Traffic is high right now. Try again in a few minutes!");
          console.error(error);
        } else {
          toast.error(error.message);
          console.error(error);
        }
        return false;
      }
    } else {
      toast.error("Error creating bracket!");
    }
    return false;
  }, [makeCreationObject, createBracket]);

  const changeBracket = useCallback(
    async (
      customAllTracks = allTracks,
      customLimit = limit,
      customSeedingMethod = seedingMethod,
      customInclusionMethod = inclusionMethod,
    ) => {
      const power = nearestLesserPowerOf2(customAllTracks.length);
      // setLoadingText("Seeding tracks by " + seedingMethod + "...");
      // sort the list by include method
      let newCustomAllTracks = await sortTracks(customAllTracks, customInclusionMethod);
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
      sortTracks,
      seedBracket,
      fillBracket,
      nearestLesserPowerOf2,
      getNumberOfColumns,
    ],
  );

  useEffect(() => {
    if (allTracks) {
      const power = nearestLesserPowerOf2(allTracks.length);
      setLimit(limit < power ? limit : power);
      changeBracket(allTracks);
    }
  }, [allTracks]);

  const noChanges = useCallback((navigateAway) => {
    if (
      navigateAway &&
      window.confirm(
        "You haven't started this bracket yet! If you leave this page, all customizations will be lost. Proceed anyways?",
      )
    ) {
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
  if (!(location.state?.artist || location.state?.playlist) || !isCurrentUser(params.userId)) {
    openBracket(params.id, params.userId);
  }

  // loading tracks state
  if (loadingTracks) {
    return (
      <Layout noChanges={noChanges} path={location.pathname}>
        <LoadingIndicator
          loadingText={
            songSource?.type && songSource[songSource.type].name
              ? `Gathering Spotify tracks for ${songSource[songSource.type].name}...`
              : "Loading tracks..."
          }
        />
      </Layout>
    );
  }

  if (allTracks?.length < 8) {
    return (
      <Layout noChanges={noChanges} path={location.pathname}>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Not enough songs</h1>
          <p className="text-lg mb-1">
            {songSource?.type === "artist"
              ? `${songSource.artist.name} doesn't have enough songs on Spotify! Try another artist.`
              : `${songSource.playlist.name} doesn't have enough songs on Spotify! Try another playlist.`}
          </p>
          <Button asChild>
            <Link to="/my-brackets">Shucks</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout noChanges={noChanges} path={location.pathname}>
      {owner?.name && songSource && bracket && bracketTracks && (
        <div className="mb-1 text-center">
          Customize Bracket
          <BracketHeader songSource={songSource} owner={null} template={null} bracketTracks={null} />
          <Accordion type="single" collapsible className="w-fit max-w-lg mx-auto m-0">
            <AccordionItem
              value="customization-help"
              className="rounded-lg data-[state=open]:bg-white data-[state=open]:pt-3 data-[state=open]:ring-black/5 data-[state=open]:ring-1 data-[state=open]:shadow-lg px-3"
            >
              <AccordionTrigger className="hover:no-underline p-0 mb-1 font-bold">
                How do I customize my bracket?
              </AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal list-inside text-left w-fit mx-auto">
                  <li>
                    Select a <span className="font-bold">bracket size</span>,{" "}
                    <span className="font-bold">inclusion method</span>, and{" "}
                    <span className="font-bold">seeding method</span>
                  </li>
                  <li>
                    Optionally, <span className="font-bold">drag and drop</span> songs to rearrange them or{" "}
                    <span className="font-bold">click the double arrow</span> on any song to switch it out with another
                  </li>
                  <li>
                    Click &quot;<span className="font-bold">Start Bracket</span>&quot; to start filling out your bracket
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
      {!showBracket && owner.name && songSource && <LoadingIndicator loadingText="Generating bracket..." />}
      <div hidden={!showBracket || !songSource} className="text-center">
        <div className="text-xs -space-x-px rounded-md sticky mx-auto top-0 w-fit z-30">
          <div className="flex items-center gap-2">
            <BracketOptions
              songSourceType={songSource?.type}
              limitChange={limitChange}
              showBracket={showBracket}
              limit={limit}
              hardLimit={allTracks?.length}
              seedingChange={seedingChange}
              seedingMethod={seedingMethod}
              inclusionChange={inclusionChange}
              inclusionMethod={inclusionMethod}
              playbackEnabled={playbackEnabled}
              startBracket={() => startBracket()}
            />
          </div>
        </div>
        <CreateBracket
          bracket={bracket}
          setBracket={setBracket}
          bracketTracks={bracketTracks}
          allTracks={allTracks}
          setShowBracket={setShowBracket}
          showBracket={showBracket}
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
