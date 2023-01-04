import React, { useEffect, useState } from "react"
import Layout from "../components/Layout";
import ArtistBracketCard from "../components/ArtistBracketCard";
import Tab from "../components/Tab";
import CreateBracketCard from "../components/CreateBracketCard";
import { getBrackets, authenticate } from "../utilities/backend";
import { getUserInfo } from "../utilities/spotify";
import { navigate } from "gatsby";
import { getParamsFromURL } from "../utilities/helpers";

// markup
const App = () => {
  const [brackets, setBrackets] = useState([
    { id: 1, userId: undefined, artistName: undefined, artistId: undefined, tracks: undefined, completed: false },
  ]);
  const [shownBrackets, setShownBrackets] = useState(brackets);
  const [activeTab, setActiveTab] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(undefined);
  const maxBrackets = 10;

  useEffect(() => {
    setShownBrackets(brackets.filter((bracket) => {
      if (activeTab === 0) return true;
      if (activeTab === 1) return !bracket.completed;
      if (activeTab === 2) return bracket.completed;
      return true;
    }));
  }, [activeTab, brackets]);

  async function processLogin() {
    const params = await getParamsFromURL(window.location.pathname)
    // check to see if the user just logged in
    if (params && Object.keys(params).length > 0) {
      // make sure the state matches
      if (
        params.state === sessionStorage.getItem("spotify_auth_state") &&
        params.access_token &&
        params.expires_at
      ) {
        sessionStorage.setItem("accessToken", params.access_token);
        sessionStorage.setItem("expireTime", params.expires_at);
        // get user info in order to authenticate with backend
        const userInfo = await getUserInfo();
        if (userInfo !== 1) {
          // authenticate with backend
          console.log(userInfo);
          const success = await authenticate(
            userInfo.id,
            params.state,
            params.expires_at,
            params.access_token
          );
          // if there's an error, redirect to home page
          if (success === 1) {
            console.log("Error authenticating");
            // show notification
            navigate("/");
            return;
          } else {
            // set sessionId
            sessionStorage.setItem("sessionId", params.state);
            // set userId
            sessionStorage.setItem("userId", userInfo.id);
            // remove spotify auth state
            sessionStorage.removeItem("spotify_auth_state");
          }
        }
      }
    }
  }

  useEffect(() => {
    processLogin().then(() => {
      setCurrentUserId(sessionStorage.getItem("userId"));
      getBrackets().then((loadedBrackets) => {
        if (loadedBrackets !== 1) {
          console.log(loadedBrackets);
          setBrackets(loadedBrackets);
          setShownBrackets(loadedBrackets);
        } else {
          console.log("Error loading brackets");
          // show notification
        }
      });
    });
  }, []);

  return (
    <Layout noChanges={() => { return true }}>
      <div className="text-center">
        <h1 className="text-4xl font-extrabold">My Brackets</h1>
        {currentUserId ? <p className="text-sm text-gray-500 mb-2">{brackets.length + "/" + maxBrackets + " brackets used"}</p> : null}

        <div className="">
          <nav className="inline-flex flex-col sm:flex-row">
            <Tab id={0} activeTab={activeTab} setActiveTab={setActiveTab} text="All" />
            <Tab id={1} activeTab={activeTab} setActiveTab={setActiveTab} text="In Progess" />
            <Tab id={2} activeTab={activeTab} setActiveTab={setActiveTab} text="Completed" />
          </nav>
        </div>
        <div className="pt-3 flex flex-row flex-wrap justify-center items-stretch gap-5 overflow-scroll mx-5">
          {activeTab === 0 && brackets.length < maxBrackets && currentUserId ? <CreateBracketCard userId={currentUserId} /> : null}
          {shownBrackets.map((bracket) => (
            <ArtistBracketCard bracket={bracket} key={bracket.id} userId={currentUserId} />
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default App

export function Head() {
  return (
    <title>Beat Bracket</title>
  )
}
