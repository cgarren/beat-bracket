/* eslint-disable prettier/prettier */
// React
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDebounce } from "react-use";
// Third Party
import Mousetrap from "mousetrap";
import Confetti from "react-confetti";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
// Helpers
import { bracketSorter, bracketUnchanged, isEdgeSong } from "../../../../../utils/helpers";
import { updateBracket, getBracket, getTemplate, createBracket } from "../../../../../utils/backend";
import { openBracket } from "../../../../../utils/impureHelpers";
// Components
import Seo from "../../../../../components/SEO";
import Layout from "../../../../../components/Layout";
import FillBracket from "../../../../../components/Bracket/FillBracket";
// import GeneratePlaylistButton from "../../../../components/GeneratePlaylistButton";
import BracketCompleteModal from "../../../../../components/Modals/BracketCompleteModal";
// Hooks
import useBracketGeneration from "../../../../../hooks/useBracketGeneration";
import useSongProcessing from "../../../../../hooks/useSongProcessing";
import useAuthentication from "../../../../../hooks/useAuthentication";
import useShareBracket from "../../../../../hooks/useShareBracket";
import useLocalBracketStorage from "../../../../../hooks/useLocalBracketStorage";
// Assets
import ShareIcon from "../../../../../assets/svgs/shareIcon.svg";
import useUserInfo from "../../../../../hooks/useUserInfo";
import LoadingIndicator from "../../../../../components/LoadingIndicator";
import SyncIcon from "../../../../../assets/svgs/syncIcon.svg";
import BracketHeader from "../../../../../components/BracketHeader";
import { Button } from "../../../../../components/ui/button";

export default function App({ params, location }) {
  // State
  const [commands, setCommands] = useState([]);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);

  // Hooks
  const { isCurrentUser } = useAuthentication();
  const { updatePreviewUrls } = useSongProcessing();
  const { getNumberOfColumns, fillBracket, changeBracket: generateBracket } = useBracketGeneration();
  const queryClient = useQueryClient();
  const { share } = useShareBracket(location.href);

  const { data: ownerInfo = {} } = useUserInfo(params.userId)?.data || {};
  const { isPending: ownerPending = false } = useUserInfo(params.userId) || {};

  const owner = useMemo(
    () => ({ name: ownerInfo?.display_name, id: params.userId }),
    [ownerInfo?.display_name, params?.userId],
  );

  const creationPossible = useMemo(
    () => Boolean(location?.state?.template && owner?.name && owner.id && params?.id),
    [location?.state, owner?.name, owner.id, params?.id],
  );

  // Add the bracket sync hook first
  const {
    saveLocal,
    shouldSyncToServer,
    changesSinceSync,
    lastServerSync,
    setChangesSinceSync,
    syncStatus,
    updateSyncStatus,
  } = useLocalBracketStorage({
    bracketId: params.id,
    ownerId: params.userId,
  });

  // Then define the mutation
  const {
    mutateAsync: saveBracketToServerMutationAsync,
    // isError: saveError,
    // isPending: savingToServer,
  } = useMutation({
    mutationFn: async (data) => {
      updateSyncStatus("syncing");
      const result = await updateBracket(params.id, data);
      return result;
    },
    onSuccess: () => {
      updateSyncStatus("synced");
      queryClient.invalidateQueries({
        queryKey: ["backend", "brackets", { userId: owner.id }],
      });
    },
    onError: () => {
      updateSyncStatus("error");
    },
    meta: {
      errorMessage: "Error saving bracket",
    },
  });

  const {
    mutate: createBracketMutation,
    isPending: creationPending,
    isError: creationFailure,
    error: creationError,
  } = useMutation({
    mutationFn: async (creationObject) => {
      await createBracket(creationObject);
    },
    meta: {
      errorMessage: "Error creating bracket",
      successMessage: "Bracket created successfully",
    },
    onSettled: async () => {
      queryClient.invalidateQueries({ queryKey: ["backend", "brackets", { userId: owner.id }] });
      queryClient.invalidateQueries({ queryKey: ["backend", "bracket", { bracketId: params.id, userId: owner.id }] });
    },
  });

  const {
    data: loadedBracket,
    isPending: fetchPending,
    isError: fetchFailure,
  } = useQuery({
    queryKey: ["backend", "bracket", { bracketId: params.id, userId: owner.id }],
    queryFn: async () => getBracket(params.id, owner.id),
    enabled: params.id && isCurrentUser(owner.id),
    refetchOnWindowFocus: false,
    staleTime: 3600000,
    meta: {
      errorMessage: creationPossible || ownerPending ? false : "Error loading bracket",
    },
    retry: (failureCount, error) => error?.cause?.code !== 404 && failureCount < 3,
  });

  const songSource = useMemo(() => {
    if (loadedBracket?.template?.songSource?.type === "artist") {
      return {
        type: "artist",
        artist: {
          name: loadedBracket.template.songSource.artist.name,
          id: loadedBracket.template.songSource.artist.id,
        },
      };
    }
    if (loadedBracket?.template?.songSource?.type === "playlist") {
      return {
        type: "playlist",
        playlist: {
          name: loadedBracket.template.songSource.playlist.name,
          id: loadedBracket.template.songSource.playlist.id,
        },
      };
    }
    return null;
  }, [loadedBracket?.template?.songSource]);

  const bracket = useMemo(() => {
    // console.log(loadedBracket?.bracketData);
    if (loadedBracket?.bracketData) {
      let mymap = new Map(Object.entries(loadedBracket.bracketData));
      mymap = new Map([...mymap].sort(bracketSorter));
      return mymap;
    }
    return null;
  }, [loadedBracket?.bracketData]);

  const template = useMemo(() => {
    if (loadedBracket?.template) {
      return {
        id: loadedBracket.template.id,
        ownerId: loadedBracket.template.ownerId,
        displayName: loadedBracket.template.displayName,
        ownerUsername: loadedBracket.template.ownerUsername,
      };
    }
    return { id: null, ownerId: null, displayName: null };
  }, [loadedBracket?.template]);

  const bracketTracks = useMemo(() => {
    const tracks = [];
    if (bracket) {
      bracket.forEach((item) => {
        if (isEdgeSong(item, (id) => bracket.get(id))) {
          tracks.push(item.song);
        }
      });
    }
    return tracks;
  }, [bracket]);

  const bracketWinner = useMemo(() => {
    if (bracket) {
      const cols = getNumberOfColumns(bracketTracks.length) - 1;
      const left = bracket.get(`l${cols}0`);
      const right = bracket.get(`r${cols}0`);
      if (left && left.winner && left.song) {
        return left.song;
      }
      if (right && right.winner && right.song) {
        return right.song;
      }
    }
    return null;
  }, [bracket, bracketTracks, getNumberOfColumns]);

  const showBracketCompleteModal = useMemo(() => {
    if (bracketWinner && commands.length > 0) {
      return true;
    }
    return false;
  }, [bracketWinner, commands]);

  const percentageFilled = useMemo(() => {
    if (bracket) {
      let totalFilled = 0;
      let autoAdvances = 0;
      bracket.forEach((item) => {
        // either the spot is filled or it's empty and it's the first column (indicating an auto-advance)
        if (Boolean(item.song?.name) && !(!Boolean(bracket.get(item.opponentId)?.song?.name) && item.col === 0)) {
          totalFilled += 1;
        } else if (!Boolean(bracket.get(item.opponentId)?.song?.name) && item.col === 0) {
          autoAdvances += 1;
        }
      });
      const filledExceptStartingTracks = totalFilled - bracketTracks.length;
      const emptiesExceptStartingTracks = bracket.size - bracketTracks.length - autoAdvances * 2;
      const winnerAddition = bracketWinner ? 1 : 0;
      // setPercentageFilled((1 - (totalUnfilled + winnerAddition) / (bracketSize - 1)) * 100);
      return (
        ((filledExceptStartingTracks + winnerAddition) / (emptiesExceptStartingTracks + 1)) * 100 // Add one for the winner spot
      );
    }
    return 0;
  }, [bracket, bracketTracks, bracketWinner]);

  const trackedProps = useMemo(
    () => ({
      "Bracket Id": params?.id,
      "Owner Username": owner?.name,
      "Seeding Method": loadedBracket?.template?.seedingMethod,
      "Inclusion Method": loadedBracket?.template?.inclusionMethod,
      "Song Source Type": songSource?.type,
      "Song Source Name": songSource?.[songSource?.type]?.name,
      "Song Source Id": songSource?.[songSource?.type]?.id,
      Tracks: bracketTracks?.length,
    }),
    [params.id, owner.name, loadedBracket?.template, songSource, bracketTracks.length],
  );

  const saveCurrentBracket = useCallback(
    async (isWinner = false, forceSync = false) => {
      if (bracket && bracket.size > 0) {
        const saveData = queryClient.getQueryData([
          "backend",
          "bracket",
          { bracketId: params.id, userId: owner.id },
        ])?.bracketData;

        if (saveData) {
          // Always save locally first
          saveLocal({ bracketData: saveData, winner: bracketWinner, percentageFilled });

          // Then sync to server if needed
          if (forceSync || shouldSyncToServer(isWinner, forceSync)) {
            try {
              await saveBracketToServerMutationAsync({
                bracketData: saveData,
                winner: bracketWinner,
                percentageFilled,
              });
            } catch (error) {
              // Let React Query handle retries
              console.error("Save failed:", error);
            }
          }
        }
      }
    },
    [
      bracket,
      bracketWinner,
      owner.id,
      params.id,
      queryClient,
      saveLocal,
      shouldSyncToServer,
      saveBracketToServerMutationAsync,
      percentageFilled,
    ],
  );

  // Auto-sync effect - check every 30 seconds if we should sync based on time threshold
  useEffect(() => {
    if (!bracket || !changesSinceSync) return undefined;

    console.log("setting timer");

    const timer = setInterval(() => {
      // Only attempt to sync if we have changes to save
      if (changesSinceSync > 0 && shouldSyncToServer()) {
        saveCurrentBracket();
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(timer);
    };
  }, [bracket, changesSinceSync, shouldSyncToServer, saveCurrentBracket]);

  const [, cancel] = useDebounce(
    () => {
      saveCurrentBracket(false);
    },
    10,
    [bracket],
  );

  const changeBracket = useCallback(
    async (bracketData) => {
      if (bracketData) {
        const bracketObject = Object.fromEntries(bracketData);
        queryClient.cancelQueries(["backend", "bracket", { bracketId: params.id, userId: owner.id }]);
        const newData = { bracketData: bracketObject, winner: bracketWinner };
        await queryClient.setQueryData(["backend", "bracket", { bracketId: params.id, userId: owner.id }], (oldData) =>
          produce(oldData, (draft) => Object.assign(draft, newData)),
        );

        // Increment changes counter here, where we know a change has actually happened
        setChangesSinceSync((prev) => prev + 1);

        if (bracketWinner) {
          cancel();
          await saveCurrentBracket(true);
        }
      }
    },
    [bracketWinner, owner.id, params.id, queryClient, saveCurrentBracket, cancel],
  );

  // useEffect(() => {
  //   async function updateSongSource() {
  //     if (songSource?.type === "artist" && songSource?.artist) {
  //       const artist = await getArtist(songSource.artist.id);
  //       // setSongSource({ type: "artist", artist: { name: artist.name, id: artist.id } });
  //       saveBracketMutation({ songSource: { type: "artist", artist: { name: artist.name, id: artist.id } } });
  //     } else if (songSource?.type === "playlist" && songSource?.playlist) {
  //       const playlist = await getPlaylist(songSource.playlist.id);
  //       saveBracketMutation({ songSource: { type: "playlist", playlist: { name: playlist.name, id: playlist.id } } });
  //       // setSongSource({ type: "playlist", playlist: { name: playlist.name, id: playlist.id } });
  //     }
  //   }
  //   updateSongSource();
  // }, [getArtist, getPlaylist, songSource, saveBracketMutation]);

  const initializeBracketFromTemplate = useCallback(
    async (templateData, newBracketId, ownerUsername) => {
      console.debug("Creating new bracket from template...", templateData);

      let newBracket;
      // check to see if we have an incoming list of tracks with seeds. If not, we have to get the bracket info from the backend
      if (templateData.tracks.length === 0) {
        let loadedTemplate;
        try {
          loadedTemplate = await getTemplate(templateData.id, templateData.ownerId);
        } catch (e) {
          toast.error("Error loading template bracket!");
          console.error(e);
          return;
        }

        // log template details
        console.debug("Loaded template:", loadedTemplate);

        // update preview urls
        // loadedTemplate.tracks = await updatePreviewUrls(loadedTemplate.tracks);

        const switchedTracks = [
          ...loadedTemplate.tracks.slice(0, loadedTemplate.tracks.length / 2),
          ...loadedTemplate.tracks.slice(loadedTemplate.tracks.length / 2),
        ];

        newBracket = await generateBracket(
          switchedTracks,
          switchedTracks.length,
          loadedTemplate.seedingMethod,
          loadedTemplate.inclusionMethod,
        );
      } else {
        console.log("Template tracks", templateData.tracks);

        const seededTracks = new Array(templateData.tracks.length);

        // rearrange tracks based on seed number
        templateData.tracks.forEach((track) => {
          if (!track?.seed) {
            console.error("Invalid template: Seed number missing. Problematic track:", track);
            toast.error("Error duplicating bracket");
            seededTracks.fill(null);
            return;
          }
          if (track.seed > seededTracks.length) {
            console.error("Seed number too high!");
            toast.error("Error duplicating bracket");
            return;
          }
          seededTracks[track.seed - 1] = track;
        });

        // console.log("seededTracks", seededTracks);

        const switchedTracks = [
          ...templateData.tracks.slice(0, templateData.tracks.length / 2),
          ...templateData.tracks.slice(templateData.tracks.length / 2),
        ];

        // console.log("switchedTracks", switchedTracks);

        newBracket = await fillBracket(switchedTracks, getNumberOfColumns(switchedTracks.length));
      }
      // // fill bracket with template tracks
      // const newBracket = await fillBracket(loadedTemplate.tracks, getNumberOfColumns(loadedTemplate.tracks.length));

      // create bracket and set it up for the user to fill
      createBracketMutation({
        bracketId: newBracketId,
        ownerUsername: ownerUsername,
        templateId: templateData.id,
        templateOwnerId: templateData.ownerId,
        bracketData: Object.fromEntries(newBracket),
      });
    },
    [getTemplate, createBracketMutation, fillBracket, getNumberOfColumns, updatePreviewUrls],
  );

  useEffect(() => {
    if (creationPossible && fetchFailure && !creationFailure && !creationPending) {
      initializeBracketFromTemplate(location.state.template, params.id, owner.name);
    }
  }, [
    initializeBracketFromTemplate,
    creationPossible,
    creationFailure,
    location?.state?.template,
    params?.id,
    owner?.name,
    fetchFailure,
  ]);

  // UNDO

  const clearCommands = useCallback(() => {
    setCommands([]);
  }, []);

  const saveCommand = useCallback(
    (action, inverse) => {
      const temp = [
        ...commands,
        {
          action: action,
          inverse: inverse,
        },
      ];
      setCommands(temp);
    },
    [commands],
  );

  const noChanges = useCallback(
    (navigateAway) => {
      if (
        (navigateAway && syncStatus === "syncing" && commands.length > 0) ||
        (!navigateAway && commands.length !== 0 && bracketUnchanged(bracket))
      ) {
        if (window.confirm("You have bracket changes that will be lost! Proceed anyways?")) {
          return true;
        }
        return false;
      }
      return true;
    },
    [syncStatus, commands, bracket],
  );

  function undo() {
    const lastCommand = commands[commands.length - 1];
    if (lastCommand) {
      // remove the last element
      setCommands(commands.splice(0, commands.length - 1));
      // run the function that was just popped
      lastCommand.inverse();
    }
    return false;
  }

  if (Mousetrap.bind) {
    Mousetrap.bind("mod+z", undo);
  }

  if (!isCurrentUser(params.userId) || (!showBracketCompleteModal && bracketWinner)) {
    // navigate(`/user/${params.userId}/bracket/${params.id}`, { state: location.state });
    openBracket(params.id, params.userId, "", location.state);
    // return <Redirect to={`/user/${params.userId}/bracket/${params.id}/fill`} />;
  }

  if (fetchPending) {
    return (
      <Layout noChanges={() => true} path={location.pathname}>
        <LoadingIndicator loadingText="Loading bracket..." />
      </Layout>
    );
  }

  if (creationPending || (!creationFailure && fetchFailure && creationPossible)) {
    return (
      <Layout noChanges={() => true} path={location.pathname}>
        <LoadingIndicator loadingText="Creating bracket..." />
      </Layout>
    );
  }

  if (creationFailure) {
    return (
      <Layout noChanges={() => true} path={location.pathname} pageName="Fill Bracket">
        <div className="inline-flex justify-center flex-col">
          <div className="font-bold text-red-500">Error creating bracket!</div>
          Error message: {creationError?.message()}
          <Button
            onClick={() => initializeBracketFromTemplate(location.state.template, params.id, owner.name)}
            variant="secondary"
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </Layout>
    );
  }

  if (fetchFailure && !creationPossible) {
    return (
      <Layout noChanges={() => true} path={location.pathname} pageName="Fill Bracket">
        <div className="font-bold mb-2">Bracket not found</div>
      </Layout>
    );
  }

  return (
    <Layout noChanges={noChanges} path={location.pathname} pageName="Fill Bracket" trackedProps={trackedProps}>
      {bracketWinner && commands.length !== 0 && (
        <Confetti
          width={window.document.body.offsetWidth}
          height={window.document.body.offsetHeight}
          recycle={false}
          className="!z-[100]"
        />
      )}
      <BracketCompleteModal
        showModal={showBracketCompleteModal}
        setShowModal={(showModal) => (showModal ? saveCommand(null, null) : clearCommands())}
        bracketWinner={bracketWinner}
        bracketTracks={bracketTracks}
        songSource={songSource}
        savePending={syncStatus === "syncing"}
        saveError={syncStatus === "error"}
        retrySave={() => saveCurrentBracket(true, true)}
        viewLink={`/user/${owner.id}/bracket/${params.id}`}
        share={share}
      />
      <BracketHeader songSource={songSource} owner={owner} template={template} bracketTracks={bracketTracks} />
      {bracket && songSource && (
        <>
          <div className="text-xs -space-x-px rounded-md sticky mx-auto top-0 w-fit z-30 text-center">
            {/* <GeneratePlaylistButton tracks={tracks} artist={artist} /> */}
            <div className="flex items-center gap-2">
              <Button onClick={share} variant="secondary" className="flex justify-center gap-1">
                <ShareIcon />
                Share
              </Button>
            </div>
            <div className="">
              {`syncStatus: ${syncStatus}, changesSinceSync: ${changesSinceSync}, lastServerSync: ${lastServerSync}`}
            </div>
            <div className="">{percentageFilled.toFixed(0)}% filled</div>
            {syncStatus === "syncing" && (
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-1/3 flex items-center gap-1">
                <div className="animate-spin-reverse w-fit h-fit" aria-label="Saving" title="Saving">
                  <SyncIcon />
                </div>
                Saving
              </div>
            )}
            {syncStatus === "local" && (
              <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 text-gray-500 whitespace-nowrap">
                Saved locally
              </div>
            )}
            {syncStatus === "error" && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full translate-y-1.5 flex flex-col items-center gap-1 !text-red-500 !font-bold whitespace-nowrap">
                Save Error!
                <Button onClick={() => saveCurrentBracket(false, true)} variant="secondary">
                  Retry
                </Button>
              </div>
            )}
          </div>
          <FillBracket
            bracketTracks={bracketTracks}
            songSource={songSource}
            bracket={bracket}
            changeBracket={changeBracket}
            currentlyPlayingId={currentlyPlayingId}
            setCurrentlyPlayingId={setCurrentlyPlayingId}
            saveCommand={saveCommand}
          />
        </>
      )}
    </Layout>
  );
}

export function Head({ location }) {
  // name && userName ? `${name} bracket by ${userName}` : "View/edit bracket"
  return <Seo title="Fill Bracket" pathname={location.pathname} />;
}
