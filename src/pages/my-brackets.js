import React, { useEffect, useState } from "react"
import Layout from "../components/Layout";
import ArtistBracketCard from "../components/ArtistBracketCard";
import Tab from "../components/Tab";
import CreateBracketCard from "../components/CreateBracketCard";
import { getBrackets, authenticate } from "../utilities/backend";
import { getUserInfo } from "../utilities/spotify";
import { navigate } from "gatsby";

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

  useEffect(() => {
    getUserInfo().then((userInfo) => {
      authenticate(userInfo.id).then((success) => {
        if (success !== 1) {
          getBrackets(userInfo.id).then((loadedBrackets) => {
            if (loadedBrackets !== 1) {
              console.log(loadedBrackets);
              setCurrentUserId(userInfo.id);
              setBrackets(loadedBrackets);
              setShownBrackets(loadedBrackets);
            } else {
              console.log("Error loading brackets");
              // show notification
            }
          });
        } else {
          console.log("Error authenticating");
          // show notification
          navigate("/");
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
