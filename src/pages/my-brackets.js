import React, { useEffect, useState, useMemo, useContext } from "react"
import Layout from "../components/Layout";
import ArtistBracketCard from "../components/BracketCard/ArtistBracketCard";
import Tab from "../components/Tab";
import CreateBracketCard from "../components/BracketCard/CreateBracketCard";
import Alert from "../components/Alert";
import { getBrackets, getMaxBrackets } from "../utilities/backend";
import { getUserId, loginCallback } from "../utilities/authentication";
import { navigate } from "gatsby";
import { Seo } from "../components/SEO";
import { LoginContext } from "../context/LoginContext";

import cx from "classnames";

// markup
const App = ({ location }) => {
  const maxBrackets = getMaxBrackets();
  const [brackets, setBrackets] = useState([
    { id: 1, userId: undefined, artistName: undefined, artistId: undefined, tracks: undefined, completed: false },
  ]);
  const [activeTab, setActiveTab] = useState(0);
  const currentUserId = getUserId()
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
  const { setLoggedIn } = useContext(LoginContext);

  //scroll to top of window on page load
  useEffect(() => window.scrollTo(0, 0), []);

  async function processLogin() {
    //const params = await getParamsFromURL(window.location.pathname)
    const urlParams = new URLSearchParams(window.location.search);
    window.history.replaceState({}, document.title, window.location.pathname);

    // check to see if the user just logged in
    try {
      return await loginCallback(urlParams, setLoggedIn);
    } catch (e) {
      // if there's an error, redirect to home page
      console.log("Error authenticating:", e);
      setError(true);
      // show notification
      showAlert("Error authenticating", "error", false);
      // redirect to home page
      //navigate("/");
      return;
    }
  }

  useEffect(() => {
    processLogin().then(loginResult => {
      if (loginResult) {
        getBrackets().then((loadedBrackets) => {
          if (loadedBrackets !== 1) {
            console.log(loadedBrackets);
            setBrackets(loadedBrackets);
          } else {
            console.log("Error loading brackets");
            showAlert("Error loading brackets, try logging in again", "error", false);
            setError(true);
          }
        });
      } else {
        console.log("going back to home page");
        navigate("/");
      }
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
    <Layout noChanges={() => { return true }} path={location.pathname}>
      <Alert show={alertInfo.show} close={closeAlert} message={alertInfo.message} type={alertInfo.type} />
      <div className="text-center" hidden={error}>
        <h1 className="text-4xl font-extrabold font-display">My Brackets</h1>
        {currentUserId && maxBrackets ? <p className="text-sm text-gray-600 mb-2">{brackets.length + "/" + maxBrackets + " brackets used"}</p> : null}

        <div className="">
          <nav className="inline-flex flex-row">
            <Tab id={0} activeTab={activeTab} setActiveTab={setActiveTab} text="All" />
            <Tab id={1} activeTab={activeTab} setActiveTab={setActiveTab} text="In Progess" />
            <Tab id={2} activeTab={activeTab} setActiveTab={setActiveTab} text="Completed" />
          </nav>
        </div>
        {/* <div className="pt-3 flex flex-row flex-wrap justify-center">
          {activeTab === 0 && maxBrackets && brackets.length < maxBrackets && currentUserId ? <CreateBracketCard userId={currentUserId} /> : null}
          {shownBrackets.map((bracket) => (
            <ArtistBracketCard bracket={bracket} key={bracket.id} userId={currentUserId} />
          ))}
        </div> */}
        <div className={cx("pt-3 items-stretch sm:mx-5 gap-5", { "inline-grid grid-cols-3": brackets.length >= 3 }, { "flex flex-row flex-wrap justify-center": brackets.length < 3 })}>
          {activeTab === 0 && maxBrackets && brackets.length < maxBrackets && currentUserId ? <CreateBracketCard userId={currentUserId} /> : null}
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
    <Seo title="My brackets" />
  )
}