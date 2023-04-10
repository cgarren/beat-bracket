import React, { useEffect, useState, useMemo } from "react"
import Layout from "../components/Layout";
import ArtistBracketCard from "../components/BracketCard/ArtistBracketCard";
import Tab from "../components/Tab";
import CreateBracketCard from "../components/BracketCard/CreateBracketCard";
import Alert from "../components/Alert";
import { getBrackets, authenticate } from "../utilities/backend";
import { getUserInfo } from "../utilities/spotify";
import { navigate } from "gatsby";
import { getParamsFromURL } from "../utilities/helpers";
import { SEO } from "../components/SEO";

// markup
const App = () => {
  const maxBrackets = 10;
  const [brackets, setBrackets] = useState([
    { id: 1, userId: undefined, artistName: undefined, artistId: undefined, tracks: undefined, completed: false },
  ]);
  const [activeTab, setActiveTab] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(undefined);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: null, type: null, timeoutId: null });
  const [error, setError] = useState(false);
  const shownBrackets = useMemo(() => {
    console.log(brackets);
    return brackets.filter((bracket) => {
      if (activeTab === 0) return true;
      if (activeTab === 1) return !bracket.completed && !bracket.winner;
      if (activeTab === 2) return bracket.completed || bracket.winner;
      return true;
    })
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
            setError(true);
            // show notification
            showAlert("Error authenticating", "error", false);
            // redirect to home page
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
        } else {
          console.log("Error getting user info");
          setError(true);
          // show notification
          showAlert("Error getting user information", "error", false);
          return;
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
        } else {
          console.log("Error loading brackets");
          // show notification
          showAlert("Error loading brackets, try logging in again", "error", false);
          setError(true);
          navigate("/");
        }
      });
    });
  }, []);

  function showAlert(message, type = "info", timeout = true) {
    if (alertInfo.timeoutId) {
      clearTimeout(alertInfo.timeoutId);
    }
    let timeoutId = null;
    if (timeout) {
      timeoutId = setTimeout(() => {
        setAlertInfo({ show: false, message: null, type: null, timeoutId: null });
      }, 5000);
    }
    setAlertInfo({ show: true, message: message, type: type, timeoutId: timeoutId });
  }

  function closeAlert() {
    if (alertInfo.timeoutId) {
      clearTimeout(alertInfo.timeoutId);
    }
    setAlertInfo({ show: false, message: null, type: null, timeoutId: null });
  }

  return (
    <Layout noChanges={() => { return true }}>
      <Alert show={alertInfo.show} close={closeAlert} message={alertInfo.message} type={alertInfo.type} />
      <div className="text-center" hidden={error}>
        <h1 className="text-4xl font-extrabold font-display">My Brackets</h1>
        {currentUserId ? <p className="text-sm text-gray-500 mb-2">{brackets.length + "/" + maxBrackets + " brackets used"}</p> : null}

        <div className="">
          <nav className="inline-flex flex-row">
            <Tab id={0} activeTab={activeTab} setActiveTab={setActiveTab} text="All" />
            <Tab id={1} activeTab={activeTab} setActiveTab={setActiveTab} text="In Progess" />
            <Tab id={2} activeTab={activeTab} setActiveTab={setActiveTab} text="Completed" />
          </nav>
        </div>
        <div className="pt-3 flex flex-row flex-wrap justify-center items-stretch gap-5 sm:mx-5">
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
    <SEO title="Beat Bracket - My brackets" />
  )
}