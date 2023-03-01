// React
import React, { useEffect, useState } from "react"
import { navigate } from "gatsby";
// Third Party
import Mousetrap from "mousetrap";
import Confetti from "react-confetti";
import useWindowSize from 'react-use/lib/useWindowSize'
// Components
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
import { seedBracket, loadAlbums, processTracks } from "../../../../utilities/songProcessing";
import { bracketSorter, nearestLesserPowerOf2, popularitySort } from "../../../../utilities/helpers";
import { getUserInfo, isCurrentUser } from "../../../../utilities/spotify";
// Assets
import UndoIcon from "../../../../assets/svgs/undoIcon.svg";
import SaveIcon from "../../../../assets/svgs/saveIcon.svg";
import ShareIcon from "../../../../assets/svgs/shareIcon.svg";
import RocketIcon from "../../../../assets/svgs/rocketIcon.svg";
import EditIcon from "../../../../assets/svgs/editIcon.svg";

const App = ({ params, location }) => {
  const bracketId = params.id;

  const [saveButtonDisabled, setSaveButtonDisabled] = useState(true);
  const [readyToChange, setReadyToChange] = useState(false);
  const [editable, setEditable] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState({ "name": undefined, "id": params.userId });
  const [tracks, setTracks] = useState(null);
  const [allTracks, setAllTracks] = useState(null);
  const [artist, setArtist] = useState({ "name": undefined, "id": undefined });
  const [bracket, setBracket] = useState(new Map());
  const [showBracket, setShowBracket] = useState(true);
  const [limit, setLimit] = useState(32);
  const [seedingMethod, setSeedingMethod] = useState("popularity");
  const [playbackEnabled, setPlaybackEnabled] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
  const [bracketComplete, setBracketComplete] = useState(false);
  const [bracketWinner, setBracketWinner] = useState(null);
  const [commands, setCommands] = useState([]);
  const [lastSaved, setLastSaved] = useState({ time: 0, commandsLength: 0 });
  const [alertInfo, setAlertInfo] = useState({ show: false, message: null, type: null, timeoutId: null });
  const [confetti, setConfetti] = useState(true);
  const { width, height } = useWindowSize()

  //Save, Undo, Bracket content, Bracket Options (maybe with edit mode), User, Confetti, Playback

  //INITIALIZE BRACKET

  useEffect(() => {
    if (bracketId) {
      getBracket(bracketId, user.id).then((loadedBracket) => {
        if (loadedBracket === 1) {
          // Error
          showAlert("Error loading bracket", "error", false);
          return
        }
        if (loadedBracket) {
          console.log(loadedBracket);
          setUser({ id: loadedBracket.userId, name: loadedBracket.userName });
          // Bracket already exists, now check if it belongs to the current user or not
          isCurrentUser(loadedBracket.userId).then((isCurrentUser) => {
            if (isCurrentUser) {
              setEditable(true);
            } else {
              setEditable(false);
            }
            let mymap = new Map(Object.entries(loadedBracket.bracketData));
            mymap = new Map([...mymap].sort(bracketSorter));
            setBracket(mymap);
            setArtist({ name: loadedBracket.artistName, id: loadedBracket.artistId });
            setSeedingMethod(loadedBracket.seeding);
            setLimit(loadedBracket.tracks);
            setBracketComplete(loadedBracket.completed);
            if (loadedBracket.winner === undefined && !loadedBracket.completed) {
              setBracketWinner(null);
            } else {
              setBracketWinner(loadedBracket.winner);
            }
            setShowBracket(true);
            setTracks(new Array(loadedBracket.tracks).fill(null));
            setLastSaved({ commandsLength: commands.length, time: Date.now() });
          });
        } else {
          if (location.state && location.state.artist) {
            getUserInfo(user.id).then((userInfo) => {
              setUser({ id: userInfo.id, name: userInfo.display_name });
            });
            console.log(location.state);
            // Bracket does not exist, make it editable for current user
            console.log("Bracket", bracketId, "not found for user. Creating New Bracket");
            setArtist(location.state.artist);
            setShowBracket(false);
            getTracks(location.state.artist); //kick off the bracket creating process
            setEditable(true);
            setReadyToChange(true);
          } else {
            // Bracket doesn't exist and no artist was passed in
            setBracket(null);
          }
        }
      });
    }
  }, []);

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
      if (lastSaved.time + 10000 < Date.now()) {
        saveBracket();
      }
    }
  }, [readyToChange, editable, bracket]);

  useEffect(() => {
    if (bracketId && user && artist && tracks && seedingMethod && bracket && editable) {
      setReadyToChange(true);
    }
  }, [bracketId, user, artist, tracks, seedingMethod, bracket, editable]);

  useEffect(() => {
    if (readyToChange) {
      saveBracket();
    }
  }, [bracketComplete]);

  useEffect(() => {
    if (bracketId && user && artist && tracks && seedingMethod && bracket && editable) {
      setLastSaved({ commandsLength: commands.length, time: 0 }); //when the tracks change reset the last saved time so that it will save immediately
    }
  }, [tracks]);

  async function saveBracket() { // Called on these occasions: on initial bracket load, user clicks save button, user completes bracket
    if (bracketId && user && artist && tracks && seedingMethod && bracket && editable && readyToChange) {
      const obj = Object.fromEntries(bracket);
      const theBracket = {
        id: bracketId,
        userId: user.id,
        userName: user.name,
        artistName: artist.name,
        artistId: artist.id,
        tracks: tracks.length,
        seeding: seedingMethod,
        lastModifiedDate: Date.now(),
        completed: bracketComplete,
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
        showAlert("Error saving bracket", "error");
        setSaveButtonDisabled(false);
      }
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
    if ((naviagteAway && !saveButtonDisabled) || (!naviagteAway && commands.length !== 0 && !bracketComplete)) {
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

  async function getTracks(providedArtist) {
    console.log("getting tracks");
    setLoadingText("Gathering Spotify tracks for " + providedArtist.name + "...");
    const songs = await loadAlbums("https://api.spotify.com/v1/artists/" + providedArtist.id + "/albums?include_groups=album,single&limit=20");
    if (songs === 1) {
      showAlert("Error loading tracks from Spotify", "error", false);
      return;
    }
    // load data for the songs
    setLoadingText("Gathering track information...");
    let templist = await processTracks(songs);
    if (templist === 1) {
      showAlert("Error loading tracks from Spotify", "error", false);
      return;
    }
    // if the artist has less than 8 songs, stop
    if (templist.length >= 8) {
      const power = nearestLesserPowerOf2(templist.length);
      setLoadingText("Seeding tracks by " + seedingMethod + "...");
      // sort the list by popularity
      templist.sort(popularitySort);
      setAllTracks(templist);
      const numTracks = (limit < power ? limit : power);
      templist = templist.slice(0, numTracks);
      // limit the list length to the nearest lesser power of 2 (for now) and seed the bracket
      templist = seedBracket(templist, seedingMethod);
      console.table(templist);
      setTracks(templist);
      setShowBracket(true);
    } else {
      alert(providedArtist.name + " doesn't have enough songs on Spotify! Try another artist.");
      setTracks([]);
      setArtist({ "name": undefined, "id": undefined });
      navigate("/my-brackets")
    }
    setLoadingText("Generating bracket...");
  }

  // CHANGE HANDLING

  function limitChange(e) {
    if (noChanges(false)) {
      setLimit(parseInt(e.target.value));
    }
  }

  function seedingChange(e) {
    if (noChanges(false)) {
      setSeedingMethod(e.target.value);
    }
  }

  function playbackChange(e) {
    setPlaybackEnabled(!playbackEnabled);
  }

  useEffect(() => {
    console.log(bracketWinner);
    if (bracketWinner === null) {
      setBracketComplete(false);
      setConfetti(false);
    } else {
      setBracketComplete(true);
      if (editable && readyToChange) {
        setConfetti(true);
      }
    }
    saveBracket();
  }, [bracketWinner]);

  useEffect(() => {
    async function changeSeedingMethod(seedingMethod) {
      if (artist.id && tracks && readyToChange) {
        console.log("seeding changed");
        if (tracks.includes(null)) {
          await getTracks(artist);
        } else {
          setTracks(seedBracket([...tracks], seedingMethod));
          clearCommands();
        }
      }
    }

    changeSeedingMethod(seedingMethod);
  }, [seedingMethod]);

  useEffect(() => {
    if (artist.id && tracks) {
      if (readyToChange) {
        setShowBracket(false);
        clearCommands();
        console.log("limit changed");
        getTracks(artist);
      }
      else {
        setReadyToChange(true);
      }
    }
  }, [limit]);

  return (
    <Layout noChanges={noChanges}>
      {confetti ? <Confetti
        width={width}
        height={height}
        recycle={false}
        onConfettiComplete={() => setConfetti(false)}
      /> : null}
      <Alert show={alertInfo.show} close={closeAlert} message={alertInfo.message} type={alertInfo.type} />
      <div className="text-center">
        {user.name && artist.name ? <div className="font-bold mb-2 text-xl">{artist.name} bracket by {user.name} {tracks ? "(" + tracks.length + " tracks)" : null}</div> : (bracket ? <div>Finding bracket...</div> : <div className="font-bold mb-2">Bracket not found</div>)}
        {bracketComplete && bracketWinner
          ? <BracketWinnerInfo bracketWinner={bracketWinner} /> : null}
      </div>
      <hr />
      <LoadingIndicator hidden={showBracket} loadingText={loadingText} />
      <div hidden={!editMode || !showBracket} className="font-medium text-lg">Drag and drop to rearrange songs as you like</div>
      <div hidden={!showBracket || !artist.name} className="text-center">
        <div className="text-xs -space-x-px rounded-md sticky mx-auto top-0 w-fit z-30">
          <div className="flex items-center">
            {/* <GeneratePlaylistButton tracks={tracks} artist={artist} /> */}
            {editable && !bracketComplete && !editMode ?
              <>
                <ActionButton
                  onClick={undo}
                  disabled={commands.length === 0}
                  icon={<UndoIcon />}
                  text="Undo"
                />
                <ActionButton
                  onClick={saveBracket}
                  disabled={saveButtonDisabled}
                  icon={<SaveIcon />}
                  text={saveButtonDisabled ? "Saved" : "Save"}
                />
                <ActionButton
                  onClick={() => { setEditMode(true); setReadyToChange(false); }}
                  disabled={commands.length != 0}
                  icon={<EditIcon />}
                  text="Edit Layout"
                />
              </>
              : null}
            {!editMode ? <ActionButton onClick={share} icon={<ShareIcon />} text="Share" /> : null}
            {editable && !bracketComplete && editMode ?
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
            {!editable && user.name && artist.name && false
              ? <button onClick={duplicateBracket} className="border-l-gray-200 hover:disabled:border-l-gray-200">Fill out this bracket</button>
              : null}
          </div>
        </div>
        <Bracket bracket={bracket} setBracket={setBracket} allTracks={allTracks} tracks={tracks} setShowBracket={setShowBracket} showBracket={showBracket} saveCommand={saveCommand} playbackEnabled={playbackEnabled} setBracketWinner={setBracketWinner} editable={editable} editMode={editMode} />
      </div>
    </Layout >
  )
}

export default App

export function Head() {
  return (
    <title>Beat Bracket - View Bracket</title>
  )
}