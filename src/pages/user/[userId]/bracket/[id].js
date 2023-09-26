// React
import React, { useEffect, useState, useMemo } from "react"
import { navigate } from "gatsby";
// Third Party
import Mousetrap from "mousetrap";
import Confetti from "react-confetti";
// Components
import { Seo } from "../../../../components/SEO";
import Bracket from "../../../../components/Bracket/Bracket"
import Layout from "../../../../components/Layout";
import LoadingIndicator from "../../../../components/LoadingIndicator";
import Alert from "../../../../components/Alert";
import BracketOptions from "../../../../components/Bracket/BracketOptions";
import BracketWinnerInfo from "../../../../components/Bracket/BracketWinnerInfo";
import ActionButton from "../../../../components/Bracket/ActionButton";
import GeneratePlaylistButton from "../../../../components/GeneratePlaylistButton";
// Utilities
import { createBracket, getBracket, updateBracket } from "../../../../utilities/backend";
import { seedBracket, sortTracks, loadAlbums, processTracks, loadPlaylistTracks } from "../../../../utilities/songProcessing";
import { bracketSorter, bracketUnchanged, nearestLesserPowerOf2 } from "../../../../utilities/helpers";
import { getUserInfo, isCurrentUser, loadSpotifyRequest } from "../../../../utilities/spotify";
import { getNumberOfColumns, fillBracket } from "../../../../utilities/bracketGeneration";
// Assets
import ShareIcon from "../../../../assets/svgs/shareIcon.svg";
import { useDebounce } from "react-use";
import { SaveIndicator } from "../../../../components/Bracket/SaveIndicator";
import TrackNumber from "../../../../components/BracketCard/TrackNumber";

const App = ({ params, location }) => {
  const bracketId = params.id;

  const [seedingMethod, setSeedingMethod] = useState("popularity");
  const [inclusionMethod, setInclusionMethod] = useState("popularity");
  const [limit, setLimit] = useState(32);
  const [allTracks, setAllTracks] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [commands, setCommands] = useState([]);
  const [lastSaved, setLastSaved] = useState({ time: 0, commandsLength: 0 });
  const [bracket, setBracket] = useState(new Map());
  //const [artist, setArtist] = useState({ "name": undefined, "id": undefined });
  const [songSource, setSongSource] = useState({ type: undefined });
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);

  const [owner, setOwner] = useState({ "name": undefined, "id": params.userId });

  const [showBracket, setShowBracket] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
  const [saving, setSaving] = useState(false);

  const editable = isCurrentUser(owner.id);
  const [playbackEnabled, setPlaybackEnabled] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: null, type: null, timeoutId: null });

  const bracketTracks = useMemo(() => {
    let tracks = [];
    if (bracket) {
      for (let item of bracket.values()) {
        if (item.song && item.col === 0) {
          tracks.push(item.song);
        }
      }
    }
    // console.log(allTracks);
    // console.log(tracks);
    // console.log(bracket);
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

  const [isReady, cancel] = useDebounce(() => {
    if (bracket) {
      const bracketObject = Object.fromEntries(bracket);
      if (bracketWinner) {
        saveBracket({ bracketData: bracketObject, winner: bracketWinner });
      } else {
        saveBracket({ bracketData: bracketObject });
      }
    }
  }, 1000, [bracket, bracketWinner]);

  //Save, Undo, Bracket content, Bracket Options (maybe with edit mode), User, Confetti, Playback

  //INITIALIZE BRACKET

  useEffect(() => {
    async function kickOff() {
      if (bracketId && owner.id) {
        getBracket(bracketId, owner.id).then(async (loadedBracket) => {
          try {
            if (loadedBracket && loadedBracket !== 1) {
              try {
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
                setShowBracket(true);
                //setTracks(new Array(loadedBracket.tracks).fill(null));
                setLastSaved({ commandsLength: commands.length, time: Date.now() });
              } catch (e) {
                console.error(e);
                throw new Error("Error loading bracket");
              }
            } else if (location.state && location.state.templateId) {


            } else if (location.state && (location.state.artist || location.state.playlist)) {
              try {
                console.debug("Creating new bracket...");

                // set user info
                getUserInfo(owner.id).then((userInfo) => {
                  setOwner({ id: userInfo.id, name: userInfo.display_name });
                });

                // don't show the bracket while we get things ready
                setShowBracket(false);

                // set song source from passed in data
                delete location.state.key;
                setSongSource(location.state);

                // get tracks from spotify
                const templist = await getTracks(location.state);

                //kick off the bracket creation process
                await changeBracket(templist);
                // show the bracket in edit mode
                setEditMode(true);
              } catch (e) {
                console.error(e);
                throw new Error("Error creating bracket");
              }
            } else {
              // Bracket doesn't exist and no artist was passed in
              setBracket(null);
              throw new Error("Bracket not found");
            }
          } catch (e) {
            showAlert(e.message, "error", false);
            console.error(e);
          }
        });
      }
    }
    kickOff();
  }, []);

  async function changeBracket(customAllTracks = allTracks, customLimit = limit, customSeedingMethod = seedingMethod, customInclusionMethod = inclusionMethod) {
    if (!customAllTracks || customAllTracks.length === 0) {
      customAllTracks = await getTracks(songSource);
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
  }

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

  // ALERTS

  function showAlert(message, type = "info", timeout = true) {
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
  }

  function closeAlert() {
    if (alertInfo.timeoutId) {
      clearTimeout(alertInfo.timeoutId);
    }
    setAlertInfo({ show: false, message: null, type: null, timeoutId: null });
  }

  // EDIT MODE

  function startBracket() {
    setEditMode(false);
    const bracketObject = Object.fromEntries(bracket);
    createBracket({
      bracketId: bracketId,
      bracketData: bracketObject,
      ownerUsername: owner.name,
      seedingMethod: seedingMethod,
      inclusionMethod: inclusionMethod,
      displayName: null,
      tracks: bracketTracks,
      songSource: songSource,
    }).then((res) => {
      if (res === 0) {
        console.log("Bracket created");
      } else {
        console.error("Error creating bracket");
      }
    });
  }

  // SHARE

  function share() {
    navigator.clipboard.writeText(location.href);
    console.log("copied link");
    showAlert("Link copied to clipboard!", "success");
  }

  // DUPLICATE

  function duplicateBracket() {
    console.log("duplicating bracket for another user...");
  }

  // SAVE

  async function saveBracket(data) { // Called on these occasions: on initial bracket load, user clicks save button, user completes bracket
    if (!saving && editable && bracket.size > 0 && !editMode) {
      setSaving(true);
      //write to database and stuff
      console.log("Saving bracket...");
      if (await updateBracket(bracketId, data) === 0) {
        console.log("Bracket Saved");
        //show notification confirming the save
        //showAlert("Bracket Saved", "success");
        setSaving(false);
        setLastSaved({ commandsLength: commands.length, time: Date.now() });
      } else {
        showAlert("Error saving bracket", "error", false);
        setSaving("error");
        console.log("saving", saving);
        return;
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

  function saveCommand(action, inverse) {
    let temp = [
      ...commands,
      {
        action: action,
        inverse: inverse,
      },
    ];
    setCommands(temp);
  }

  function noChanges(naviagteAway) {
    if ((naviagteAway && (saving || !isReady())) || (!naviagteAway && commands.length !== 0 && bracketUnchanged(bracket))) {
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

  // GET TRACKS

  async function getTracks(songSource) {
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
      <div hidden={!editMode || !showBracket} className="font-bold text-lg">Customize using the controls below. Drag and drop to rearrange songs</div>
      <div hidden={!showBracket || !songSource} className="text-center">
        <div className="text-xs -space-x-px rounded-md sticky mx-auto top-0 w-fit z-30">
          <div className="flex items-center gap-2">
            {/* <GeneratePlaylistButton tracks={tracks} artist={artist} /> */}
            {editable && !bracketWinner && !editMode ?
              <>
                <SaveIndicator saving={saving} lastSaved={lastSaved} isReady={isReady} />

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
            {!editMode ? <ActionButton onClick={share} icon={<ShareIcon />} text="Share" /> : null}
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
                  startBracket={startBracket}
                />
              </div>
              : null}
            {/* future button to let users duplicate the bracket to their account */}
            {!editable && owner.name && songSource && false
              ? <button onClick={duplicateBracket} className="border-l-gray-200 hover:disabled:border-l-gray-200">Fill out this bracket</button>
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
        getBracket(params.id, params.userId).then(async (loadedBracket) => {
          if (loadedBracket !== 1 && loadedBracket && loadedBracket.userName) {
            setUserName(loadedBracket.userName);
            if (loadedBracket.songSource && loadedBracket.songSource.type === "artist") {
              setName(loadedBracket.songSource.artist.name);
            } else if (loadedBracket.songSource && loadedBracket.songSource.type === "playlist") {
              setName(loadedBracket.songSource.playlist.name);
            }
          }
        });
      }
    }
    updateTitle();
  }, [params]);

  return (
    <Seo title={name && userName ? `${name} bracket by ${userName}` : "View/edit bracket"} />
  )
}