// React
import React, { useEffect, useState, useMemo, useCallback, useContext } from "react"
import { navigate } from "gatsby";
// Third Party
import Mousetrap from "mousetrap";
import Confetti from "react-confetti";
import { v4 as uuidv4 } from "uuid";
import { backOff } from "exponential-backoff";
// Components
import { Seo } from "../../../../components/SEO";
import Bracket from "../../../../components/Bracket/Bracket"
import Layout from "../../../../components/Layout";
import LoadingIndicator from "../../../../components/LoadingIndicator";
import Alert from "../../../../components/Alert";
import BracketOptions from "../../../../components/Bracket/BracketOptions";
import BracketWinnerInfo from "../../../../components/Bracket/BracketWinnerInfo";
import ActionButton from "../../../../components/Bracket/ActionButton";
import SaveIndicator from "../../../../components/Bracket/SaveIndicator";
import TrackNumber from "../../../../components/BracketCard/TrackNumber";
//import GeneratePlaylistButton from "../../../../components/GeneratePlaylistButton";
import BracketCompleteModal from "../../../../components/Bracket/BracketCompleteModal";
// Utilities
import { useBracketGeneration } from "../../../../hooks/useBracketGeneration";
// Hooks
import { useHelper } from "../../../../hooks/useHelper";
import { useBackend } from "../../../../hooks/useBackend";
import { useSpotify } from "../../../../hooks/useSpotify";
import { useSongProcessing } from "../../../../hooks/useSongProcessing";
import { useDebounce } from "react-use";
// Assets
import ShareIcon from "../../../../assets/svgs/shareIcon.svg";
import DuplicateIcon from "../../../../assets/svgs/duplicateIcon.svg";
// Context
import { LoginContext } from "../../../../context/LoginContext";

const App = ({ params, location }) => {
  const defaultValues = useMemo(() => {
    return {
      bracketId: params.id,
      owner: { "name": undefined, "id": params.userId },
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
    }
  }, [params.id, params.userId, location.state]);

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

  const { loggedIn, userInfo } = useContext(LoginContext);
  const { isCurrentUser, getUserInfo, getArtist, getPlaylist } = useSpotify();
  const { bracketSorter, bracketUnchanged, nearestLesserPowerOf2 } = useHelper();
  const { createBracket, getBracket, updateBracket, getTemplate } = useBackend();
  const { seedBracket, sortTracks, loadAlbums, processTracks, loadPlaylistTracks, updatePreviewUrls } = useSongProcessing();
  const { getNumberOfColumns, fillBracket } = useBracketGeneration();

  const editable = loggedIn && isCurrentUser(owner.id);
  const bracketTracks = useMemo(() => {
    let tracks = [];
    if (bracket) {
      for (let item of bracket.values()) {
        if (item.song && item.col === 0) {
          tracks.push(item.song);
        }
      }
    }
    return tracks;
  }, [bracket]);
  const bracketWinner = useMemo(() => {
    if (bracket) {
      const cols = getNumberOfColumns(bracketTracks.length) - 1;
      const left = bracket.get("l" + cols + "0");
      const right = bracket.get("r" + cols + "0");
      if (left && left.winner && left.song) {
        return left.song;
      } else if (right && right.winner && right.song) {
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

  const [isReady,] = useDebounce(() => {
    if (bracket) {
      const bracketObject = Object.fromEntries(bracket);
      if (bracketWinner) {
        saveBracket({ bracketData: bracketObject, winner: bracketWinner });
      } else {
        saveBracket({ bracketData: bracketObject });
      }
    }
  }, 4000, [bracket, bracketWinner]);

  const isSaved = !(saving || !isReady() || waitingToSave);

  useEffect(() => {
    setWaitingToSave(true);
  }, [bracket, bracketWinner]);

  // RESET STATE
  const resetState = useCallback(async () => {
    setBracketId(defaultValues.bracketId);
    setOwner(defaultValues.owner);
    setLocationState(defaultValues.locationState);
    setSeedingMethod(defaultValues.seedingMethod);
    setInclusionMethod(defaultValues.inclusionMethod);
    setLimit(defaultValues.limit);
    setFills(defaultValues.fills);
    setAllTracks(defaultValues.allTracks);
    setEditMode(defaultValues.editMode);
    setCommands(defaultValues.commands);
    setBracket(defaultValues.bracket);
    setTemplate(defaultValues.template);
    setSongSource(defaultValues.songSource);
    setCurrentlyPlayingId(defaultValues.currentlyPlayingId);
    setShowBracket(defaultValues.showBracket);
    setLoadingText(defaultValues.loadingText);
    setSaving(defaultValues.saving);
    setWaitingToSave(defaultValues.waitingToSave);
    setLastSaved(defaultValues.lastSaved);
    setPlaybackEnabled(defaultValues.playbackEnabled);
    setAlertInfo(defaultValues.alertInfo);
  }, [defaultValues]);

  // ALERTS

  const showAlert = useCallback((message, type = "info", timeout = true) => {
    if (alertInfo.timeoutId) {
      clearTimeout(alertInfo.timeoutId);
    }
    let timeoutId = null;
    if (timeout) {
      timeoutId = setTimeout(() => {
        setAlertInfo({ show: false, message: null, type: null, timeoutId: null });
      }, 5000);
    }
    setAlertInfo({ show: true, message: message, type: type, timeoutId: timeoutId });
  }, [alertInfo]);

  const closeAlert = useCallback(() => {
    if (alertInfo.timeoutId) {
      clearTimeout(alertInfo.timeoutId);
    }
    setAlertInfo({ show: false, message: null, type: null, timeoutId: null });
  }, [alertInfo]);

  // START BRACKET

  const makeCreationObject = useCallback(async () => {
    const bracketObject = Object.fromEntries(bracket);
    return {
      bracketId: bracketId,
      ownerUsername: owner.name,
      seedingMethod: seedingMethod,
      inclusionMethod: inclusionMethod,
      displayName: null,
      songSource: songSource,
      tracks: bracketTracks,
      bracketData: bracketObject,
    };
  }, [bracket, bracketId, bracketTracks, inclusionMethod, owner.name, seedingMethod, songSource]);

  const startBracket = useCallback(async (creationObject) => {
    try {
      setEditMode(false);
      if (!creationObject) {
        creationObject = await makeCreationObject();
      }
      setSaving(true);
      await createBracket(creationObject);
      console.debug("Bracket created");
      setSaving(false);
      setWaitingToSave(false);
    } catch (error) {
      if (error.cause && error.cause.code === 429) {
        showAlert("Error creating bracket! Please try again later", "error", false);
        console.error(error);
      } else {
        showAlert(error.message, "error", false);
        console.error(error);
      }
      setSaving("error");
      setEditMode(true);
      setWaitingToSave(false);
    }
  }, [makeCreationObject, showAlert, createBracket]);

  const checkAndUpdateSongSource = useCallback(async (tempSongSource) => {
    if (tempSongSource.type === "artist") {
      const artist = await getArtist(tempSongSource.artist.id);
      setSongSource({ type: "artist", artist: { name: artist.name, id: artist.id } });
    } else if (tempSongSource.type === "playlist") {
      const playlist = await getPlaylist(tempSongSource.playlist.id);
      setSongSource({ type: "playlist", playlist: { name: playlist.name, id: playlist.id } });
    }
  }, [getArtist, getPlaylist]);

  const checkAndUpdateOwnerUsername = useCallback(async (ownerId) => {
    if (ownerId) {
      getUserInfo(ownerId).then((userInfo) => {
        if (userInfo) {
          setOwner({ id: userInfo.id, name: userInfo.display_name });
        }
      })
    }
  }, [getUserInfo]);

  // GET TRACKS

  const getTracks = useCallback(async (songSource, limit) => {
    if (!songSource || !songSource.type) {
      return [];
    }

    console.debug("Getting tracks...");
    // load the tracks from spotify
    let templist;
    const selectionName = songSource.type === "artist" ? songSource.artist.name : songSource.type === "playlist" ? songSource.playlist.name : "";
    if (songSource.type === "artist") {
      setLoadingText("Gathering Spotify tracks for " + songSource.artist.name + "...");
      const songPossibilities = await loadAlbums("https://api.spotify.com/v1/artists/" + songSource.artist.id + "/albums?include_groups=album,single,compilation&limit=20", songSource.artist.id);
      if (!songPossibilities) {
        showAlert("Error loading tracks from Spotify", "error", false);
        return [];
      }
      // load data for the songs
      setLoadingText("Gathering track information...");
      templist = await processTracks(songPossibilities);
    } else if (songSource.type === "playlist") {
      setLoadingText("Gathering Spotify tracks from " + songSource.playlist.name + "...");
      templist = await loadPlaylistTracks("https://api.spotify.com/v1/playlists/" + songSource.playlist.id + "/tracks?limit=50");
      //throw new Error("Playlists not supported yet");
    } else {
      throw new Error("Invalid songSource type: " + songSource.type);
    }
    if (!templist) {
      showAlert("Error loading tracks from Spotify", "error", false);
      return [];
    }
    // if there are than 8 songs, stop
    if (templist.length < 8) {
      alert(`${selectionName} doesn't have enough songs on Spotify! Try another ${songSource.type}.`);
      setSongSource({ type: undefined, name: undefined, id: undefined });
      navigate("/my-brackets")
      return [];
    }
    setAllTracks(templist);
    if (templist.length < limit) {
      const power = nearestLesserPowerOf2(templist.length);
      setLimit(power);
    }
    setLoadingText("Generating bracket...");
    return templist;
  }, [setAllTracks, setLimit, setSongSource, showAlert, loadAlbums, loadPlaylistTracks, processTracks, nearestLesserPowerOf2]);

  const changeBracket = useCallback(async (customAllTracks = allTracks, customLimit = limit, customSeedingMethod = seedingMethod, customInclusionMethod = inclusionMethod) => {
    if (!customAllTracks || customAllTracks.length === 0) {
      customAllTracks = await getTracks(songSource, customLimit);
    }
    const power = nearestLesserPowerOf2(customAllTracks.length);
    //setLoadingText("Seeding tracks by " + seedingMethod + "...");
    // sort the list by include method
    let newCustomAllTracks = await sortTracks(customAllTracks, customInclusionMethod);
    const numTracks = (customLimit < power ? customLimit : power);
    //cut the list dowwn to the max number of tracks
    newCustomAllTracks = newCustomAllTracks.slice(0, numTracks);
    // seed the bracket
    newCustomAllTracks = await seedBracket(newCustomAllTracks, customSeedingMethod);
    if (newCustomAllTracks && newCustomAllTracks.length > 0) {
      const temp = await fillBracket(newCustomAllTracks, getNumberOfColumns(newCustomAllTracks.length));
      setBracket(temp);
      return temp;
    } else {
      return null;
    }
  }, [allTracks, limit, seedingMethod, inclusionMethod, songSource, getTracks, sortTracks, seedBracket, fillBracket, nearestLesserPowerOf2, getNumberOfColumns]);

  const initializeLoadedBracket = useCallback(async (loadedBracket) => {
    // log bracket details
    console.debug("Loaded bracket:", loadedBracket);

    // set owner details
    setOwner({ id: loadedBracket.ownerId, name: loadedBracket.ownerUsername });
    checkAndUpdateOwnerUsername(loadedBracket.ownerId);

    // set bracket data
    let mymap = new Map(Object.entries(loadedBracket.bracketData));
    mymap = new Map([...mymap].sort(bracketSorter));
    setBracket(mymap);

    // set song source
    if (loadedBracket.template.songSource && (loadedBracket.template.songSource.type === "artist" || loadedBracket.template.songSource.type === "playlist")) {
      setSongSource(loadedBracket.template.songSource);
      checkAndUpdateSongSource(loadedBracket.template.songSource);
    }

    setInclusionMethod(loadedBracket.template.inclusionMethod);
    setSeedingMethod(loadedBracket.template.seedingMethod);
    setLimit(loadedBracket.template.tracks.length);
    setTemplate({ id: loadedBracket.template.id, ownerId: loadedBracket.template.ownerId, ownerUsername: loadedBracket.template.ownerUsername, displayName: loadedBracket.template.displayName });
    setFills(loadedBracket.template.fills);
    setShowBracket(true);
    //setTracks(new Array(loadedBracket.tracks).fill(null));
    setLastSaved({ commandsLength: commands.length, time: Date.now() });
  }, [commands.length, bracketSorter, checkAndUpdateOwnerUsername, checkAndUpdateSongSource]);

  const initializeBracketFromTemplate = useCallback(async (templateData, ownerId, bracketId) => {
    console.debug("Creating new bracket from template...", templateData);
    // load template from backend
    let loadedTemplate;
    try {
      loadedTemplate = await getTemplate(templateData.id, templateData.ownerId);
    } catch (e) {
      showAlert("Error loading template bracket", "error", false);
      console.error(e);
      return;
    }
    // log template details
    console.debug("Loaded template:", loadedTemplate);

    // set owner details
    const userInfo = await getUserInfo(ownerId);
    setOwner({ id: userInfo.id, name: userInfo.display_name });

    // don't show the bracket while we get things ready
    setShowBracket(false);

    // set song source from passed in data
    setSongSource(loadedTemplate.songSource);

    setInclusionMethod(loadedTemplate.inclusionMethod);
    setSeedingMethod(loadedTemplate.seedingMethod);
    setLimit(loadedTemplate.tracks.length);
    setFills(loadedTemplate.fills);
    setTemplate({ id: loadedTemplate.id, ownerId: loadedTemplate.ownerId, displayName: loadedTemplate.displayName });

    // update preview urls
    await updatePreviewUrls(loadedTemplate.tracks);

    //fill bracket with template tracks
    const filledBracket = await fillBracket(loadedTemplate.tracks, getNumberOfColumns(loadedTemplate.tracks.length));
    setBracket(filledBracket);

    // create bracket and set it up for the user to fill
    startBracket({
      bracketId: bracketId,
      ownerUsername: userInfo.display_name,
      templateId: loadedTemplate.id,
      templateOwnerId: loadedTemplate.ownerId,
      bracketData: Object.fromEntries(filledBracket),
    });
  }, [getTemplate, startBracket, showAlert, getUserInfo, fillBracket, getNumberOfColumns, updatePreviewUrls]);

  const initializeBracketFromSource = useCallback(async (songSource, ownerId, limit) => {
    console.debug("Creating new bracket...");

    // set owner details
    const userInfo = await getUserInfo(ownerId);
    setOwner({ id: userInfo.id, name: userInfo.display_name });

    // don't show the bracket while we get things ready
    setShowBracket(false);

    // set song source from passed in data
    setSongSource(songSource);

    // get tracks from spotify
    const tempTrackList = await getTracks(songSource, limit);

    //kick off the bracket creation process
    await changeBracket(tempTrackList);
    // show the bracket in edit mode
    setEditMode(true);
  }, [changeBracket, getTracks, getUserInfo, setEditMode, setShowBracket, setSongSource]);

  //INITIALIZE BRACKET

  const kickOff = useCallback(async () => {
    console.debug("Kicking off", bracketId, locationState);
    if (bracketId && owner.id) {
      try {
        const loadedBracket = await getBracket(bracketId, owner.id);
        try {
          await initializeLoadedBracket(loadedBracket);
        } catch (e) {
          showAlert("Error loading bracket", "error", false);
          console.error(e);
        }
      } catch (error) {
        if (error.cause && error.cause.code === 404) {
          if (locationState && locationState.template) {
            await initializeBracketFromTemplate(locationState.template, owner.id, bracketId);
          } else if (locationState && (locationState.artist || locationState.playlist)) {
            try {
              delete locationState.key;
              await initializeBracketFromSource(locationState, owner.id, limit);
            } catch (e) {
              showAlert("Error creating bracket", "error", false);
              console.error(e);
              //throw e;
            }
          } else {
            // Bracket doesn't exist and no artist was passed in
            setBracket(null);
          }
        } else if (error.cause && error.cause.code === 429) {
          showAlert("Error loading bracket! Please try again later", "error", false);
        } else {
          showAlert(error.message, "error", false);
          throw error;
        }
      }
    }
  }, [initializeBracketFromSource, initializeBracketFromTemplate, initializeLoadedBracket, bracketId, owner.id, locationState, limit, showAlert, setBracket, getBracket]);

  useEffect(() => {
    kickOff();
  }, []);

  // SHARE

  function share() {
    navigator.clipboard.writeText(location.href);
    console.debug("copied link");
    showAlert("Link copied to clipboard!", "success");
  }

  // DUPLICATE

  async function duplicateBracket() {
    if (template && template.id && template.ownerId && userInfo.userId) {
      // generate new bracket id
      const uuid = uuidv4();
      console.debug("Create New Bracket with id: " + uuid);

      // navigate to new bracket psge (same page really)
      navigate("/user/" + userInfo.userId + "/bracket/" + uuid, { template: template });

      // reset state because we stay on the same page
      await resetState();

      // set state for new bracket
      setBracketId(uuid);
      setOwner({ id: userInfo.userId, name: undefined });
      setLocationState({ template: template });
      setLoadingText("Duplicating bracket...");

      // kick off new bracket creation
      //await kickOff(uuid, { id: userId, name: undefined }, { template: template });
    } else {
      showAlert("Error duplicating bracket", "error");
      console.error("Error duplicating bracket. Something is wrong with the template:", template);
    }
  }

  // SAVE

  async function saveBracket(data) { // Called on these occasions: on initial bracket load, user clicks save button, user completes bracket
    if (saving !== true && editable && bracket.size > 0 && !editMode) {
      try {
        setSaving(true);
        //write to database and stuff
        console.debug("Saving bracket...");
        await backOff(() => updateBracket(bracketId, data), {
          jitter: "full", maxDelay: 25000, retry: (e) => {
            console.log(e);
            if (e.cause && e.cause.code === 429) {
              console.debug("429 error! Retrying with delay...", e);
              return true;
            }
            return false
          }
        });
        console.debug("Bracket Saved");
        //show notification Saved", "success");
        setSaving(false);
        setWaitingToSave(false);
        setLastSaved({ commandsLength: commands.length, time: Date.now() });
      } catch (error) {
        if (error.cause && error.cause.code === 429) {
          showAlert("Error saving bracket! Wait a minute or two and then try making another choice", "error");
        } else {
          showAlert(error.message, "error");
        }
        setSaving("error");
        setWaitingToSave(false);
      }
    }
  }

  // UNDO

  if (Mousetrap.bind) {
    Mousetrap.bind("mod+z", undo);
  }

  const clearCommands = useCallback(() => {
    setCommands([]);
  }, []);

  const saveCommand = useCallback((action, inverse) => {
    let temp = [
      ...commands,
      {
        action: action,
        inverse: inverse,
      },
    ];
    setCommands(temp);
  }, [commands]);

  function noChanges(navigateAway) {
    if ((navigateAway && !isSaved && commands.length > 0) || (!navigateAway && commands.length !== 0 && bracketUnchanged(bracket))) {
      if (
        window.confirm(
          "You have bracket changes that will be lost! Proceed anyways?"
        )
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

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

  // CHANGE HANDLING

  async function limitChange(e) {
    if (noChanges(false)) {
      setLimit(parseInt(e.target.value));
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
    }
  }

  async function seedingChange(e) {
    if (noChanges(false)) {
      setSeedingMethod(e.target.value);
      setShowBracket(false);
      if (inclusionMethod === "custom") {
        changeBracket(bracketTracks, undefined, e.target.value);
      } else {
        changeBracket(undefined, undefined, e.target.value);
      }
    }
  }

  async function inclusionChange(e) {
    if (noChanges(false)) {
      setInclusionMethod(e.target.value);
      setShowBracket(false);
      let tempSeedingMethod = seedingMethod;
      if (tempSeedingMethod === "custom" || (e.target.value !== "playlist" && tempSeedingMethod === "playlist")) {
        tempSeedingMethod = "popularity";
        setSeedingMethod("popularity");
      }
      changeBracket(undefined, undefined, tempSeedingMethod, e.target.value);
    }
  }

  function playbackChange(e) {
    setPlaybackEnabled(!playbackEnabled);
  }

  return (
    <Layout noChanges={noChanges} path={location.pathname}>
      {bracketWinner && commands.length !== 0 && <Confetti
        width={window.document.body.offsetWidth}
        height={window.document.body.offsetHeight}
        recycle={false}
        className="!z-[100]"
      />}
      <Alert show={alertInfo.show} close={closeAlert} message={alertInfo.message} type={alertInfo.type} />
      <BracketCompleteModal showModal={showBracketCompleteModal} setShowModal={(showModal) => showModal ? saveCommand(null, null) : clearCommands()} bracketWinner={bracketWinner} bracketTracks={bracketTracks} songSource={songSource} isSaved={isSaved} saving={saving} />
      <div className="text-center">
        <h1>{owner.name && songSource && bracket && bracketTracks ?
          <div className="mx-auto mb-2 flex flex-col gap-0 items-center justify-center max-w-[90%]">
            <div className="flex flex-row text-xl items-center justify-center gap-1 max-w-full">
              <span className="truncate w-auto font-bold">{songSource.type === "artist" ? songSource.artist.name : songSource.type === "playlist" ? songSource.playlist.name : ""}</span>
              {bracketTracks && bracketTracks.length ? <TrackNumber numTracks={bracketTracks.length} /> : null}
            </div>
            <span className="text-md">by {owner.name}</span>
            {template.ownerId !== owner.id && template.ownerUsername ? <span className="text-md">original by {template.ownerUsername}</span> : null}
            {/* {fills && fills > 0 && bracketWinner ? <span className="text-md">Filled out {fills} {fills === 1 ? "time" : "times"}!</span> : null} */}
          </div> :
          (bracket ?
            bracket.size > 0 ?
              <div>Error fetching bracket details!</div> :
              <div className="font-bold mb-2">Getting bracket...</div> :
            <div className="font-bold mb-2">Bracket not found</div>
          )}
        </h1>
        {bracketWinner
          ? <BracketWinnerInfo bracketWinner={bracketWinner} showSongInfo={songSource && songSource.type === "playlist"} /> : null}
      </div>
      <hr />
      <LoadingIndicator hidden={showBracket || !owner.name || !songSource} loadingText={loadingText} />
      <div hidden={!editMode || !showBracket} className="text-lg">Customize using the controls below. Drag and drop to rearrange songs!</div>
      <div hidden={!showBracket || !songSource} className="text-center">
        <div className="text-xs -space-x-px rounded-md sticky mx-auto top-0 w-fit z-30">
          <div className="flex items-center gap-2">
            {/* <GeneratePlaylistButton tracks={tracks} artist={artist} /> */}
            {editable && !bracketWinner && !editMode ?
              <>
                <SaveIndicator saving={saving} isSaved={isSaved} lastSaved={lastSaved} />

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
              </>
              : null}
            {!editMode ? <ActionButton
              onClick={share}
              icon={<ShareIcon />}
              text="Share" />
              : null}
            {!editMode && !editable ? <ActionButton
              onClick={duplicateBracket}
              icon={<DuplicateIcon />}
              text={loggedIn ? "Make my own picks" : "Login to pick your own winners!"}
              disabled={!loggedIn} />
              : null}
            {editable && !bracketWinner && editMode ?
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
                  playbackChange={playbackChange}
                  playbackEnabled={playbackEnabled}
                  startBracket={() => startBracket()}
                />
              </div>
              : null}
          </div>
        </div>
        <Bracket
          bracket={bracket}
          bracketTracks={bracketTracks}
          setBracket={setBracket}
          allTracks={allTracks}
          setShowBracket={setShowBracket}
          showBracket={showBracket}
          currentlyPlayingId={currentlyPlayingId}
          setCurrentlyPlayingId={setCurrentlyPlayingId}
          saveCommand={saveCommand}
          playbackEnabled={playbackEnabled}
          editable={editable}
          editMode={editMode}
          songSource={songSource}
          setSeedingMethod={setSeedingMethod}
          setInclusionMethod={setInclusionMethod}
        />
      </div>
    </Layout >
  )
}

export default App

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
    //name && userName ? `${name} bracket by ${userName}` : "View/edit bracket"
    <Seo title={"View/edit bracket"} />
  )
}