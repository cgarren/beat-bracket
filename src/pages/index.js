import React from "react"
import LoginButton from "../components/LoginButton";

// markup
const App = () => {

  return (

    <main className="flex flex-col items-center justify-center h-screen bg-zinc-300">
      <div className="inline-flex flex-col justify-center items-center">
        <div className="font-bold font-display text-8xl text-black">Beat Bracket</div>
        {/* <div className="text-black">THE song bracket maker</div> */}
        <LoginButton />
      </div>
    </main>
  )
}

export default App

export function Head() {
  return (
    <title>Beat Bracket</title>
  )
}
