/* eslint-disable prettier/prettier */
// React
import React, { useEffect, useState, useMemo, useCallback, useContext } from "react";
import { useDebounce } from "react-use";
// Third Party
import Mousetrap from "mousetrap";
import Confetti from "react-confetti";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
// Helpers
import { bracketSorter, isEdgeSong } from "../../../../../utils/helpers";
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
import useShareBracket from "../../../../../hooks/useShareBracket";
import useLocalBracketStorage from "../../../../../hooks/useLocalBracketStorage";
import useUserInfo from "../../../../../hooks/useUserInfo";
import LoadingIndicator from "../../../../../components/LoadingIndicator";
import SyncIcon from "../../../../../assets/svgs/syncIcon.svg";
import BracketHeader from "../../../../../components/BracketHeader";
import { Button } from "../../../../../components/ui/button";
import { UserInfoContext } from "../../../../../context/UserInfoContext";
// Assets
import ShareIcon from "../../../../../assets/svgs/shareIcon.svg";
import { tokensExist } from "../../../../../axios/spotifyInstance";

export default function App({ params, location }) {
  // State
  const [commands, setCommands] = useState([]);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
  const [isSyncingOnExit, setIsSyncingOnExit] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [dataComparisonComplete, setDataComparisonComplete] = useState(false);

  // Perform direct auth check - do not wait for context to resolve
  const isLoggedIn = useMemo(() => tokensExist(), []);

  // Get current user info for auth checks - but don't block on it
  const currentUserInfo = useContext(UserInfoContext);

  // Determine ownership directly - either we're logged in and are the owner, or we're not
  const isOwner = useMemo(
    () => Boolean(isLoggedIn && currentUserInfo?.id && params.userId && currentUserInfo.id === params.userId),
    [isLoggedIn, currentUserInfo?.id, params.userId],
  );

  // Direct check and redirect for non-owners
  useEffect(() => {
    // If not logged in, redirect immediately
    if (!isLoggedIn) {
      console.debug("Not logged in, redirecting to view page");
      window.location.href = `/user/${params.userId}/bracket/${params.id}`;
      return;
    }

    // If logged in but user context has loaded and we're not the owner
    if (currentUserInfo !== undefined && !isOwner) {
      console.debug("Not the bracket owner, redirecting to view page");
      window.location.href = `/user/${params.userId}/bracket/${params.id}`;
      return;
    }

    // If we get here and we're logged in, we're either the owner or still waiting on context
    if (currentUserInfo !== undefined) {
      setAuthChecked(true);
    }
  }, [isLoggedIn, currentUserInfo, isOwner, params.userId, params.id]);

  // Use owner data hooks unconditionally
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

  // Hooks - ALL hooks must be called unconditionally
  const { updatePreviewUrls } = useSongProcessing();
  const { getNumberOfColumns, fillBracket, changeBracket: generateBracket } = useBracketGeneration();
  const queryClient = useQueryClient();
  const { share } = useShareBracket(location.href);

  // Add the bracket sync hook
  const {
    saveLocal,
    shouldSyncToServer,
    changesSinceSync,
    setChangesSinceSync,
    syncStatus,
    updateSyncStatus,
    localData,
    clearLocalData,
  } = useLocalBracketStorage({
    bracketId: params.id,
    ownerId: params.userId,
  });

  // Define all mutations
  const { mutateAsync: saveBracketToServerMutationAsync } = useMutation({
    mutationFn: async (data) => {
      updateSyncStatus("syncing");
      const result = await updateBracket(params.id, data);
      return result;
    },
    onSuccess: () => {
      console.debug("Bracket saved to server. Updating sync status to 'synced'");
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

  // Load bracket data - but only enable the query if we're the owner
  const {
    data: loadedBracket,
    isPending: fetchPending,
    isError: fetchFailure,
  } = useQuery({
    queryKey: ["backend", "bracket", { bracketId: params.id, userId: owner.id }],
    queryFn: async () => getBracket(params.id, owner.id),
    enabled: Boolean(params.id && params.userId && isOwner),
    refetchOnWindowFocus: false,
    staleTime: 3600000,
    meta: {
      errorMessage: creationPossible || ownerPending ? false : "Error loading bracket",
    },
    retry: (failureCount, error) => error?.cause?.code !== 404 && failureCount < 3,
  });

  // Define all other memos that depend on loadedBracket
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

  // Check for and resolve local storage data vs server data - only happens once because we mark as complete
  useEffect(() => {
    // Skip if we've already done the comparison or don't have server data
    if (dataComparisonComplete || !loadedBracket) return;

    // If we don't have local data, just mark comparison as complete and return
    if (!localData || !localData.data) {
      console.debug("No local data found, marking comparison as complete");
      setDataComparisonComplete(true);
      return;
    }

    // Compare timestamps to determine which is newer
    const serverTimestamp = loadedBracket.lastModified || 0;
    const localTimestamp = localData.timestamp || 0;

    console.debug(`Comparing data: Server timestamp: ${serverTimestamp}, Local timestamp: ${localTimestamp}`);

    // Skip if no valid timestamps to compare
    if (!serverTimestamp || !localTimestamp) {
      console.debug("Missing valid timestamps, clearing local data");
      clearLocalData();
      setDataComparisonComplete(true);
      return;
    }

    if (localTimestamp > serverTimestamp) {
      // Local is newer, update the query data and sync to server
      console.debug("Local data is newer, updating from local storage and syncing to server");

      // Update query data with local
      queryClient.setQueryData(["backend", "bracket", { bracketId: params.id, userId: owner.id }], (oldData) => ({
        ...oldData,
        bracketData: localData.data.bracketData,
        winner: localData.data.winner,
        percentageFilled: localData.data.percentageFilled,
      }));

      // Set changes since sync to trigger proper status
      // setChangesSinceSync(1);

      // Make a copy of local data before clearing
      const dataToSync = {
        bracketData: localData.data.bracketData,
        winner: localData.data.winner,
        percentageFilled: localData.data.percentageFilled,
      };

      // Clear local data
      clearLocalData();

      // Mark comparison as complete
      setDataComparisonComplete(true);

      // Directly sync to server with the copied data
      saveBracketToServerMutationAsync(dataToSync);
    } else {
      // Server is newer, clear local data
      console.debug("Server data is newer, using server data and clearing local storage");
      clearLocalData();
      setDataComparisonComplete(true);
    }
  }, [
    loadedBracket,
    localData,
    params.id,
    owner.id,
    queryClient,
    setChangesSinceSync,
    clearLocalData,
    saveBracketToServerMutationAsync,
    dataComparisonComplete,
  ]);

  // Define saveCurrentBracket first
  const saveCurrentBracket = useCallback(
    async (forceSync = false) => {
      // Only proceed if we're the owner
      if (!isOwner) return;

      if (bracket && bracket.size > 0) {
        const saveData = queryClient.getQueryData([
          "backend",
          "bracket",
          { bracketId: params.id, userId: owner.id },
        ])?.bracketData;

        if (saveData) {
          // Only save locally if data comparison is already complete or forced sync
          // This prevents automatic local saves during initial load

          if ((dataComparisonComplete || forceSync) && changesSinceSync > 0) {
            try {
              saveLocal({ bracketData: saveData, winner: bracketWinner, percentageFilled });
            } catch (error) {
              console.error("Error saving to local storage:", error);
              // If local storage fails, update status to error
              updateSyncStatus("error");
            }
          }

          // Then sync to server if needed
          if (forceSync || shouldSyncToServer(bracketWinner, forceSync)) {
            try {
              updateSyncStatus("syncing");
              await saveBracketToServerMutationAsync({
                bracketData: saveData,
                winner: bracketWinner,
                percentageFilled,
              });
              // Server sync is handled by the mutation's onSuccess/onError callbacks
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
      isOwner,
      dataComparisonComplete,
      updateSyncStatus,
    ],
  );

  // Save unsaved changes on beforeunload
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (syncStatus !== "synced") {
        // Attempt to save changes
        setTimeout(() => saveCurrentBracket(true), 0);

        // Set returnValue message for browsers that support it
        // This is a standardized way to handle beforeunload across browsers
        const message = "You have unsaved changes. Are you sure you want to leave?";

        // For modern browsers
        if (event) {
          event.preventDefault();
          // Note: We're not directly modifying event.returnValue to avoid linter errors
          // Instead, return the message which modern browsers will use appropriately
        }

        // For older browsers
        return message;
      }
      return null;
    };

    // Add event listener
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function to remove event listener when component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [syncStatus, saveCurrentBracket]);

  // debouce time is 0 now but this function is in place in case we need to use it in the future. 0 is ucrrently the best user experience as they get instant feedback on save status, especially in the bracket complete modal
  const [, cancel] = useDebounce(
    () => {
      cancel();
      saveCurrentBracket();
    },
    0,
    [bracket, dataComparisonComplete],
  );

  const changeBracket = useCallback(
    async (bracketData) => {
      // Early return if not the owner
      if (!isOwner) {
        console.error("Not authorized to modify this bracket");
        return;
      }

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
    [bracketWinner, owner.id, params.id, queryClient, saveCurrentBracket, cancel, isOwner],
  );

  // Auto-sync effect - check every 30 seconds if we should sync based on time threshold
  useEffect(() => {
    if (!bracket || !changesSinceSync) return undefined;

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
    async (navigateAway) => {
      // If we're navigating away and have unsaved changes
      if (navigateAway) {
        // If we're currently syncing, always show the popup
        if (syncStatus === "syncing") {
          if (window.confirm("You have bracket changes that are being saved! Please wait before leaving.")) {
            return true;
          }
          return false;
        }

        // If we have local changes that haven't been synced
        if (syncStatus === "local" || changesSinceSync > 0) {
          try {
            // Show syncing indicator
            setIsSyncingOnExit(true);
            // Try to save to server first
            await saveCurrentBracket(true);
            setIsSyncingOnExit(false);
            return true;
          } catch (error) {
            setIsSyncingOnExit(false);
            // If server save fails, save locally and show popup
            if (window.confirm("Failed to save to server. Your changes will be saved locally. Proceed anyways?")) {
              return true;
            }
            return false;
          }
        }
      }

      // If we're not navigating away, check if there are unsaved changes
      return true;
    },
    [syncStatus, changesSinceSync, saveCurrentBracket],
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

  // Handle completed bracket redirects - only if we're the owner
  useEffect(() => {
    // Skip if not the owner or still loading
    if (!isOwner || fetchPending) return;

    // Only redirect for bracket completion
    if (!showBracketCompleteModal && bracketWinner) {
      // Bracket is complete without showing modal
      openBracket(params.id, params.userId, "", location.state);
    }
  }, [params.userId, params.id, bracketWinner, showBracketCompleteModal, location.state, fetchPending, isOwner]);

  // Conditional rendering AFTER all hooks
  if (!isLoggedIn) {
    return (
      <Layout noChanges={() => true} path={location.pathname}>
        <LoadingIndicator loadingText="Redirecting to view page..." />
      </Layout>
    );
  }

  if (!authChecked) {
    return (
      <Layout noChanges={() => true} path={location.pathname}>
        <LoadingIndicator loadingText="Verifying access..." />
      </Layout>
    );
  }

  // Standard loading states
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
      {isSyncingOnExit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <SyncIcon className="animate-spin-reverse w-6 h-6 mb-4" />
            <p className="text-lg font-medium">Saving your bracket...</p>
            <p className="text-sm text-gray-600">Please wait while we save your changes</p>
          </div>
        </div>
      )}
      <BracketCompleteModal
        showModal={showBracketCompleteModal}
        setShowModal={(showModal) => (showModal ? saveCommand(null, null) : clearCommands())}
        bracketWinner={bracketWinner}
        bracketTracks={bracketTracks}
        songSource={songSource}
        savePending={syncStatus === "syncing"}
        saveError={syncStatus === "error"}
        retrySave={() => saveCurrentBracket(true)}
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
            {/* Debug state info */}
            {/* <div className="">
              {`syncStatus: ${syncStatus}, changesSinceSync: ${changesSinceSync}, lastServerSync: ${lastServerSync}`}
            </div> */}
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
                <Button onClick={() => saveCurrentBracket(true)} variant="secondary">
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
