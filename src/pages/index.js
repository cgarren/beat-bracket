import React, {useEffect, useState} from "react"
import Bracket from "../components/Bracket"
import SearchBar from "../components/SearchBar";
import { loadRequest, popularitySort } from "../utilities/helpers";

// TODO: Fix byes (but first restrict the number of songs)
// TODO: Make songs playable when hovered over
// TODO: Add a way to authenticate and add songs to queue
// TODO: Make the final bracket shareable
// TODO: Make search prettier

// styles
const pageStyles = {
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
}

// markup
const IndexPage = () => {
  const [tracks, setTracks] = useState([]);
  const [artist, setArtist] = useState({ "name": undefined, "id": undefined });
  const [showBracket, setshowBracket] = useState(false);

  async function loadTrackData(ids) {
    const url = "https://api.spotify.com/v1/tracks?ids=" + ids.join();
    let response = await loadRequest(url);
    let templist = new Array();
    if (!response["error"] && response.tracks.length > 0) {
      response.tracks.map((track) => {
        const trackObject = {
          name: track.name,
          art: track.album.images[2].url,
          id: track.id,
          popularity: track.popularity
        }
        templist.push(trackObject);
      });
    }
    return templist;
  }

  async function loadTracks(url, duplicatelist) {
    let response = await loadRequest(url);
    let ids = [];
    if (!response["error"] && response.albums.length > 0) {
      response.albums.map((album) => {
        if (album.images.length > 0) {
          album.tracks.items.map((track) => {
            if (!duplicatelist.includes(track.name)) {
              ids.push(track.id)
              duplicatelist.push(track.name);
            }
          })
        }
      });
      let templist = new Array();
      let tempids = [];
      while (true) {
        tempids.push(ids.shift());
        if (tempids.length == 50) {
          let trackData = await loadTrackData(tempids);
          templist = templist.concat(trackData);
          tempids = [];
        }
        if (ids.length == 0) {
          break;
        }
      }
      return templist;
    }
    return [];
  }
  
  async function loadAlbums(url, templist=[], duplicatelist=[]) {
    let response = await loadRequest(url);
    //console.log(response);
    if (!response["error"] && response.items.length > 0) {
      let albumIds = [];
      response.items.map((item) => {
        albumIds.push(item.id);
      });
      let tracksurl =
      "https://api.spotify.com/v1/albums?ids=" + albumIds.join();
      templist = [...templist, ...await loadTracks(tracksurl, duplicatelist)];
    }
    if (response.next) {
      const res = await loadAlbums(response.next, templist, duplicatelist);
      templist = res;
    } else {
      // sort the list by popularity and cut it to a certain size
      templist.sort(popularitySort)
      // limit the list to 128 songs
      templist = templist.slice(0, 128)
      // seed the list by popularity
      for (let i = 1; i < templist.length / 2; i++) {
        if (i % 2 !== 0) {
          let temp = templist[i];
          templist[i] = templist[templist.length - i];
          console.log("switching", templist[templist.length - i].name, "AND", temp.name);
          templist[templist.length - i] = temp;
        }
      }
      //console.log("setting", templist);
      setTracks(templist);
      return templist;
    }
  }

  useEffect(() => {
    async function getTracks() {
      await loadAlbums("https://api.spotify.com/v1/artists/" + artist.id + "/albums?include_groups=album,single&limit=20");
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
