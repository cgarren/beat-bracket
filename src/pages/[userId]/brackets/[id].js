import React, { useEffect, useState } from "react"
import Bracket from "../../../components/Bracket"
import Mousetrap from "mousetrap";
import { bracketSorter, isCurrentUser, nearestLesserPowerOf2, popularitySort, shareBracket } from "../../../utilities/helpers";
import Layout from "../../../components/Layout";
import LoadingIndicator from "../../../components/LoadingIndicator";
import GeneratePlaylistButton from "../../../components/GeneratePlaylistButton";
import { getUserInfo } from "../../../utilities/helpers";
import { writeBracket, getBracket } from "../../../utilities/backend";
import { seedBracket, loadAlbums, processTracks } from "../../../utilities/songProcessing";
import { navigate } from "gatsby";
import Vibrant from "node-vibrant";

// markup
const App = ({ params, location }) => {
  const [bracketId, setBracketId] = useState(params.id);
  const [editable, setEditable] = useState(false);
  const [user, setUser] = useState({ "name": undefined, "id": params.userId });
  const [tracks, setTracks] = useState([]);
  const [artist, setArtist] = useState({ "name": undefined, "id": undefined });
  const [bracket, setBracket] = useState(new Map());
  const [showBracket, setShowBracket] = useState(true);
  const [limit, setLimit] = useState(32);
  const [seedingMethod, setSeedingMethod] = useState("popularity");
  const [playbackEnabled, setPlaybackEnabled] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
  const [bracketComplete, setBracketComplete] = useState(false);
  const [commands, setCommands] = useState([]);

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
    if (bracketId) {
      getBracket(bracketId, user.id).then((loadedBracket) => {
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
            setTracks(new Array(loadedBracket.tracks));
          });
        } else {
          if (location.state) {
            console.log(location.state);
            // Bracket does not exist, make it editable for current user
            console.log("Bracket", bracketId, "not found for user. Creating New Bracket");
            setArtist(location.state.artist);
            setShowBracket(false);
            getTracks(location.state.artist); //kick off the bracket creationg process
            setEditable(true);
          } else {
            // Bracket doesn't exist and no artist was passed in
            // Display Bracket not found message
            alert("No bracket found");
          }
        }
      });
    }
  }, []);

  async function saveBracket() { //Called on these occasions: user is about to exit page, user clicks save button, user completes bracket
    const obj = Object.fromEntries(bracket);
    console.log(bracket, obj);
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
    await writeBracket(theBracket);
    //show notification confirming the save
    console.log("Bracket Saved");
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
    if (commands.length !== 0) {
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

  async function getTracks(providedArtist) {
    setLoadingText("Gathering Spotify tracks for " + providedArtist.name + "...");
    let songs = await loadAlbums("https://api.spotify.com/v1/artists/" + providedArtist.id + "/albums?include_groups=album,single&limit=20");
    // load data for the songs
    setLoadingText("Gathering track information...");
    let templist = await processTracks(songs);
    // if the artist has less than 8 songs, stop
    if (templist.length >= 8) {
      const power = nearestLesserPowerOf2(templist.length);
      setLoadingText("Seeding tracks by " + seedingMethod + "...");
      // sort the list by popularity
      templist.sort(popularitySort);
      // limit the list length to the nearest lesser power of 2 (for now)
      templist = seedBracket(templist.slice(0, (limit < power ? limit : power)), seedingMethod);
      //console.table(templist);
      setTracks(templist);
    } else {
      alert(providedArtist.name + " doesn't have enough songs on Spotify! Returning to the profile page")
      setTracks([]);
      setArtist({ "name": undefined, "id": undefined });
      navigate("/profile")
    }
    setLoadingText("Generating bracket...");
  }

  // useEffect(() => {
  //   if (tracks.length === 0) {
  //     getTracks(artist);
  //   }
  //   let templist = [...tracks];
  //   setShowBracket(false);
  //   clearCommands();
  //   templist = seedBracket(templist);
  //   setTracks(templist);
  //   setShowBracket(true);
  // }, [seedingMethod]);

  // useEffect(() => {
  //   if (artist.id) {
  //     setShowBracket(false);
  //     clearCommands();
  //     getTracks(artist);
  //   }
  // }, [limit]);

  useEffect(() => {
    console.log(bracket);
  }, [bracket]);

  function share() {
    shareBracket("bracket", artist.name);
  }

  return (
    <Layout noChanges={noChanges}>
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
                  <option value="128">128</option>
                  <option value="256">256</option>
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
          : !editable ? <button onClick={() => { }} className="border-l-gray-200 hover:disabled:border-l-gray-200">Fill out this bracket</button> : <div>Bracket Complete</div>}
        <hr />
        <div>
          <LoadingIndicator hidden={showBracket} loadingText={loadingText} />
          <div hidden={!showBracket || !artist.name}>
            <div className="inline-flex flex-col justify-center">
              <div>
                <span className="font-bold">{tracks.length} tracks displayed</span>
              </div>
              <div className="inline-flex items-center text-xs -space-x-px rounded-md">
                <GeneratePlaylistButton tracks={tracks} artist={artist} />
                <button
                  onClick={undo}
                  hidden={commands.length === 0}
                  className="border-l-gray-200 hover:disabled:border-x-gray-200"
                >
                  Undo
                </button>
                <button onClick={saveBracket} className="border-l-gray-200 hover:disabled:border-l-gray-200">Save</button>
                {/* <button onClick={share} hidden={!bracketComplete} className="border-l-gray-200 hover:disabled:border-l-gray-200">
                  Download Bracket
                </button> */}
              </div>
            </div>
          </div>
          <Bracket bracket={bracket} setBracket={setBracket} tracks={tracks} setShowBracket={setShowBracket} showBracket={showBracket} saveCommand={saveCommand} playbackEnabled={playbackEnabled} bracketComplete={bracketComplete} setBracketComplete={setBracketComplete} />
        </div>
      </div>
    </Layout>
  )
}

export default App
