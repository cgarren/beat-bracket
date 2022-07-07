import * as React from "react"
import Bracket from "../components/Bracket"

// styles
const pageStyles = {
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
}

// markup
const IndexPage = () => {
  return (
    <main style={pageStyles}>
      <title>Song Coliseum</title>
      <h1>
        Song Coliseum
      </h1>
      <div>
        <Bracket/>
      </div>
    </main>
  )
}

export default IndexPage
