/* eslint-disable prettier/prettier */
// React
import React, { useEffect, useState, useMemo, useCallback, useContext } from "react";
import { Link } from "gatsby";
import toast from "react-hot-toast";
// import Mousetrap from "mousetrap";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// Helpers
import {
  nearestLesserPowerOf2,
  nearestGreaterPowerOf2,
  camelCaseToTitleCase,
  isEdgeSong,
} from "../../../../../utils/helpers";
import { createBracket } from "../../../../../utils/backend";
import { openBracket } from "../../../../../utils/impureHelpers";
// Components
import Seo from "../../../../../components/SEO";
import Layout from "../../../../../components/Layout";
import LoadingIndicator from "../../../../../components/LoadingIndicator";
import BracketOptions from "../../../../../components/Controls/BracketOptions";
import CreateBracket from "../../../../../components/Bracket/CreateBracket";
import BracketHeader from "../../../../../components/BracketHeader";
// Hooks
import useBracketGeneration from "../../../../../hooks/useBracketGeneration";
import useSongProcessing from "../../../../../hooks/useSongProcessing";
import useAuthentication from "../../../../../hooks/useAuthentication";
import { Button } from "../../../../../components/ui/button";
// Context
import { MixpanelContext } from "../../../../../context/MixpanelContext";
import { UserInfoContext } from "../../../../../context/UserInfoContext";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../../../components/ui/accordion";

export default function App({ params, location }) {
  const [seedingMethod, setSeedingMethod] = useState("popularity");
  const [inclusionMethod, setInclusionMethod] = useState("popularity");
  const [limit, setLimit] = useState(32);
  // const [commands, setCommands] = useState(defaultValues.commands);
  const [bracket, setBracket] = useState(new Map());
  const [showBracket, setShowBracket] = useState(false);
  const [playbackEnabled] = useState(true);

  const { isCurrentUser } = useAuthentication();
  const { seedBracket, sortTracks, getArtistTracks, getPlaylistTracks, arrangeSeeds } = useSongProcessing();
  const { getNumberOfColumns, fillBracket } = useBracketGeneration();

  const mixpanel = useContext(MixpanelContext);
  const userInfo = useContext(UserInfoContext);
  const queryClient = useQueryClient();

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
    queryKey: ["spotify", "tracks", { id: songSource?.type ? songSource[songSource.type]?.id : null }],
    queryFn: async () => getTracks(songSource),
    enabled: Boolean(songSource && songSource?.type && songSource[songSource?.type]?.id),
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
        if (item.song && isEdgeSong(item, (id) => bracket.get(id))) {
          tracks.push(item.song);
        }
      });
    }
    return tracks;
  }, [bracket]);

  const hardLimit = allTracks?.length > 512 ? 512 : allTracks?.length;

  const trackedProps = useMemo(
    () => ({
      "Bracket Id": params?.id,
      "Owner Username": owner?.name,
      "Seeding Method": seedingMethod,
      "Inclusion Method": inclusionMethod,
      "Song Source Type": songSource?.type,
      "Song Source Name": songSource?.[songSource?.type]?.name,
      "Song Source Id": songSource?.[songSource?.type]?.id,
      Tracks: bracketTracks?.length,
    }),
    [params?.id, owner?.name, seedingMethod, inclusionMethod, songSource, bracketTracks?.length],
  );

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
        queryClient.refetchQueries({ queryKey: ["backend", "brackets", { userId: owner.id }] });

        openBracket(params.id, owner.id, "fill", {}, { replace: true });
        return true;
      } catch (error) {
        if (error?.cause?.code === 429) {
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
      const greaterPower = nearestGreaterPowerOf2(customLimit);

      // sort the list by inclusion method
      let newCustomAllTracks = await sortTracks(customAllTracks, customInclusionMethod);

      // limit the list to the selected limit
      newCustomAllTracks = newCustomAllTracks.slice(0, customLimit);

      // sort the list by seeding method
      newCustomAllTracks = await sortTracks(newCustomAllTracks, customSeedingMethod);

      // add seed numbers
      newCustomAllTracks = newCustomAllTracks.map((track, index) => {
        const newTrack = { ...track, seed: index + 1 };
        return newTrack;
      });

      // calculate the number of tracks to use for the base bracket, before byes
      const numTracks = Number(customLimit) === greaterPower ? customLimit : greaterPower;

      // fill in the bracket with byes
      for (let i = newCustomAllTracks.length; i < numTracks; i += 1) {
        newCustomAllTracks.push({ seed: i + 1 });
      }

      // arrange the seeds
      newCustomAllTracks = await arrangeSeeds(newCustomAllTracks);

      if (newCustomAllTracks?.length > 0) {
        // create the bracket and relate songs
        const temp = await fillBracket(newCustomAllTracks, getNumberOfColumns(newCustomAllTracks.length));
        setBracket(temp);
        return temp;
      }
      return null;
    },
    [allTracks, limit, seedingMethod, inclusionMethod, sortTracks, seedBracket, fillBracket, getNumberOfColumns],
  );

  useEffect(() => {
    if (allTracks) {
      const power = nearestLesserPowerOf2(allTracks.length);
      const tempLimit = limit < power ? limit : power;
      setLimit(tempLimit);
      changeBracket(allTracks, tempLimit);
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
    async (value) => {
      mixpanel.track("Change Bracket Size", {
        Tracks: value,
      });
      setLimit(parseInt(value, 10));
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
      if (String(hardLimit) === value && songSource?.type === "playlist") {
        setInclusionMethod("playlist");
      }
      changeBracket(undefined, value, tempSeedingMethod, tempInclusionMethod);
    },
    [inclusionMethod, seedingMethod, changeBracket],
  );

  const seedingChange = useCallback(
    async (value) => {
      mixpanel.track("Change Seeding Method", {
        "Seeding Method": value,
      });
      setSeedingMethod(value);
      setShowBracket(false);
      if (inclusionMethod === "custom") {
        changeBracket(bracketTracks, undefined, value);
      } else {
        changeBracket(undefined, undefined, value);
      }
    },
    [bracketTracks, inclusionMethod, changeBracket],
  );

  const inclusionChange = useCallback(
    async (value) => {
      mixpanel.track("Change Inclusion Method", {
        "Inclusion Method": value,
      });
      setInclusionMethod(value);
      setShowBracket(false);
      let tempSeedingMethod = seedingMethod;
      if (tempSeedingMethod === "custom" || (value !== "playlist" && tempSeedingMethod === "playlist")) {
        tempSeedingMethod = "popularity";
        setSeedingMethod("popularity");
      }
      changeBracket(undefined, undefined, tempSeedingMethod, value);
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
            <Link to="/my-brackets" className="mt-2">
              Go Back
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout noChanges={noChanges} path={location.pathname} pageName="Create Bracket" trackedProps={trackedProps}>
      {owner?.name && songSource && bracket && bracketTracks && (
        <div className="mb-1 text-center">
          Customize Bracket
          <BracketHeader songSource={songSource} owner={null} template={null} bracketTracks={null} />
          <Accordion
            type="single"
            collapsible
            className="w-fit max-w-lg mx-auto m-0"
            onValueChange={(value) => {
              if (value.length > 0) {
                mixpanel.track("Open FAQ", {
                  "FAQ Group": "Customization Help",
                  "Open Question": camelCaseToTitleCase(value),
                });
              }
            }}
          >
            <AccordionItem
              value="customizationHelp"
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
              hardLimit={hardLimit}
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

export function Head({ params, location }) {
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
    <Seo title="Create Bracket" pathname={location.pathname} />
  );
}
