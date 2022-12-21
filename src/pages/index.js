import React, { useEffect, useState } from "react"
import LoginButton from "../components/LoginButton";

// markup
const App = () => {

  return (
    <div className="block text-center">
      <div>Welcome to Beat Bracket! Click below to login with Spotify</div>
      <LoginButton />
    </div>
  )
}

export default App
