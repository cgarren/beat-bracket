import React, {useEffect, useState} from "react"
import Bracket from "../components/Bracket"
import SearchBar from "../components/SearchBar";
import { loadRequest, popularitySort, removeDuplicatesWithKey } from "../utilities/helpers";

// styles
const pageStyles = {
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
}

// markup
const IndexPage = () => {
  const [tracks, setTracks] = useState([]);
  const [artistId, setArtistId] = useState(null);
  const [artist, setArtist] = useState(null);

  function genTracks() {
    let generatedTracks = Array.from(
      { length: 128 },
      () => ({name: "Song " + Math.floor(Math.random() * 128) })
    )
    console.log(generatedTracks);
    setTracks(generatedTracks);
  }

  async function loadTracks(url, duplicatelist) {
    let response = await loadRequest(url);
    console.log(response);
    let templist = new Array();
    if (!response["error"] && response.albums.length > 0) {
      response.albums.map((album) => {
        if (album.images.length > 0) {
          album.tracks.items.map((track) => {
            if (!duplicatelist.includes(track.name)) {
              const trackObject = {
                name: track.name,
                art: album.images[2].url,
                id: track.id,
                popularity: track.popularity
              }
              templist.push(trackObject);
              duplicatelist.push(track.name);
            }
          })
        }
      });
    }
    return templist;
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
      console.log(duplicatelist);
      templist = res;
    } else {
      // sort the list by popularity and cut it to a certain size
      // templist.sort(popularitySort)
      templist = templist.slice(0, 128)
      console.log("setting", templist);
      setTracks(templist);
      return Promise.resolve(templist);
    }
  }

  useEffect(() => {
    async function getTracks() {
      setArtist("something");
      await loadAlbums("https://api.spotify.com/v1/artists/" + artistId + "/albums?include_groups=album,single&limit=20");
      console.log("hey");
    }
    if (artistId) {
      getTracks();
    }
  }, [artistId]);

  return (
    <main style={pageStyles}>
      <title>Song Coliseum</title>
      <h1>
        Song Coliseum {(artist ? "- " + artist : "")}
      </h1>
      <button onClick={genTracks}>Fill</button>
      <SearchBar setArtistId={setArtistId}/>
      <div>
        <Bracket tracks={tracks} />
      </div>
    </main>
  )
}

export default IndexPage
