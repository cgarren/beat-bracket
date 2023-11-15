import React, { useEffect, useContext } from "react"
import Clicky from "../components/Clicky";
import LoginButton from "../components/LoginButton";
import FooterText from "../components/FooterText";
import { Seo } from "../components/SEO";
import { navigate } from "gatsby";
import { LoginContext } from "../context/LoginContext";
import LoadingIndicator from "../components/LoadingIndicator";
import { MixpanelContext } from "../context/MixpanelContext";

const App = ({ location }) => {
  const { loggedIn, loginInProgress } = useContext(LoginContext);
  const mixpanel = useContext(MixpanelContext);
  //scroll to top of window on page load
  useEffect(() => window.scrollTo(0, 0), []);
  useEffect(() => {
    if (loggedIn && !loginInProgress) {
      navigate("/my-brackets");
    }
  }, [loggedIn, loginInProgress]);

  // Runs once, after page load
  useEffect(() => {
    console.debug("Tracked page load", "/");
    mixpanel.track_pageview();
  }, [mixpanel]);

  return (
    <>
      <Clicky />
      <main className="h-screen bg-gradient-radial from-zinc-100 from-60% to-zinc-400 relative">
        {loginInProgress || loggedIn ?
          <div className="flex flex-row justify-center items-center h-full px-4 sm:w-9/12 m-auto">
            <h3 className="text-xl text-black"><LoadingIndicator /> Logging in...</h3>
          </div> :
          <>
            <nav className="absolute w-full z-50 p-2 bg-transparent text-center">
              {/* <img className="inline-block h-16 mr-2" src={logo} alt="Beat Bracket Logo" /> */}
              <h1 className="inline-block mb-0.5 font-bold font-display sm:text-2xl text-xl text-black">Beat Bracket</h1>
            </nav>
            <div className="flex flex-col justify-center items-center h-full px-4 sm:w-9/12 m-auto">
              <div className="inline-flex flex-col justify-center items-center text-center">
                <h2 className="mb-0.5 text-black font-bar font-bold sm:text-7xl text-6xl">Make music brackets for artists and playlists.</h2>
                <h3 className="text-xl text-black">It's easy to generate, customize, fill, and share your bracket! All you need is a free Spotify account.</h3>
                <span className="mt-1.5"><LoginButton /></span>
                {/* <p className="text-sm text-gray-600">You need a free Spotify account to use this site. <a href>Why?</a></p> */}
              </div>
            </div>
          </>
        }
        <div className="absolute bottom-0 w-full text-black p-2">
          <FooterText whiteText={false} />
        </div>
      </main>
    </>
  )
}

export default App

export function Head() {
  return (
    <Seo title="Login with Spotify">
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
