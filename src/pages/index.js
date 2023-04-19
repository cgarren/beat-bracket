import React, { useEffect, useState } from "react"
import Clicky from "../components/Clicky";
import LoginButton from "../components/LoginButton";
import Footer from "../components/Footer";
import { Seo } from "../components/SEO";
import { checkSpotifyAuth } from "../utilities/helpers";

const App = ({ location }) => {
  const loggedIn = checkSpotifyAuth();
  //scroll to top of window on page load
  useEffect(() => window.scrollTo(0, 0), []);
  useEffect(() => {
    if (loggedIn) {
      window.location.href = "/my-brackets";
    }
  }, [loggedIn]);

  if (loggedIn) return <>Logging you in...</>;
  else
    return (
      <>
        <Clicky />
        <main className="h-screen bg-gradient-radial from-zinc-100 from-40% to-zinc-400">
          {/* <nav className="absolute w-full z-50 p-2 bg-black"></nav> */}
          <div className="flex flex-col justify-center items-center h-full px-4">
            <div className="inline-flex flex-col justify-center items-center text-center">
              <h1 className="inline-block mb-0.5 font-bold font-display sm:text-8xl text-7xl text-black ">Beat Bracket</h1>
              <h2 className="mb-0.5 text-black font-bar font-bold text-xl">Make interactive music brackets for your favorite artists!</h2>
              <span className="mt-1.5"><LoginButton /></span>
              {/* <p className="text-sm text-gray-600">A Spotify account is required to create and save brackets</p> */}
            </div>

          </div>
          <Footer heightClass="" path={location.pathname} />
        </main>
      </>
    )
}

export default App

export function Head() {
  return (
    <Seo>
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://www.beatbracket.com",
            "name": "Beat Bracket"
          }
        `}
      </script>
    </Seo>
  )
}
