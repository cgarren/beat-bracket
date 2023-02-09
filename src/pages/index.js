import React from "react"
import Clicky from "../components/Clicky";
import LandingLetter from "../components/LandingLetter";
import LoginButton from "../components/LoginButton";

const App = () => {

  return (
    <>
      <Clicky />
      <main className="h-screen bg-zinc-300">
        <nav className="absolute w-full z-50 p-2 bg-black"></nav>
        <div className="flex flex-col justify-center items-center h-full">
          <div className="inline-flex flex-col justify-center items-center">
            <div className="relative">
              <LandingLetter letter={"B"} animation={"animate-flipy"} />
              <LandingLetter letter={"e"} animation={"animate-flipx"} />
              <LandingLetter letter={"a"} animation={"animate-flipy"} />
              <LandingLetter letter={"t"} animation={"animate-flipx"} />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <LandingLetter letter={"B"} animation={"animate-flipy"} />
              <LandingLetter letter={"r"} animation={"animate-flipx"} />
              <LandingLetter letter={"a"} animation={"animate-flipy"} />
              <LandingLetter letter={"c"} animation={"animate-flipx"} />
              <LandingLetter letter={"k"} animation={"animate-flipy"} />
              <LandingLetter letter={"e"} animation={"animate-flipx"} />
              <LandingLetter letter={"t"} animation={"animate-flipy"} />
            </div>
            {/* <div className="mb-0.5 text-black font-bar font-bold text-xl">THE song bracket maker</div> */}
            <span className="mt-1.5"><LoginButton /></span>
          </div>
        </div>
      </main>
    </>
  )
}

export default App

export function Head() {
  return (
    <title>Beat Bracket</title>
  )
}
