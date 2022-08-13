import React, {useEffect, useState} from "react"
import Bracket from "../components/Bracket"
import SearchBar from "../components/SearchBar";
import Mousetrap from "mousetrap";
import { loadRequest, nearestLesserPowerOf2, popularitySort, shuffleArray, switchEveryOther } from "../utilities/helpers";
import Layout from "../components/Layout";

// TODO: Fix byes
// TODO: Add a way to authenticate and add songs to queue
// TODO: -----> Implement saving the bracket with every change linked to a users spotify account and stored in a db somewhere. Maybe a landing page where users can see their past brackets?
// TODO: -----> Make songs playable when hovered over ***
// TODO: -----> Take site live ***
// TODOL -----> Generate a playlist with the tracks ***
// TODO: Make the final bracket shareable ***
// TODO: Make bracket loading prettier
// TODO: Make loading track data calls efficient (able to request a max of 50 ids at once) ***
// TODO: Once a column is finished zoom/scale the bracket to make it easier to do the next column
// TODO: Add explainer text as to why we used 'Coliseum' over 'Colosseum'
// TODO: Mobile support
// TODO: Display seed number/popularity in badge on each song button with toggle to hide it
// TODO: Add metrics on generation like - number of songs, seconds it took to make, number from albums vs singles, etc...
// TODO: Make the bracket from a spotify playlist

// markup
const App = () => {
  const [tracks, setTracks] = useState([]);
  const [artist, setArtist] = useState({ "name": undefined, "id": undefined });
  const [showBracket, setshowBracket] = useState(true);
  const [commands, setCommands] = useState([]);
  const [limit, setLimit] = useState(64);
  const [seedingMethod, setSeedingMethod] = useState("popularity");

  function limitChange(e) {
    setLimit(parseInt(e.target.value));
  }

  function seedingChange(e) {
    if (noChanges()) {
      setSeedingMethod(e.target.value);
    }
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

  Mousetrap.bind("mod+z", undo);

  useEffect(() => {
    let templist = [...tracks];
    setshowBracket(false);
    setCommands([]);
    templist = seedBracket(templist);
    setTracks(templist);
    setshowBracket(true);
  }, [seedingMethod]);

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
          popularity: selectedTrack.popularity
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

  useEffect(() => {
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
        <select name="limit" id="limit-select" defaultValue="64" onChange={limitChange} disabled={!showBracket}>
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
      <hr />
      <div>
        {commands.length !== 0 ? <div><button onClick={undo}>Undo</button><br /></div> : <div></div>}
        <Bracket tracks={tracks} loadReady={showBracket} saveCommand={saveCommand} artist={artist} />
      </div>
    </Layout>
  )
}

export default App
