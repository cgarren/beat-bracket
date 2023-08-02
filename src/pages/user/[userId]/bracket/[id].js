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
import { writeBracket, getBracket } from "../../../../utilities/backend";
import { seedBracket, loadAlbums, processTracks, loadPlaylist } from "../../../../utilities/songProcessing";
import { bracketSorter, bracketUnchanged, nearestLesserPowerOf2, popularitySort } from "../../../../utilities/helpers";
import { getUserInfo, isCurrentUser } from "../../../../utilities/spotify";
import { getNumberOfColumns, fillBracket } from "../../../../utilities/bracketGeneration";
// Assets
import UndoIcon from "../../../../assets/svgs/undoIcon.svg";
import SaveIcon from "../../../../assets/svgs/saveIcon.svg";
import ShareIcon from "../../../../assets/svgs/shareIcon.svg";
import RocketIcon from "../../../../assets/svgs/rocketIcon.svg";
import EditIcon from "../../../../assets/svgs/editIcon.svg";

const App = ({ params, location }) => {
  const bracketId = params.id;

  const [seedingMethod, setSeedingMethod] = useState("popularity");
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
  const [saveButtonDisabled, setSaveButtonDisabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const editable = isCurrentUser(owner.id);
  const [playbackEnabled, setPlaybackEnabled] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: null, type: null, timeoutId: null });

  const bracketTracks = useMemo(() => {
    console.log(bracket);
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
  const readyToChange = bracket ? bracket.size > 0 : false;
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

  //Save, Undo, Bracket content, Bracket Options (maybe with edit mode), User, Confetti, Playback

  //INITIALIZE BRACKET

  useEffect(() => {
    async function kickOff() {
      if (bracketId && owner.id) {
        getBracket(bracketId, owner.id).then(async (loadedBracket) => {
          if (loadedBracket === 1) {
            // Error
            showAlert("Error loading bracket", "error", false);
            return
          }
          if (loadedBracket) {
            console.log(loadedBracket);
            setOwner({ id: loadedBracket.userId, name: loadedBracket.userName });
            // Bracket already exists, now check if it belongs to the current user or not
            let mymap = new Map(Object.entries(loadedBracket.bracketData));
            mymap = new Map([...mymap].sort(bracketSorter));
            setBracket(mymap);
            if (loadedBracket.songSource && (loadedBracket.songSource.type === "artist" || loadedBracket.songSource.type === "playlist")) {
              setSongSource(loadedBracket.songSource);
            }
            else if (loadedBracket.artistName && loadedBracket.artistId) {
              setSongSource({ type: "artist", artist: { name: loadedBracket.artistName, id: loadedBracket.artistId } })
            } else {
              throw new Error("Bracket has invalid songSource and no legacy artist data");
            }


            setSeedingMethod(loadedBracket.seeding);
            setLimit(loadedBracket.tracks);
            setShowBracket(true);
            //setTracks(new Array(loadedBracket.tracks).fill(null));
            setLastSaved({ commandsLength: commands.length, time: Date.now() });
          } else {
            if (location.state && (location.state.artist || location.state.playlist)) {
              getUserInfo(owner.id).then((userInfo) => {
                setOwner({ id: userInfo.id, name: userInfo.display_name });
              });
              console.log(location.state);
              // Bracket does not exist, make it editable for current user
              console.log("Bracket", bracketId, "not found for user. Creating New Bracket");
              setShowBracket(false);
              const creationObject = location.state.artist ?
                { type: "artist", artist: { name: location.state.artist.name, id: location.state.artist.id } } :
                location.state.playlist ?
                  { type: "playlist", playlist: { name: location.state.playlist.name, id: location.state.playlist.id } } :
                  null
              setSongSource(creationObject);
              const templist = await getTracks(creationObject); //kick off the bracket creation process
              await changeBracket(templist);
            } else {
              // Bracket doesn't exist and no artist was passed in
              console.log("Bracket", bracketId, "not found for user. No artist provided");
              setBracket(null);
            }
          }
        });
      }
    }
    kickOff();
  }, []);

  async function changeBracket(customAllTracks = allTracks, customLimit = limit, customSeedingMethod = seedingMethod) {
    if (!customAllTracks || customAllTracks.length === 0) {
      customAllTracks = await getTracks(songSource);
    }
    const power = nearestLesserPowerOf2(customAllTracks.length);
    //setLoadingText("Seeding tracks by " + seedingMethod + "...");
    // sort the list by popularity
    customAllTracks.sort(popularitySort);
    const numTracks = (customLimit < power ? customLimit : power);
    customAllTracks = customAllTracks.slice(0, numTracks);
    // limit the list length to the nearest lesser power of 2 (for now) and seed the bracket
    customAllTracks = await seedBracket(customAllTracks, customSeedingMethod);
    if (customAllTracks && customAllTracks.length > 0) {
      const temp = await fillBracket(customAllTracks, getNumberOfColumns(customAllTracks.length));
      setBracket(temp);
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

  function toggleEditMode() {
    setEditMode(!editMode);
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

  useEffect(() => {
    if (readyToChange) {
      if (lastSaved.time + 10000 < Date.now() || bracketWinner) {
        saveBracket();
      }
    }
  }, [bracket, bracketWinner]);

  // useEffect(() => {
  //   if (bracketId && owner && artist && tracks && seedingMethod && bracket && editable) {
  //     setReadyToChange(true);
  //   }
  // }, [bracketId, owner, artist, seedingMethod, bracket, editable, allTracks]);

  // useEffect(() => {
  //   if (bracketId && owner && artist && tracks && seedingMethod && bracket && editable) {
  //     setLastSaved({ commandsLength: commands.length, time: 0 }); //when the tracks change reset the last saved time so that it will save immediately
  //   }
  // }, [allTracks]);

  async function saveBracket() { // Called on these occasions: on initial bracket load, user clicks save button, user completes bracket
    setSaving(true);
    if (bracketId && owner && songSource && seedingMethod && bracket && editable && readyToChange) {
      const obj = Object.fromEntries(bracket);
      const theBracket = {
        id: bracketId,
        userId: owner.id,
        userName: owner.name,
        songSource: songSource,
        tracks: bracketTracks.length,
        seeding: seedingMethod,
        lastModifiedDate: Date.now(),
        winner: bracketWinner,
        bracketData: obj,
      };
      //write to database and stuff
      if (await writeBracket(theBracket) === 0) {
        console.log("Bracket Saved");
        //show notification confirming the save
        showAlert("Bracket Saved", "success");
        setLastSaved({ commandsLength: commands.length, time: Date.now() });
        setSaveButtonDisabled(true);
      } else {
        showAlert("Error saving bracket", "error", false);
        setSaveButtonDisabled(false);
      }
      setSaving(false);
    }

  }

  // UNDO

  if (Mousetrap.bind) {
    Mousetrap.bind("mod+z", undo);
  }

  function clearCommands() {
    setCommands([]);
    setSaveButtonDisabled(false);
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
    setSaveButtonDisabled(false);
  }

  function noChanges(naviagteAway) {
    if ((naviagteAway && !saveButtonDisabled) || (!naviagteAway && commands.length !== 0 && bracketUnchanged(bracket))) {
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
      setSaveButtonDisabled(false);
    }
    return false;
  }

  // GET TRACKS

  async function getTracks(songSource) {
    console.log(songSource);
    if (!songSource || !songSource.type) {
      return [];
    }

    console.log("getting tracks");
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
      templist = await loadPlaylist("https://api.spotify.com/v1/playlists/" + songSource.playlist.id + "/tracks?limit=50");
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
    setLoadingText("Generating bracket...");
    return templist;
  }

  // CHANGE HANDLING

  async function limitChange(e) {
    if (noChanges(false)) {
      setLimit(parseInt(e.target.value));
      setShowBracket(false);
      clearCommands();
      changeBracket(undefined, e.target.value);
    }
  }

  async function seedingChange(e) {
    if (noChanges(false)) {
      setSeedingMethod(e.target.value);
      setShowBracket(false);
      const seededTracks = await seedBracket(bracketTracks, e.target.value);
      if (seededTracks && seededTracks.length > 0) {
        const temp = await fillBracket(seededTracks, getNumberOfColumns(seededTracks.length));
        setBracket(temp);
      }
      clearCommands();
    }
  }

  function playbackChange(e) {
    setPlaybackEnabled(!playbackEnabled);
  }

  return (
    <Layout noChanges={noChanges} path={location.pathname}>
      {bracketWinner && commands.length !== 0 ? <Confetti
        width={window.document.body.offsetWidth}
        height={window.document.body.offsetHeight}
        recycle={false}
      /> : null}
      <Alert show={alertInfo.show} close={closeAlert} message={alertInfo.message} type={alertInfo.type} />
      <div className="text-center">
        <h1>{owner.name && songSource ? <div className="font-bold mb-2 text-xl">{songSource.type === "artist" ? songSource.artist.name : songSource.type === "playlist" ? songSource.playlist.name : ""} bracket by {owner.name} {bracketTracks.length ? "(" + bracketTracks.length + " tracks)" : null}</div> : (bracket ? <div>Finding bracket...</div> : <div className="font-bold mb-2">Bracket not found</div>)}</h1>
        {bracketWinner
          ? <BracketWinnerInfo bracketWinner={bracketWinner} /> : null}
      </div>
      <hr />
      <LoadingIndicator hidden={showBracket || !owner.name || !songSource} loadingText={loadingText} />
      <div hidden={!editMode || !showBracket} className="font-medium text-lg">Drag and drop to rearrange songs</div>
      <div hidden={!showBracket || !songSource} className="text-center">
        <div className="text-xs -space-x-px rounded-md sticky mx-auto top-0 w-fit z-30">
          <div className="flex items-center">
            {/* <GeneratePlaylistButton tracks={tracks} artist={artist} /> */}
            {editable && !bracketWinner && !editMode ?
              <>
                <ActionButton
                  onClick={undo}
                  disabled={commands.length === 0}
                  icon={<UndoIcon />}
                  text="Undo"
                />
                <ActionButton
                  onClick={saveBracket}
                  disabled={saveButtonDisabled || saving}
                  icon={<SaveIcon />}
                  text={saving ? "Saving..." : saveButtonDisabled ? "Saved" : "Save"}
                />
                <ActionButton
                  onClick={() => {
                    setEditMode(true);
                    setCurrentlyPlayingId(null);
                    if (!allTracks.length && readyToChange) {
                      getTracks(songSource);
                    }
                  }}
                  disabled={commands.length !== 0 || !bracketUnchanged(bracket)}
                  icon={<EditIcon />}
                  text="Edit"
                />
              </>
              : null}
            {!editMode ? <ActionButton onClick={share} icon={<ShareIcon />} text="Share" /> : null}
            {editable && !bracketWinner && editMode ?
              <>
                <BracketOptions
                  limitChange={limitChange}
                  showBracket={showBracket}
                  limit={limit}
                  seedingChange={seedingChange}
                  seedingMethod={seedingMethod}
                  playbackChange={playbackChange}
                  playbackEnabled={playbackEnabled}
                />
                <ActionButton
                  onClick={toggleEditMode}
                  disabled={false}
                  icon={<RocketIcon />}
                  text={"Start Bracket"}
                />
              </>
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
          showSongInfo={songSource && songSource.type === "playlist"}
        />
      </div>
    </Layout >
  )
}

export default App

export function Head({ params }) {
  const [artistName, setArtistName] = useState(null);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    async function updateTitle(retries) {
      if (params && params.id && params.userId) {
        getBracket(params.id, params.userId).then(async (loadedBracket) => {
          if (loadedBracket !== 1 && loadedBracket && loadedBracket.userName && loadedBracket.artistName) {
            setArtistName(loadedBracket.artistName);
            setUserName(loadedBracket.userName);
          } else if (retries < 5) {
            setTimeout(updateTitle, 6000, retries + 1);
          }
        }
        )
      }
    }
    updateTitle(0);
  }, [params]);

  return (
    <Seo title={artistName && userName ? `${artistName} bracket by ${userName}` : "View/edit bracket"} />
  )
}