/* eslint-disable prettier/prettier */
// React
import React, { useEffect, useState, useMemo, useCallback, useContext } from "react";
import { useDebounce } from "react-use";
import { navigate } from "gatsby";
// Third Party
import Mousetrap from "mousetrap";
import Confetti from "react-confetti";
import { backOff } from "exponential-backoff";
import toast from "react-hot-toast";
// Components
import Seo from "../../../../../components/SEO";
import Layout from "../../../../../components/Layout";
import LoadingIndicator from "../../../../../components/LoadingIndicator";
import BracketWinnerInfo from "../../../../../components/Bracket/BracketWinnerInfo";
import ActionButton from "../../../../../components/Controls/ActionButton";
import SaveIndicator from "../../../../../components/Controls/SaveIndicator";
import TrackNumber from "../../../../../components/BracketCard/TrackNumber";
// import GeneratePlaylistButton from "../../../../components/GeneratePlaylistButton";
import BracketCompleteModal from "../../../../../components/Modals/BracketCompleteModal";
// Hooks
import useBracketGeneration from "../../../../../hooks/useBracketGeneration";
import useHelper from "../../../../../hooks/useHelper";
import useBackend from "../../../../../hooks/useBackend";
import useSpotify from "../../../../../hooks/useSpotify";
import useSongProcessing from "../../../../../hooks/useSongProcessing";
// Assets
import ShareIcon from "../../../../../assets/svgs/shareIcon.svg";
// Context
import { LoginContext } from "../../../../../context/LoginContext";
import FillBracket from "../../../../../components/Bracket/FillBracket";

export default function App({ params, location }) {
  const defaultValues = useMemo(
    () => ({
      bracketId: params.id,
      owner: { name: undefined, id: params.userId },
      locationState: location.state,
      seedingMethod: "popularity",
      inclusionMethod: "popularity",
      limit: 32,
      fills: 0,
      allTracks: [],
      editMode: false,
      commands: [],
      bracket: new Map(),
      template: { id: null, ownerId: null, displayName: null },
      songSource: { type: undefined },
      currentlyPlayingId: null,
      showBracket: false,
      loadingText: "Loading...",
      saving: false,
      waitingToSave: false,
      lastSaved: { time: 0, commandsLength: 0 },
      playbackEnabled: false,
      alertInfo: { show: false, message: null, type: null, timeoutId: null },
    }),
    [params.id, params.userId, location.state],
  );

  const [bracketId, setBracketId] = useState(defaultValues.bracketId);
  const [owner, setOwner] = useState(defaultValues.owner);
  const [locationState, setLocationState] = useState(defaultValues.locationState);
  const [seedingMethod, setSeedingMethod] = useState(defaultValues.seedingMethod);
  const [inclusionMethod, setInclusionMethod] = useState(defaultValues.inclusionMethod);
  const [limit, setLimit] = useState(defaultValues.limit);
  const [fills, setFills] = useState(defaultValues.fills);
  const [allTracks, setAllTracks] = useState(defaultValues.allTracks);
  const [editMode, setEditMode] = useState(defaultValues.editMode);
  const [commands, setCommands] = useState(defaultValues.commands);
  const [bracket, setBracket] = useState(defaultValues.bracket);
  const [template, setTemplate] = useState(defaultValues.template);
  const [songSource, setSongSource] = useState(defaultValues.songSource);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(defaultValues.currentlyPlayingId);
  const [showBracket, setShowBracket] = useState(defaultValues.showBracket);
  const [loadingText, setLoadingText] = useState(defaultValues.loadingText);
  const [saving, setSaving] = useState(defaultValues.saving);
  const [waitingToSave, setWaitingToSave] = useState(defaultValues.waitingToSave);
  const [lastSaved, setLastSaved] = useState(defaultValues.lastSaved);
  const [playbackEnabled, setPlaybackEnabled] = useState(defaultValues.playbackEnabled);
  const [alertInfo, setAlertInfo] = useState(defaultValues.alertInfo);

  const { loggedIn, loginInfo } = useContext(LoginContext);
  const { isCurrentUser, getUserInfo, getArtist, getPlaylist } = useSpotify();
  const { bracketSorter, bracketUnchanged } = useHelper();
  const { getBracket, updateBracket, getTemplate, createBracket } = useBackend();
  const { updatePreviewUrls } = useSongProcessing();
  const { getNumberOfColumns, fillBracket } = useBracketGeneration();

  const localSaveKey = "savedBracket";

  const editable = loggedIn && isCurrentUser(owner.id);
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

  // SAVE

  async function saveBracket(data) {
    // Called on these occasions: on initial bracket load, user clicks save button, user completes bracket
    if (saving !== true && editable && bracket.size > 0 && !editMode) {
      try {
        setSaving(true);
        // write to database and stuff
        console.debug("Saving bracket...");
        await backOff(() => updateBracket(bracketId, data), {
          jitter: "full",
          maxDelay: 25000,
          timeMultiple: 5,
          retry: (e) => {
            console.debug(e);
            if (e.cause && e.cause.code === 429) {
              console.debug("429 error! Retrying with delay...", e);
              return true;
            }
            return false;
          },
        });
        console.debug("Bracket Saved");
        // show notification Saved", "success");
        setSaving(false);
        setWaitingToSave(false);
        setLastSaved({ commandsLength: commands.length, time: Date.now() });
      } catch (error) {
        if (error.cause && error.cause.code === 429) {
          toast.error("Error saving bracket! Wait a minute or two and then try making another choice");
        } else {
          toast.error("Error saving bracket! Please try again later");
        }
        setSaving("error");
        setWaitingToSave(false);
      }
    }
  }

  const [isReady] = useDebounce(
    () => {
      if (bracket) {
        const bracketObject = Object.fromEntries(bracket);
        if (bracketWinner) {
          saveBracket({ bracketData: bracketObject, winner: bracketWinner });
        } else {
          saveBracket({ bracketData: bracketObject });
        }
      }
    },
    4000,
    [bracket, bracketWinner],
  );

  const isSaved = !(saving || !isReady() || waitingToSave);

  useEffect(() => {
    setWaitingToSave(true);
  }, [bracket, bracketWinner]);

  const checkAndUpdateSongSource = useCallback(
    async (tempSongSource) => {
      if (loggedIn) {
        if (tempSongSource.type === "artist") {
          const artist = await getArtist(tempSongSource.artist.id);
          setSongSource({ type: "artist", artist: { name: artist.name, id: artist.id } });
        } else if (tempSongSource.type === "playlist") {
          const playlist = await getPlaylist(tempSongSource.playlist.id);
          setSongSource({ type: "playlist", playlist: { name: playlist.name, id: playlist.id } });
        }
      }
    },
    [getArtist, getPlaylist, loggedIn],
  );

  const checkAndUpdateOwnerUsername = useCallback(
    async (ownerId) => {
      if (ownerId && loggedIn) {
        getUserInfo(ownerId).then((newUserInfo) => {
          if (newUserInfo) {
            setOwner({ id: newUserInfo.id, name: newUserInfo.display_name });
          }
        });
      }
    },
    [getUserInfo, loggedIn],
  );

  const initializeLoadedBracket = useCallback(
    async (loadedBracket) => {
      // set owner details
      setOwner({ id: loadedBracket.ownerId, name: loadedBracket.ownerUsername });
      checkAndUpdateOwnerUsername(loadedBracket.ownerId);

      // set bracket data
      let mymap = new Map(Object.entries(loadedBracket.bracketData));
      mymap = new Map([...mymap].sort(bracketSorter));
      setBracket(mymap);

      // set song source
      if (
        loadedBracket.template.songSource &&
        (loadedBracket.template.songSource.type === "artist" || loadedBracket.template.songSource.type === "playlist")
      ) {
        setSongSource(loadedBracket.template.songSource);
        checkAndUpdateSongSource(loadedBracket.template.songSource);
      }

      setInclusionMethod(loadedBracket.template.inclusionMethod);
      setSeedingMethod(loadedBracket.template.seedingMethod);
      setLimit(loadedBracket.template.tracks.length);
      setTemplate({
        id: loadedBracket.template.id,
        ownerId: loadedBracket.template.ownerId,
        ownerUsername: loadedBracket.template.ownerUsername,
        displayName: loadedBracket.template.displayName,
      });
      setFills(loadedBracket.template.fills);
      setShowBracket(true);
      // setTracks(new Array(loadedBracket.tracks).fill(null));
      setLastSaved({ commandsLength: commands.length, time: Date.now() });
    },
    [commands.length, bracketSorter, checkAndUpdateOwnerUsername, checkAndUpdateSongSource],
  );

  const initializeBracketFromTemplate = useCallback(
    async (templateData, ownerId, newBracketId) => {
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

      // set owner details
      const newUserInfo = await getUserInfo(ownerId);
      setOwner({ id: newUserInfo.id, name: newUserInfo.display_name });

      // don't show the bracket while we get things ready
      setShowBracket(false);

      // set song source from passed in data
      setSongSource(loadedTemplate.songSource);

      setInclusionMethod(loadedTemplate.inclusionMethod);
      setSeedingMethod(loadedTemplate.seedingMethod);
      setLimit(loadedTemplate.tracks.length);
      setFills(loadedTemplate.fills);
      setTemplate({
        id: loadedTemplate.id,
        ownerId: loadedTemplate.ownerId,
        displayName: loadedTemplate.displayName,
        ownerUsername: loadedTemplate.ownerUsername,
      });

      // update preview urls
      loadedTemplate.tracks = await updatePreviewUrls(loadedTemplate.tracks);

      // fill bracket with template tracks
      const filledBracket = await fillBracket(loadedTemplate.tracks, getNumberOfColumns(loadedTemplate.tracks.length));
      setBracket(filledBracket);

      setSaving(true);

      // create bracket and set it up for the user to fill
      await createBracket({
        bracketId: newBracketId,
        ownerUsername: newUserInfo.display_name,
        templateId: loadedTemplate.id,
        templateOwnerId: loadedTemplate.ownerId,
        bracketData: Object.fromEntries(filledBracket),
      });
      setSaving(false);
      setWaitingToSave(false);
    },
    [getTemplate, createBracket, getUserInfo, fillBracket, getNumberOfColumns, updatePreviewUrls],
  );

  // INITIALIZE BRACKET

  const kickOff = useCallback(async () => {
    // console.debug("Kicking off", bracketId, locationState);
    if (bracketId && owner.id) {
      try {
        const loadedBracket = await getBracket(bracketId, owner.id);
        try {
          await initializeLoadedBracket(loadedBracket);
        } catch (e) {
          toast.error("Error loading bracket!");
          console.error(e);
        }
      } catch (error) {
        if (error.cause && error.cause.code === 404) {
          if (locationState && locationState.template) {
            await initializeBracketFromTemplate(locationState.template, owner.id, bracketId);
          } else {
            // Bracket doesn't exist and no artist was passed in
            setBracket(null);
          }
        } else if (error.cause && error.cause.code === 429) {
          toast.error("Error loading bracket! Wait a minute or two and then try again");
        } else {
          toast.error("Error loading bracket!");
          console.error(error);
        }
      }
    }
  }, [
    initializeBracketFromTemplate,
    initializeLoadedBracket,
    bracketId,
    owner.id,
    locationState,
    limit,
    setBracket,
    getBracket,
  ]);

  const deleteBracketSavedLocally = useCallback(() => {
    console.log("deleting bracket locally");
    sessionStorage.removeItem(localSaveKey);
    console.log("bracket deleted");
  }, []);

  const saveBracketLocally = useCallback(() => {
    if (editable && !isSaved && !bracketWinner) {
      console.log("saving bracket locally");
      sessionStorage.setItem(
        localSaveKey,
        JSON.stringify({
          bracketId: bracketId,
          owner: owner,
          locationState: locationState,
          seedingMethod: seedingMethod,
          inclusionMethod: inclusionMethod,
          limit: limit,
          fills: fills,
          allTracks: allTracks,
          editMode: editMode,
          commands: commands,
          bracket: bracket,
          template: template,
          songSource: songSource,
          currentlyPlayingId: currentlyPlayingId,
          showBracket: showBracket,
          loadingText: loadingText,
          saving: saving,
          waitingToSave: waitingToSave,
          lastSaved: lastSaved,
          playbackEnabled: playbackEnabled,
          alertInfo: alertInfo,
        }),
      );
    }
  }, [
    bracketId,
    owner,
    locationState,
    seedingMethod,
    inclusionMethod,
    limit,
    fills,
    allTracks,
    editMode,
    commands,
    bracket,
    template,
    songSource,
    currentlyPlayingId,
    showBracket,
    loadingText,
    saving,
    waitingToSave,
    lastSaved,
    playbackEnabled,
    alertInfo,
    bracketWinner,
    isSaved,
    editable,
  ]);

  const loadBracketLocally = useCallback(() => {
    const savedState = JSON.parse(sessionStorage.getItem(localSaveKey));
    if (savedState) {
      setBracketId(savedState.bracketId);
      setOwner(savedState.owner);
      setLocationState(savedState.locationState);
      setSeedingMethod(savedState.seedingMethod);
      setInclusionMethod(savedState.inclusionMethod);
      setLimit(savedState.limit);
      setFills(savedState.fills);
      setAllTracks(savedState.allTracks);
      setEditMode(savedState.editMode);
      setCommands(savedState.commands);
      setBracket(savedState.bracket);
      setTemplate(savedState.template);
      setSongSource(savedState.songSource);
      setCurrentlyPlayingId(savedState.currentlyPlayingId);
      setShowBracket(savedState.showBracket);
      setLoadingText(savedState.loadingText);
      setSaving(savedState.saving);
      setWaitingToSave(savedState.waitingToSave);
      setLastSaved(savedState.lastSaved);
      setPlaybackEnabled(savedState.playbackEnabled);
      setAlertInfo(savedState.alertInfo);

      deleteBracketSavedLocally();
    }
  }, [
    setBracketId,
    setOwner,
    setLocationState,
    setSeedingMethod,
    setInclusionMethod,
    setLimit,
    setFills,
    setAllTracks,
    setEditMode,
    setCommands,
    setBracket,
    setTemplate,
    setSongSource,
    setCurrentlyPlayingId,
    setShowBracket,
    setLoadingText,
    setSaving,
    setWaitingToSave,
    setLastSaved,
    setPlaybackEnabled,
    setAlertInfo,
    deleteBracketSavedLocally,
  ]);

  const isBracketSavedLocally = useCallback(() => {
    const savedState = JSON.parse(sessionStorage.getItem(localSaveKey));
    if (savedState) {
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    kickOff();
  }, []);

  // SHARE

  const share = useCallback(() => {
    navigator.clipboard.writeText(location.href);
    console.debug("copied link");
    toast.success("Link copied to clipboard!");
  }, [location.href]);

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
        (navigateAway && !isSaved && commands.length > 0) ||
        (!navigateAway && commands.length !== 0 && bracketUnchanged(bracket))
      ) {
        if (window.confirm("You have bracket changes that will be lost! Proceed anyways?")) {
          return true;
        }
        return false;
      }
      return true;
    },
    [isSaved, commands, bracket, bracketUnchanged],
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

  if (params.userId !== loginInfo?.userId || (!showBracketCompleteModal && bracketWinner)) {
    navigate(`/user/${params.userId}/bracket/${params.id}`, { state: location.state });
    // return <Redirect to={`/user/${params.userId}/bracket/${params.id}/fill`} />;
  }

  return (
    <Layout
      noChanges={noChanges}
      path={location.pathname}
      saveBracketLocally={saveBracketLocally}
      isBracketSavedLocally={isBracketSavedLocally}
      deleteBracketSavedLocally={deleteBracketSavedLocally}
    >
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
        isSaved={isSaved}
        saving={saving}
        viewLink={`/user/${owner.id}/bracket/${bracketId}`}
      />
      <div className="text-center">
        <h1>
          {owner.name && songSource && bracket && bracketTracks ? (
            <div className="mx-auto mb-2 flex flex-col gap-0 items-center justify-center max-w-[90%]">
              <div className="flex flex-row text-xl items-center justify-center gap-1 max-w-full">
                <span className="truncate w-auto font-bold">
                  {Boolean(songSource.type === "artist") ? songSource.artist.name : null}
                  {Boolean(songSource.type === "playlist") ? songSource.playlist.name : null}
                </span>
                {Boolean(bracketTracks && bracketTracks.length) && <TrackNumber numTracks={bracketTracks.length} />}
              </div>
              <span className="text-md">by {owner.name}</span>
              {template.ownerId !== owner.id && template.ownerUsername && (
                <span className="text-sm">{`Created from a template by ${template.ownerUsername}`}</span>
              )}
              {/* {fills && fills > 0 && bracketWinner ? <span className="text-md">Filled out {fills} {fills === 1 ? "time" : "times"}!</span> : null} */}
            </div>
          ) : bracket?.size > 0 ? (
            <div>Error fetching bracket details!</div>
          ) : (
            <div className="font-bold mb-2">{bracket ? "Getting bracket..." : "Bracket not found"}</div>
          )}
        </h1>
        {bracketWinner && (
          <BracketWinnerInfo
            bracketWinner={bracketWinner}
            showSongInfo={songSource && songSource.type === "playlist"}
          />
        )}
      </div>
      <hr />
      <LoadingIndicator hidden={showBracket || !owner.name || !songSource} loadingText={loadingText} />
      <div hidden={!showBracket || !songSource} className="text-center">
        <div className="text-xs -space-x-px rounded-md sticky mx-auto top-0 w-fit z-30">
          <div className="flex items-center gap-2">
            {/* <GeneratePlaylistButton tracks={tracks} artist={artist} /> */}
            <SaveIndicator saving={saving} isSaved={isSaved} lastSaved={lastSaved} waitingToSave={waitingToSave} />

            {/* <ActionButton
                  onClick={undo}
                  disabled={commands.length === 0}
                  icon={<UndoIcon />}
                  text="Undo"
                /> */}
            {/* <ActionButton
                  onClick={() => {
                    setEditMode(true);
                    setCurrentlyPlayingId(null);
                    if (!allTracks.length && bracket.size > 0) {
                      getTracks(songSource);
                    }
                  }}
                  disabled={commands.length !== 0 || !bracketUnchanged(bracket)}
                  icon={<EditIcon />}
                  text="Edit"
                /> */}
            <ActionButton onClick={share} icon={<ShareIcon />} text="Share" />
          </div>
        </div>
        <FillBracket
          showBracket={showBracket}
          setShowBracket={setShowBracket}
          editable={editable}
          bracketTracks={bracketTracks}
          songSource={songSource}
          bracket={bracket}
          setBracket={setBracket}
          setSeedingMethod={setSeedingMethod}
          currentlyPlayingId={currentlyPlayingId}
          setCurrentlyPlayingId={setCurrentlyPlayingId}
          saveCommand={saveCommand}
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
