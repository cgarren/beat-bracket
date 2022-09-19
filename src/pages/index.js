import React, {useEffect, useState} from "react"
import Bracket from "../components/Bracket"
import SearchBar from "../components/SearchBar";
import Mousetrap from "mousetrap";
import { loadRequest, nearestLesserPowerOf2, popularitySort, shuffleArray, switchEveryOther, shareBracket } from "../utilities/helpers";
import Layout from "../components/Layout";
import LoadingIndicator from "../components/LoadingIndicator";
import GeneratePlaylistButton from "../components/GeneratePlaylistButton";

// markup
const App = () => {
  const [tracks, setTracks] = useState([]);
  const [artist, setArtist] = useState({ "name": undefined, "id": undefined });
  const [showBracket, setShowBracket] = useState(true);
  const [commands, setCommands] = useState([]);
  const [limit, setLimit] = useState(64);
  const [seedingMethod, setSeedingMethod] = useState("popularity");
  const [playbackEnabled, setPlaybackEnabled] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
  const [bracketComplete, setBracketComplete] = useState(false);

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
      if (window.confirm("You have bracket changes that will be lost! Proceed anyways?")) {
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
  }

  if (Mousetrap.bind) {
    Mousetrap.bind("mod+z", undo);
  }

  useEffect(() => {
    let templist = [...tracks];
    setShowBracket(false);
    setCommands([]);
    templist = seedBracket(templist);
    setTracks(templist);
    setShowBracket(true);
  }, [seedingMethod]);

  useEffect(() => {
    if (artist.id) {
      setShowBracket(false);
      setCommands([]);
      getTracks();
    }
  }, [limit]);

  function seedBracket(trackList) {
    switch (seedingMethod) {
      case "random":
        return shuffleArray(trackList);
      case "popularity":
        trackList.sort(popularitySort);
        return switchEveryOther(trackList);
      default:
        return trackList;
    }
  }

  async function selectTrackVersion(numTracks, tracks) {
    let highestPop = 0;
    let selectedTrack = null;
    for (let i = 0; i < numTracks; i++) {
      const track = tracks.shift();
      if (track.popularity >= highestPop) {
        selectedTrack = track;
        highestPop = track.popularity;
      }
    }
    return selectedTrack;
  }

  async function makeTrackObject(track) {
    return {
      name: track.name,
      art: track.album.images[2].url,
      id: track.id,
      popularity: track.popularity,
      preview_url: track.preview_url
    }
  }

  async function loadTrackData(idList, trackOptionsAmounts) {
    let templist = [];
    if (idList.length !== 0) {
      const url = "https://api.spotify.com/v1/tracks?ids=" + idList.join();
      const response = await loadRequest(url);
      if (!response["error"] && response.tracks.length > 0) {
        for (let numTracks of trackOptionsAmounts) {
          //console.log(numTracks, response.tracks.length, idList);
          const selectedTrack = await selectTrackVersion(numTracks, response.tracks)
          templist.push(await makeTrackObject(selectedTrack));
        }
      }
    }
    return templist;
  }

  async function processTracks(songs) {
    let templist = [];
    let runningList = [];
    let trackOptionsAmounts = [];
    for (const idList of Object.values(songs)) {
      if (runningList.length + idList.length > 50) {
        templist.push(...await loadTrackData(runningList, trackOptionsAmounts));
        runningList = [];
        trackOptionsAmounts = [];
      }
      runningList.push(...idList);
      trackOptionsAmounts.push(idList.length);
    }
    templist.push(...await loadTrackData(runningList, trackOptionsAmounts));
    return templist;
  }

  async function loadTracks(url, songs) {
    let response = await loadRequest(url);
    if (!response["error"] && response.albums.length > 0) {
      response.albums.forEach((album) => {
        if (album.images.length > 0) {
          // Iterate through the tracks
          album.tracks.items.forEach((track) => {
            // Check if the track already exists
            if (track.name in songs) {
              songs[track.name].push(track.id);
            } else {
              songs[track.name] = [track.id];
            }
          })
        }
      });
    }
  }
  
  async function loadAlbums(url, songs = {}) {
    let response = await loadRequest(url);
    //console.log(response);
    if (!response["error"] && response.items.length > 0) {
      let albumIds = [];
      response.items.forEach((item) => {
        albumIds.push(item.id);
      });
      let tracksurl =
        "https://api.spotify.com/v1/albums?ids=" + albumIds.join();
      await loadTracks(tracksurl, songs); // saves 
    }
    if (response.next) {
      await loadAlbums(response.next, songs);
    }
    return songs;
  }

  async function getTracks() {
    setLoadingText("Gathering Spotify tracks for " + artist.name + "...");
    let songs = await loadAlbums("https://api.spotify.com/v1/artists/" + artist.id + "/albums?include_groups=album,single&limit=20");
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
      templist = seedBracket(templist.slice(0, (limit < power ? limit : power)));
      //console.table(templist);
      setTracks(templist);
    } else {
      alert(artist.name + " doesn't have enough songs on Spotify!")
      setTracks([]);
      setArtist({ "name": undefined, "id": undefined });
    }
    setLoadingText("Generating bracket...");
  }

  useEffect(() => {
    if (artist.id) {
      setShowBracket(false);
      setCommands([]);
      getTracks();
    }
  }, [artist]);

  function share() {
    shareBracket("bracket", artist.name);
  }

  return (
    <Layout>
      <div className="text-center">
      <div className="inline-flex flex-col gap-1 max-w-[800px] items-center">
        <div className="font-bold mb-2">Create a bracket with songs from your favorite artists on Spotify!</div>
        <SearchBar setArtist={setArtist} noChanges={noChanges} disabled={!showBracket} />
        <div className="border border-black rounded-lg p-2 mb-1 flex flex-col">
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
      <hr />
      <div>
          <LoadingIndicator hidden={showBracket} loadingText={loadingText} />
          <div hidden={!showBracket || !artist.name}>
            <div className="inline-flex flex-col justify-center">
              <span className="font-bold">
              {artist.name ? "Bracket for: " + artist.name : ""}
              </span>
              <div>
                <span className="font-bold">{tracks.length} tracks displayed</span>
              </div>
              <div className="inline-flex items-center text-xs -space-x-px rounded-md">
                <GeneratePlaylistButton tracks={tracks} artist={artist}/>
                <button onClick={undo} hidden={commands.length <= 0} className="border-l-gray-200 hover:disabled:border-x-gray-200">Undo</button>
                <button onClick={share} hidden={!bracketComplete} className="border-l-gray-200 hover:disabled:border-l-gray-200">
                  Download Bracket
                </button>
              </div>
            </div>
          </div>
          <Bracket tracks={tracks} setShowBracket={setShowBracket} showBracket={showBracket} saveCommand={saveCommand} playbackEnabled={playbackEnabled} bracketComplete={bracketComplete} setBracketComplete={setBracketComplete} />
        </div>
      </div>
    </Layout>
  )
}

export default App
