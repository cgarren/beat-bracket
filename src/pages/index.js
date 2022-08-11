import React, {useEffect, useState} from "react"
import Bracket from "../components/Bracket"
import SearchBar from "../components/SearchBar";
import { loadRequest, popularitySort } from "../utilities/helpers";

// TODO: Fix byes (but first restrict the number of songs)
// TODO: Add undo functionality
// TODO: Make songs playable when hovered over
// TODO: Add a way to authenticate and add songs to queue
// TODO: -----> Implement saving the bracket with every change linked to a users spotify account and stored in a db somewhere. Maybe a landing page where users can see their past brackets?
// TODO: Make the final bracket shareable
// TODO: Make search prettier
// TODO: Make bracket loading better
// TODO: Make loading track data calls efficient (able to request a max of 50 ids at once)
// TODO: Once a column is finished zoom/scale the bracket to make it easier to do the next column
// TODO: Add explainer text as to why we used 'Coliseum' over 'Colosseum'

// styles
const pageStyles = {
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
}

// markup
const IndexPage = () => {
  const [tracks, setTracks] = useState([]);
  const [artist, setArtist] = useState({ "name": undefined, "id": undefined });
  const [showBracket, setshowBracket] = useState(false);

  async function loadTrackData(songs) {
    let templist = [];
    for (let ids of Object.values(songs)) {
      const url = "https://api.spotify.com/v1/tracks?ids=" + ids.join();
      const response = await loadRequest(url);
      //console.log(response);
      if (!response["error"]) {
        let highestPop = 0;
        let selectedTrack = null;
        for (let track of response.tracks) {
          if (track.popularity > highestPop) {
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
      response.albums.map((album) => {
        if (album.images.length > 0) {
          // Iterate through the tracks
          album.tracks.items.map((track) => {
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
      response.items.map((item) => {
        albumIds.push(item.id);
      });
      let tracksurl =
        "https://api.spotify.com/v1/albums?ids=" + albumIds.join();
      loadTracks(tracksurl, songs); // saves 
    }
    if (response.next) {
      await loadAlbums(response.next, songs);
    }
    return songs;
  }

  useEffect(() => {
    async function getTracks() {
      let songs = await loadAlbums("https://api.spotify.com/v1/artists/" + artist.id + "/albums?include_groups=album,single&limit=20");
      console.log(songs);
      // load data for the songs
      let templist = await loadTrackData(songs);
      console.log(templist);
      // sort the list by popularity and cut it to a certain size
      templist.sort(popularitySort);
      console.log(templist);
      //await new Promise(resolve => setTimeout(() => { }, 5000));
      // limit the list to 128 songs
      templist = templist.slice(0, 128);
      // seed the list by popularity
      for (let i = 1; i < templist.length / 2; i+=2) {
        if (i % 2 !== 0) {
          console.log("switching", templist[templist.length - i].name, "AND", templist[i].name);
          let temp = templist[i];
          templist[i] = templist[templist.length - i];
          templist[templist.length - i] = temp;
        }
      }
      console.log("setting", templist);
      setTracks(templist);
      setshowBracket(true);
    }
    if (artist.id) {
      getTracks();
    }
  }, [artist]);

  return (
    <main style={pageStyles}>
      <title>Song Coliseum</title>
      <h1>
        Song Coliseum {(artist.name ? "- " + artist.name : "")}
      </h1>
      <SearchBar setArtist={setArtist}/>
      <div>
        <Bracket tracks={tracks} show={showBracket} />
      </div>
    </main>
  )
}

export default IndexPage
