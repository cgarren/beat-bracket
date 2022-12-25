import React, { useEffect, useState } from "react"
import Layout from "../components/Layout";
import ArtistBracketCard from "../components/ArtistBracketCard";
import Tab from "../components/Tab";
import CreateBracketCard from "../components/CreateBracketCard";
import { getBrackets } from "../utilities/backend";
import { getUserInfo } from "../utilities/helpers";

// markup
const App = () => {
  const [brackets, setBrackets] = useState([
    { id: 1, userId: undefined, artistName: undefined, artistId: undefined, tracks: undefined, completed: false },
  ]);
  const [shownBrackets, setShownBrackets] = useState(brackets);
  const [activeTab, setActiveTab] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(undefined);

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
      setCurrentUserId(userInfo.id);
      getBrackets(userInfo.id).then((loadedBrackets) => {
        console.log(loadedBrackets);
        setBrackets(loadedBrackets);
        setShownBrackets(loadedBrackets);
      });
    });
  }, []);

  return (
    <Layout noChanges={() => { return true }}>
      <div className="text-center">
        <h1 className="text-4xl font-extrabold mb-2">My Brackets</h1>

        <div className="">
          <nav className="inline-flex flex-col sm:flex-row">
            <Tab id={0} activeTab={activeTab} setActiveTab={setActiveTab} text="All" />
            <Tab id={1} activeTab={activeTab} setActiveTab={setActiveTab} text="In Progess" />
            <Tab id={2} activeTab={activeTab} setActiveTab={setActiveTab} text="Completed" />
          </nav>
        </div>
        <div className="pt-3 flex flex-row flex-wrap justify-center items-stretch gap-5 overflow-scroll mx-5">
          {activeTab === 0 && brackets.length < 10 ? <CreateBracketCard userId={currentUserId} /> : null}
          {shownBrackets.map((bracket) => (
            <ArtistBracketCard bracket={bracket} key={bracket.id} userId={currentUserId} />
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default App
