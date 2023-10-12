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
//import GeneratePlaylistButton from "../../../../components/GeneratePlaylistButton";
import BracketCompleteModal from "../../../../components/Bracket/BracketCompleteModal";
// Utilities
import { createBracket, getBracket, getTemplate, updateBracket } from "../../../../utilities/backend";
import { seedBracket, sortTracks, loadAlbums, processTracks, loadPlaylistTracks, updatePreviewUrls } from "../../../../utilities/songProcessing";
import { bracketSorter, bracketUnchanged, nearestLesserPowerOf2 } from "../../../../utilities/helpers";
import { getUserInfo, isCurrentUser, loadSpotifyRequest } from "../../../../utilities/spotify";
import { getNumberOfColumns, fillBracket } from "../../../../utilities/bracketGeneration";
// Assets
import ShareIcon from "../../../../assets/svgs/shareIcon.svg";
import DuplicateIcon from "../../../../assets/svgs/duplicateIcon.svg";
import { useDebounce } from "react-use";
import { SaveIndicator } from "../../../../components/Bracket/SaveIndicator";
import TrackNumber from "../../../../components/BracketCard/TrackNumber";
import { getUserId, isLoggedIn } from "../../../../utilities/authentication";
// Context
import { LoginContext } from "../../../../context/LoginContext";

const App = ({ params, location }) => {
  const defaultValues = {
    bracketId: params.id,
    owner: { "name": undefined, "id": params.userId },
    locationState: location.state,
    seedingMethod: "popularity",
    inclusionMethod: "popularity",
    limit: 32,
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

  const [bracketId, setBracketId] = useState(defaultValues.bracketId);
  const [owner, setOwner] = useState(defaultValues.owner);
  const [locationState, setLocationState] = useState(defaultValues.locationState);
  const [seedingMethod, setSeedingMethod] = useState(defaultValues.seedingMethod);
  const [inclusionMethod, setInclusionMethod] = useState(defaultValues.inclusionMethod);
  const [limit, setLimit] = useState(defaultValues.limit);
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

  const { loggedIn } = useContext(LoginContext);
  //console.log("sjdsjdf", loggedIn);

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
  }, [bracket, bracketTracks]);
  const showBracketCompleteModal = useMemo(() => {
    return bracketWinner && commands.length > 0;
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

  useEffect(() => {
    setWaitingToSave(true);
  }, [bracket, bracketWinner]);

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
      console.log("Bracket created");
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
  }, [makeCreationObject, showAlert]);

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
      if (songPossibilities === 1) {
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
    if (templist === 1) {
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
  }, [setAllTracks, setLimit, setSongSource, showAlert]);

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
      console.log(newCustomAllTracks);
      const temp = await fillBracket(newCustomAllTracks, getNumberOfColumns(newCustomAllTracks.length));
      setBracket(temp);
      return temp;
    } else {
      return null;
    }
  }, [allTracks, limit, seedingMethod, inclusionMethod, songSource, getTracks]);

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
    if (loadedBracket.songSource && (loadedBracket.songSource.type === "artist" || loadedBracket.songSource.type === "playlist")) {
      setSongSource(loadedBracket.songSource);
      checkAndUpdateSongSource(loadedBracket.songSource);
    }

    setInclusionMethod(loadedBracket.inclusionMethod);
    setSeedingMethod(loadedBracket.seedingMethod);
    setLimit(loadedBracket.tracks.length);
    setTemplate({ id: loadedBracket.templateId, ownerId: loadedBracket.templateOwnerId, displayName: loadedBracket.displayName });
    setShowBracket(true);
    //setTracks(new Array(loadedBracket.tracks).fill(null));
    setLastSaved({ commandsLength: commands.length, time: Date.now() });
  }, [commands.length]);

  const initializeBracketFromTemplate = useCallback(async (templateData, ownerId, bracketId) => {
    console.log("Creating new bracket from template...", templateData);
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
  }, [startBracket, showAlert]);

  const initializeBracketFromSource = useCallback(async (songSource, ownerId, limit) => {
    console.debug("Creating new bracket...");

    // set owner details
    getUserInfo(ownerId).then((userInfo) => {
      setOwner({ id: userInfo.id, name: userInfo.display_name });
    });

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
  }, [changeBracket, getTracks]);

  //INITIALIZE BRACKET

  const kickOff = useCallback(async () => {
    console.log("Kicking off", bracketId, locationState);
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
          console.log(locationState);
          if (locationState && locationState.template) {
            await initializeBracketFromTemplate(locationState.template, owner.id, bracketId);
          } else if (locationState && (locationState.artist || locationState.playlist)) {
            try {
              delete locationState.key;
              await initializeBracketFromSource(locationState, owner.id, limit);
            } catch (e) {
              showAlert("Error creating bracket", "error", false);
              throw e;
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
  }, [initializeBracketFromSource, initializeBracketFromTemplate, initializeLoadedBracket, bracketId, owner.id, locationState, limit, showAlert]);

  useEffect(() => {
    kickOff();
  }, [bracketId]);

  async function checkAndUpdateSongSource(tempSongSource) {
    if (tempSongSource.type === "artist") {
      const res = await loadSpotifyRequest("https://api.spotify.com/v1/artists/" + tempSongSource.artist.id);
      if (res !== 1) {
        setSongSource({ type: "artist", artist: { name: res.name, id: res.id } });
      }
    } else if (tempSongSource.type === "playlist") {
      const res = await loadSpotifyRequest("https://api.spotify.com/v1/playlists/" + tempSongSource.playlist.id);
      if (res !== 1) {
        setSongSource({ type: "playlist", playlist: { name: res.name, id: res.id } });
      }
    }
  }

  async function checkAndUpdateOwnerUsername(ownerId) {
    if (ownerId) {
      getUserInfo(ownerId).then((userInfo) => {
        if (userInfo !== 1) {
          setOwner({ id: userInfo.id, name: userInfo.display_name });
        }
      })
    }
  }

  // SHARE

  function share() {
    navigator.clipboard.writeText(location.href);
    console.log("copied link");
    showAlert("Link copied to clipboard!", "success");
  }

  // DUPLICATE

  async function duplicateBracket() {
    const currentUserId = getUserId();
    if (template && template.id && template.ownerId && currentUserId) {
      // generate new bracket id
      const uuid = uuidv4();
      console.log("Create New Bracket with id: " + uuid);

      // navigate to new bracket psge (same page really)
      navigate("/user/" + currentUserId + "/bracket/" + uuid, { template: template });

      // reset state because we stay on the same page
      setBracketId(uuid);
      setOwner({ id: currentUserId, name: undefined });
      setLocationState({ template: template });
      setSeedingMethod(defaultValues.seedingMethod);
      setInclusionMethod(defaultValues.inclusionMethod);
      setLimit(defaultValues.limit);
      setAllTracks(defaultValues.allTracks);
      setEditMode(defaultValues.editMode);
      setCommands(defaultValues.commands);
      setBracket(defaultValues.bracket);
      setTemplate(defaultValues.template);
      setSongSource(defaultValues.songSource);
      setCurrentlyPlayingId(defaultValues.currentlyPlayingId);
      setShowBracket(defaultValues.showBracket);
      setLoadingText("Duplicating bracket...");
      setSaving(defaultValues.saving);
      setWaitingToSave(defaultValues.waitingToSave);
      setLastSaved(defaultValues.lastSaved);
      setPlaybackEnabled(defaultValues.playbackEnabled);
      setAlertInfo(defaultValues.alertInfo);

      // kick off new bracket creation
      //await kickOff(uuid, { id: currentUserId, name: undefined }, { template: template });
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
        console.log("Saving bracket...");
        await backOff(() => updateBracket(bracketId, data), {
          jitter: "full", maxDelay: 25000, retry: (e) => {
            if (e.cause && e.cause.code === 429) {
              console.log("429 error! Retrying with delay...", e);
              return true;
            }
            return false
          }
        });
        console.log("Bracket Saved");
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

  function clearCommands() {
    setCommands([]);
  }

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

  function noChanges(naviagteAway) {
    if ((naviagteAway && (saving || !isReady() || waitingToSave) && commands.length > 0) || (!naviagteAway && commands.length !== 0 && bracketUnchanged(bracket))) {
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
      clearCommands();
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
      clearCommands();
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
      clearCommands();
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
      <BracketCompleteModal showModal={showBracketCompleteModal} setShowModal={(showModal) => showModal ? saveCommand(null, null) : clearCommands()} bracketWinner={bracketWinner} bracketTracks={bracketTracks} songSource={songSource} />
      <div className="text-center">
        <h1>{owner.name && songSource && bracket && bracketTracks ?
          <div className="mx-auto mb-2 flex flex-col gap-0 items-center justify-center max-w-[90%]">
            <div className="flex flex-row text-xl items-center justify-center gap-1 max-w-full">
              <span className="truncate w-auto font-bold">{songSource.type === "artist" ? songSource.artist.name : songSource.type === "playlist" ? songSource.playlist.name : ""}</span>
              {bracketTracks && bracketTracks.length ? <TrackNumber numTracks={bracketTracks.length} /> : null}
            </div>
            <span className="text-md">by {owner.name}</span>
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
                <SaveIndicator saving={saving} lastSaved={lastSaved} isReady={isReady} waitingToSave={waitingToSave} />

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
              text={isLoggedIn() ? "Make my own picks" : "Login to pick your own winners!"}
              disabled={!isLoggedIn()} />
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
  const [name, setName] = useState(null);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    async function updateTitle() {
      if (params && params.id && params.userId) {
        try {
          const loadedBracket = await getBracket(params.id, params.userId);
          if (loadedBracket && loadedBracket.userName) {
            setUserName(loadedBracket.userName);
            if (loadedBracket.songSource && loadedBracket.songSource.type === "artist") {
              setName(loadedBracket.songSource.artist.name);
            } else if (loadedBracket.songSource && loadedBracket.songSource.type === "playlist") {
              setName(loadedBracket.songSource.playlist.name);
            }
          }
        } catch (error) {

        }
      }
    }
    updateTitle();
  }, [params]);

  return (
    <Seo title={name && userName ? `${name} bracket by ${userName}` : "View/edit bracket"} />
  )
}