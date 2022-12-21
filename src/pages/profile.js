import React, { useEffect, useState } from "react"
import Layout from "../components/Layout";
import ArtistBracketCard from "../components/ArtistBracketCard";
import Tab from "../components/Tab";
import CreateBracketCard from "../components/CreateBracketCard";
import { getBrackets } from "../utilities/backend";

// markup
const App = () => {
  const [brackets, setBrackets] = useState([
    { id: 1, artistName: null, artistId: null, tracks: null, seeding: null, lastModified: null, complete: false },
  ]);
  const [shownBrackets, setShownBrackets] = useState(brackets);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setShownBrackets(brackets.filter((bracket) => {
      if (activeTab === 0) return true;
      if (activeTab === 1) return !bracket.complete;
      if (activeTab === 2) return bracket.complete;
    }));
  }, [activeTab]);

  useEffect(() => {
    getBrackets().then((loadedBrackets) => {
      setBrackets(loadedBrackets);
      setShownBrackets(loadedBrackets);
    });
  }, []);

  return (
    <Layout noChanges={true}>
      <div className="text-center">
        <h1 className="text-4xl font-extrabold mb-2">My Brackets</h1>

        <div className="mb-3">
          <nav className="inline-flex flex-col sm:flex-row ">
            <Tab id={0} activeTab={activeTab} setActiveTab={setActiveTab} text="All" />
            <Tab id={1} activeTab={activeTab} setActiveTab={setActiveTab} text="In Progess" />
            <Tab id={2} activeTab={activeTab} setActiveTab={setActiveTab} text="Completed" />
          </nav>
        </div>
        <div className="flex flex-row flex-wrap justify-center items-stretch gap-5 overflow-scroll mx-5">
          <CreateBracketCard />
          {shownBrackets.map((bracket) => (
            <ArtistBracketCard bracket={bracket} key={bracket.id} />
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default App
