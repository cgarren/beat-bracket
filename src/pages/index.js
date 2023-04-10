import React from "react"
import Clicky from "../components/Clicky";
import LandingLetter from "../components/LandingLetter";
import LoginButton from "../components/LoginButton";
import Footer from "../components/Footer";

const App = () => {

  return (
    <>
      <Clicky />
      <main className="h-screen bg-zinc-300">
        {/* <nav className="absolute w-full z-50 p-2 bg-black"></nav> */}
        <div className="flex flex-col justify-center items-center h-5/6">
          <div className="inline-flex flex-col justify-center items-center text-center">
            <LandingLetter letter={"Beat Bracket"} animation={"animate-flipy"} />
            <div className="mb-0.5 text-black font-bar font-bold text-xl">Make interactive music brackets for your favorite artists!</div>
            <span className="mt-1.5"><LoginButton /></span>
            <p className="text-sm text-gray-500">A Spotify account is required to create and save brackets</p>
          </div>
        </div>
        <Footer heightClass="h-1/6" />
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
