import React, { useEffect, useState } from "react"
import { navigate } from "gatsby";
import Vibrant from "node-vibrant";
import Mousetrap from "mousetrap";
import Bracket from "../../../components/Bracket"
import Layout from "../../../components/Layout";
import LoadingIndicator from "../../../components/LoadingIndicator";
import Alert from "../../../components/Alert";
import GeneratePlaylistButton from "../../../components/GeneratePlaylistButton";
import { writeBracket, getBracket } from "../../../utilities/backend";
import { seedBracket, loadAlbums, processTracks } from "../../../utilities/songProcessing";
import { bracketSorter, nearestLesserPowerOf2, popularitySort } from "../../../utilities/helpers";
import { getUserInfo, isCurrentUser } from "../../../utilities/spotify";

const App = ({ params, location }) => {
  const bracketId = params.id;

  const [readyToChange, setReadyToChange] = useState(false);
  const [editable, setEditable] = useState(false);
  const [user, setUser] = useState({ "name": undefined, "id": params.userId });
  const [tracks, setTracks] = useState(null);
  const [artist, setArtist] = useState({ "name": undefined, "id": undefined });
  const [bracket, setBracket] = useState(new Map());
  const [showBracket, setShowBracket] = useState(true);
  const [limit, setLimit] = useState(32);
  const [seedingMethod, setSeedingMethod] = useState("popularity");
  const [playbackEnabled, setPlaybackEnabled] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
  const [bracketComplete, setBracketComplete] = useState(false);
  const [commands, setCommands] = useState([]);
  const [lastSaved, setLastSaved] = useState(0);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: null, type: null, timeoutId: null });

  //INITIALIZE BRACKET

  useEffect(() => {
    if (bracketId) {
      getBracket(bracketId, user.id).then((loadedBracket) => {
        if (loadedBracket === 1) {
          // Error
          showAlert("Error loading bracket", "error", false);
          return
        }
        getUserInfo(user.id).then((userInfo) => {
          if (userInfo) {
            setUser({ id: userInfo.id, name: userInfo.display_name });
          }
        });
        if (loadedBracket) {
          console.log(loadedBracket);
          // Bracket already exists, now check if it belongs to the current user or not
          isCurrentUser(loadedBracket.userId).then((isCurrentUser) => {
            if (isCurrentUser) {
              setEditable(true);
            } else {
              setEditable(false);
            }
            let mymap = new Map(Object.entries(loadedBracket.bracketData));
            mymap = new Map([...mymap].sort(bracketSorter));
            mymap.forEach((value, key) => {
              if (value.color) {
                value.color = new Vibrant.Swatch(value.color.rgb, value.color.population);
              }
            });
            setBracket(mymap);
            setArtist({ name: loadedBracket.artistName, id: loadedBracket.artistId });
            setSeedingMethod(loadedBracket.seeding);
            setLimit(loadedBracket.tracks);
            setBracketComplete(loadedBracket.completed);
            setShowBracket(true);
            setTracks(new Array(loadedBracket.tracks).fill(null));
            setLastSaved(Date.now());
          });
        } else {
          if (location.state && location.state.artist) {
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
            // Display Bracket not found message
            showAlert("Bracket does not exist", "error", false);
          }
        }
      });
    }
  }, []);

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
    if (bracketId && user && artist && tracks && seedingMethod && bracket && editable) {
      if (bracketComplete) {
        saveBracket();
      } else if (readyToChange) {
        if (lastSaved + 20000 < Date.now()) {
          saveBracket();
        }
      }
    }
  }, [bracketComplete, readyToChange, editable, bracket]);

  useEffect(() => {
    if (bracketId && user && artist && tracks && seedingMethod && bracket && editable) {
      setLastSaved(0); //when the tracks change reset the last saved time so that it will save immediately
    }
  }, [tracks]);

  async function saveBracket() { // Called on these occasions: on initial bracket load, user clicks save button, user completes bracket
    const obj = Object.fromEntries(bracket);
    const theBracket = {
      id: bracketId,
      userId: user.id,
      artistName: artist.name,
      artistId: artist.id,
      tracks: tracks.length,
      seeding: seedingMethod,
      lastModifiedDate: Date.now(),
      completed: bracketComplete,
      bracketData: obj,
    };
    //write to database and stuff
    if (await writeBracket(theBracket) === 0) {
      console.log("Bracket Saved");
      //show notification confirming the save
      showAlert("Bracket Saved", "success");
      setLastSaved(Date.now());
    } else {
      showAlert("Error saving bracket", "error");
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

  function noChanges() {
    if (commands.length !== 0 && !bracketComplete) {
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
      // limit the list length to the nearest lesser power of 2 (for now) and seed the bracket
      templist = seedBracket(templist.slice(0, (limit < power ? limit : power)), seedingMethod);
      console.table(templist);
      setTracks(templist);
      setShowBracket(true);
    } else {
      alert(providedArtist.name + " doesn't have enough songs on Spotify! Returning to your brackets")
      setTracks([]);
      setArtist({ "name": undefined, "id": undefined });
      navigate("/my-brackets")
    }
    setLoadingText("Generating bracket...");
  }

  // CHANGE HANDLING

  function limitChange(e) {
    if (noChanges()) {
      setLimit(parseInt(e.target.value));
    }
  }

  function seedingChange(e) {
    if (noChanges()) {
      setSeedingMethod(e.target.value);
    }
  }

  function playbackChange(e) {
    setPlaybackEnabled(!playbackEnabled);
  }

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
      <Alert show={alertInfo.show} message={alertInfo.message} type={alertInfo.type} />
      <div className="text-center">
        {user.name && artist.name ? <div className="font-bold mb-2">{artist.name} bracket by {user.name}</div> : <div>Loading...</div>}
        {editable && !bracketComplete ?
          <div className="inline-flex flex-col gap-1 max-w-[800px] items-center">
            <div className="rounded-lg mb-2 flex flex-col">
              <div className={""}>
                <label htmlFor="limit-select">Maximum tracks: </label>
                <select name="limit" id="limit-select" value={limit} onChange={limitChange} disabled={!showBracket} className="border-0 rounded border-black">
                  <option value="8">8</option>
                  <option value="16">16</option>
                  <option value="32">32</option>
                  <option value="64">64</option>
                  {/* <option value="128">128</option> */}
                  {/* <option value="256">256</option> */}
                </select>
              </div>
              <div className={""}>
                <label htmlFor="seeding-select">Seed by: </label>
                <select name="seeding" id="seeding-select" value={seedingMethod} onChange={seedingChange} disabled={!showBracket} className="border-0 rounded border-black">
                  <option value="random">Random</option>
                  <option value="popularity">Popularity</option>
                </select>
              </div>
              <div className={""}>
                <label htmlFor="playback-select">Hover preview (beta): </label>
                <input type="checkbox" id="playback-select" checked={playbackEnabled} onChange={playbackChange} disabled={!showBracket} name="playback-select"></input>
              </div>
            </div>
          </div>
          : editable
            ? <div>Bracket Complete</div> : null}
        <hr />
        <div>
          <LoadingIndicator hidden={showBracket} loadingText={loadingText} />
          <div hidden={!showBracket || !artist.name}>
            <div className="text-center">
              <div>
                <span className="font-bold">{tracks ? tracks.length + " tracks displayed" : ""}</span>
              </div>
              <div className="inline-flex items-center text-xs -space-x-px rounded-md">
                {editable && !bracketComplete ? <div>
                  {/* <GeneratePlaylistButton tracks={tracks} artist={artist} /> */}
                  <button
                    onClick={undo}
                    disabled={commands.length === 0}
                    className="border-l-gray-200 hover:disabled:border-x-gray-200"
                  >
                    Undo
                  </button>
                  <button onClick={saveBracket} className="border-l-gray-200 hover:disabled:border-l-gray-200">Save</button>
                </div>
                  : null}
                <button onClick={share} className="border-l-gray-200 hover:disabled:border-l-gray-200">
                  Share
                </button>
                {!editable && user.name && artist.name && false
                  ? <button onClick={duplicateBracket} className="border-l-gray-200 hover:disabled:border-l-gray-200">Fill out this bracket</button>
                  : null}
              </div>
            </div>
          </div>
          <Bracket bracket={bracket} setBracket={setBracket} tracks={tracks} setShowBracket={setShowBracket} showBracket={showBracket} saveCommand={saveCommand} playbackEnabled={playbackEnabled} bracketComplete={bracketComplete} setBracketComplete={setBracketComplete} editable={editable} />
        </div>
      </div>
    </Layout>
  )
}

export default App
