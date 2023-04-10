import React from "react"
import Clicky from "../components/Clicky";
import LoginButton from "../components/LoginButton";
import Footer from "../components/Footer";
import { Seo } from "../components/SEO";

const App = () => {

  return (
    <>
      <Clicky />
      <main className="h-screen bg-zinc-300">
        {/* <nav className="absolute w-full z-50 p-2 bg-black"></nav> */}
        <div className="flex flex-col justify-center items-center h-5/6">
          <div className="inline-flex flex-col justify-center items-center text-center">
            <h1 className="inline-block mb-0.5 font-bold font-display text-8xl text-black ">Beat Bracket</h1>
            <h2 className="mb-0.5 text-black font-bar font-bold text-xl">Make interactive music brackets for your favorite artists!</h2>
            <span className="mt-1.5"><LoginButton /></span>
            <p className="text-sm text-gray-600">A Spotify account is required to create and save brackets</p>
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
    <Seo>
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://www.beatbracket.com",
            "name": "Beat Bracket",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+5-601-785-8543",
              "contactType": "Customer Support"
            }
          }
        `}
      </script>
    </Seo>
  )
}
