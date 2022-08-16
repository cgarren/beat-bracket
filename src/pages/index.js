import React, {useEffect, useState} from "react"
import Bracket from "../components/Bracket"
import SearchBar from "../components/SearchBar";
import Mousetrap from "mousetrap";
import { loadRequest, nearestLesserPowerOf2, popularitySort, shuffleArray, switchEveryOther } from "../utilities/helpers";
import Layout from "../components/Layout";

// TODO: Fix byes
// TODO: -----> Implement saving the bracket with every change linked to a users spotify account and stored in a db somewhere. Maybe a landing page where users can see their past brackets?
// TODO: -----> Add a way to add songs to queue
// TODO: Make the final bracket shareable with a link
// TODO: Make bracket loading prettier
// TODO: Make loading track data calls efficient (able to request a max of 50 ids at once) ***
// TODO: Once a column is finished zoom/scale the bracket to make it easier to do the next column
// TODO: Add explainer text as to why we used 'Coliseum' over 'Colosseum'
// TODO: Full Mobile support
// TODO: Display seed number/popularity in badge on each song button with toggle to hide it
// TODO: Add metrics on generation like - number of songs, seconds it took to make, number from albums vs singles, etc...
// TODO: Make the bracket from a spotify playlist ***
// TODO: Make it possible to see the whole song name
// TODO: Only let one song preview play at a time
// TODO: Break into smaller components
// TODO: Use spotify metrics to filter (only kanye's slow songs, danceable songs, etc...)
// TODO: Move todos to separate file, maybe readme?
// TODO: Get domain and settle on site name

// markup
const App = () => {
  const [tracks, setTracks] = useState([]);
  const [artist, setArtist] = useState({ "name": undefined, "id": undefined });
  const [showBracket, setshowBracket] = useState(true);
  const [commands, setCommands] = useState([]);
  const [limit, setLimit] = useState(64);
  const [seedingMethod, setSeedingMethod] = useState("popularity");
  const [playbackEnabled, setPlaybackEnabled] = useState(false);

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
    setshowBracket(false);
    setCommands([]);
    templist = seedBracket(templist);
    setTracks(templist);
    setshowBracket(true);
  }, [seedingMethod]);

  useEffect(() => {
    if (artist.id) {
      setshowBracket(false);
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

  async function loadTrackData(songs) {
    let templist = [];
    for (let ids of Object.values(songs)) {
      const url = "https://api.spotify.com/v1/tracks?ids=" + ids.join();
      const response = await loadRequest(url);
      if (!response["error"] && response.tracks.length > 0) {
        let highestPop = 0;
        let selectedTrack = null;
        for (let track of response.tracks) {
          if (track.popularity >= highestPop) {
            selectedTrack = track;
            highestPop = track.popularity;
          }
        };
        const trackObject = {
          name: selectedTrack.name,
          art: selectedTrack.album.images[2].url,
          id: selectedTrack.id,
          popularity: selectedTrack.popularity,
          preview_url: selectedTrack.preview_url
        }
        templist.push(trackObject);
      }
    }
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
    let songs = await loadAlbums("https://api.spotify.com/v1/artists/" + artist.id + "/albums?include_groups=album,single&limit=20");
    //console.log(songs);
    // load data for the songs
    let templist = await loadTrackData(songs);
    // if the artist has less than 8 songs, stop
    if (templist.length >= 8) {
      // sort the list by popularity
      templist.sort(popularitySort);
      const power = nearestLesserPowerOf2(templist.length);
      // limit the list length to the nearest lesser power of 2 (for now)
      templist = templist.slice(0, (limit < power ? limit : power));
      seedBracket(templist);
      console.log(templist);
      setTracks(templist);
    } else {
      alert(artist.name + " doesn't have enough songs on Spotify!")
      setTracks([]);
      setArtist({ "name": undefined, "id": undefined });
    }
    setshowBracket(true);
  }

  useEffect(() => {
    if (artist.id) {
      setshowBracket(false);
      setCommands([]);
      getTracks();
    }
  }, [artist]);

  return (
    <Layout>
      <SearchBar setArtist={setArtist} noChanges={noChanges} disabled={!showBracket}/>
      <div className={""}>
        <label htmlFor="limit-select">Maximum tracks: </label>
        <select name="limit" id="limit-select" value={limit} onChange={limitChange} disabled={!showBracket}>
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
        <select name="seeding" id="seeding-select" value={seedingMethod} onChange={seedingChange} disabled={!showBracket}>
          <option value="random">Random</option>
          <option value="popularity">Popularity</option>
        </select>
      </div>
        <div className={""}>
          <label htmlFor="playback-select">Hover preview (beta): </label>
          <input type="checkbox" id="playback-select" checked={playbackEnabled} onChange={playbackChange} disabled={!showBracket} name="playback-select"></input> 
        </div>
      <hr />
      <div>
        {commands.length !== 0 ? <div><button onClick={undo}>Undo</button><br /></div> : <div></div>}
        <Bracket tracks={tracks} loadReady={showBracket} saveCommand={saveCommand} artist={artist} playbackEnabled={playbackEnabled} />
      </div>
    </Layout>
  )
}

export default App
