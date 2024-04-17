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
import { bracketSorter, bracketUnchanged } from "../../../../../utils/helpers";
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
  const [lastSaved, setLastSaved] = useState({ time: 0, commandsLength: 0 });
  const [savePending, setSavePending] = useState(false);
  const [percentageFilled, setPercentageFilled] = useState(0);

  // Hooks
  const { isCurrentUser } = useAuthentication();
  const { updatePreviewUrls } = useSongProcessing();
  const { getNumberOfColumns, fillBracket } = useBracketGeneration();
  const queryClient = useQueryClient();
  const { share } = useShareBracket(location.href);

  // Constants
  // const localSaveKey = "savedBracket";

  const { data: ownerData } = useUserInfo(params.userId);
  const ownerInfo = ownerData?.data;

  const owner = useMemo(
    () => ({ name: ownerInfo?.display_name, id: params.userId }),
    [ownerInfo?.display_name, params?.userId],
  );

  const creationPossible = useMemo(
    () => location?.state?.template && owner?.name && owner.id && params?.id,
    [location?.state, owner?.name, owner.id, params?.id],
  );

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
      errorMessage: creationPossible ? false : "Error loading bracket",
    },
    retry: (failureCount, error) => error?.cause?.code !== 404 && failureCount < 3,
  });

  const {
    isError: saveError,
    isPending: saving,
    mutate: saveBracketMutation,
  } = useMutation({
    mutationFn: async (data) => {
      await updateBracket(params.id, data);
      // throw new Error("Error saving bracket");
    },
    onError: () => {
      if (lastSaved.saveData) {
        queryClient.setQueryData(
          ["backend", "bracket", { bracketId: params.id, userId: owner.id }],
          lastSaved.saveData,
        );
      }
      if (lastSaved.commands) {
        setCommands(lastSaved.commands);
      }
    },
    meta: {
      errorMessage: "Error saving bracket",
      // successMessage: "Bracket saved successfully",
    },
    onSettled: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["backend", "brackets", { userId: owner.id }] });

      setLastSaved({ commands: commands, time: Date.now(), saveData: data });
      setSavePending(false);
    },
  });

  const {
    isPending: creationPending,
    mutate: createBracketMutation,
    isError: creationFailure,
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
        if (item.song && item.col === 0) {
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

  // SAVE

  // async function saveBracket(data) {
  //   // Called on these occasions: on initial bracket load, user clicks save button, user completes bracket
  //   if (saving !== true && bracket.size > 0) {
  //     try {
  //       setSaving(true);
  //       // write to database and stuff
  //       console.debug("Saving bracket...");
  //       await backOff(() => updateBracket(params.id, data), {
  //         jitter: "full",
  //         maxDelay: 25000,
  //         timeMultiple: 5,
  //         retry: (e) => {
  //           console.debug(e);
  //           if (e.cause && e.cause.code === 429) {
  //             console.debug("429 error! Retrying with delay...", e);
  //             return true;
  //           }
  //           return false;
  //         },
  //       });
  //       console.debug("Bracket Saved");
  //       // show notification Saved", "success");
  //       setSaving(false);
  //       setWaitingToSave(false);
  //       setLastSaved({ commandsLength: commands.length, time: Date.now() });
  //     } catch (error) {
  //       if (error.cause && error.cause.code === 429) {
  //         toast.error("Error saving bracket! Wait a minute or two and then try making another choice");
  //       } else {
  //         toast.error("Error saving bracket! Please try again later");
  //       }
  //       setSaving("error");
  //       setWaitingToSave(false);
  //     }
  //   }
  // }

  const saveCurrentBracket = useCallback(() => {
    if (bracket && bracket.size > 0) {
      const saveData = queryClient.getQueryData([
        "backend",
        "bracket",
        { bracketId: params.id, userId: owner.id },
      ])?.bracketData;
      if (saveData) {
        setSavePending(true);
        const newData = { bracketData: saveData, winner: bracketWinner, percentageFilled: percentageFilled };
        saveBracketMutation(newData);
      }
    }
  }, [bracket, bracketWinner, owner.id, params.id, queryClient, saveBracketMutation]);

  const [, cancel] = useDebounce(
    () => {
      saveCurrentBracket();
    },
    4000,
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
        setSavePending(true);
        if (bracketWinner) {
          cancel();
          saveBracketMutation(newData);
        }
        // console.log(await queryClient.getQueryData(["bracket", { bracketId: params.id, userId: owner.id }]));
      }
    },
    [bracketWinner, owner.id, params.id, queryClient],
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
      // load template from backend
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
      loadedTemplate.tracks = await updatePreviewUrls(loadedTemplate.tracks);

      // fill bracket with template tracks
      const filledBracket = await fillBracket(loadedTemplate.tracks, getNumberOfColumns(loadedTemplate.tracks.length));

      // create bracket and set it up for the user to fill
      createBracketMutation({
        bracketId: newBracketId,
        ownerUsername: ownerUsername,
        templateId: loadedTemplate.id,
        templateOwnerId: loadedTemplate.ownerId,
        bracketData: Object.fromEntries(filledBracket),
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
        (navigateAway && savePending && commands.length > 0) ||
        (!navigateAway && commands.length !== 0 && bracketUnchanged(bracket))
      ) {
        if (window.confirm("You have bracket changes that will be lost! Proceed anyways?")) {
          return true;
        }
        return false;
      }
      return true;
    },
    [savePending, commands, bracket],
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
          <div className="font-bold mb-2">Error creating bracket</div>
          <Button
            onClick={() => initializeBracketFromTemplate(location.state.template, params.id, owner.name)}
            variant="secondary"
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
        savePending={savePending}
        saveError={saveError}
        retrySave={saveCurrentBracket}
        viewLink={`/user/${owner.id}/bracket/${params.id}`}
        share={share}
      />
      <BracketHeader songSource={songSource} owner={owner} template={template} bracketTracks={bracketTracks} />
      {bracket && songSource && (
        <>
          <div className="text-xs -space-x-px rounded-md sticky mx-auto top-0 w-fit z-30 text-center">
            <div className="flex items-center gap-2">
              {/* <GeneratePlaylistButton tracks={tracks} artist={artist} /> */}
              <Button onClick={share} variant="secondary" className="flex justify-center gap-1">
                <ShareIcon />
                Share
              </Button>
            </div>
            <div className="">{percentageFilled.toFixed(0)}% filled</div>
            {saving && !saveError && (
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-1/3 flex items-center gap-1">
                <div className="animate-spin-reverse w-fit h-fit" aria-label="Saving" title="Saving">
                  <SyncIcon />
                </div>
                Saving
              </div>
            )}
            {saveError && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full translate-y-1.5 flex flex-col items-center gap-1 !text-red-500 !font-bold whitespace-nowrap">
                Save Error!
                <Button onClick={saveCurrentBracket} variant="secondary">
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
            setPercentageFilled={setPercentageFilled}
          />
        </>
      )}
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
    <Seo title="Fill Bracket" pathname={location.pathname} />
  );
}
