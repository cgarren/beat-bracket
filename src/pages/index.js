import React, {useEffect, useState} from "react"
import Bracket from "../components/Bracket"

// styles
const pageStyles = {
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
}

// markup
const IndexPage = () => {
  const [tracks, setTracks] = useState([]);

  function genTracks() {
    setTracks(Array.from(
      { length: 16 },
      () => "Song " + Math.floor(Math.random() * 128)
    ));
  }

  return (
    <main style={pageStyles}>
      <title>Song Coliseum</title>
      <h1>
        Song Coliseum
      </h1>
      <button onClick={genTracks}>Fill</button>
      <div>
        <Bracket tracks={tracks} />
      </div>
    </main>
  )
}

export default IndexPage
