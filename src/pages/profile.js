import React, { useEffect, useState } from "react"
import Layout from "../components/Layout";
import BracketCard from "../components/BracketCard";
import Tab from "../components/Tab";

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
    async function getBrackets() {
      await new Promise(resolve => setTimeout(resolve, 5000)); //simulate network loading
      const loadedBrackets = [
        { id: 1, artistName: "Kanye West", artistId: "5K4W6rqBFWDnAN6FQUkS6x", tracks: 64, seeding: "popularity", lastModified: Date.now(), complete: true },
        { id: 2, artistName: "Ariana Grande", artistId: "66CXWjxzNUsdJxJ2JdwvnR", tracks: 32, seeding: "popularity", lastModified: Date.now(), complete: false },
        { id: 3, artistName: "Kanye West", artistId: "5K4W6rqBFWDnAN6FQUkS6x", tracks: 8, seeding: "popularity", lastModified: Date.now(), complete: false },
        { id: 4, artistName: "Kanye West", artistId: "5K4W6rqBFWDnAN6FQUkS6x", tracks: 128, seeding: "popularity", lastModified: Date.now(), complete: true },
        { id: 5, artistName: "Kanye West", artistId: "5K4W6rqBFWDnAN6FQUkS6x", tracks: 16, seeding: "popularity", lastModified: Date.now(), complete: false },
        { id: 6, artistName: "Kanye West", artistId: "5K4W6rqBFWDnAN6FQUkS6x", tracks: 32, seeding: "popularity", lastModified: Date.now(), complete: true },
      ]
      setBrackets(loadedBrackets);
      setShownBrackets(loadedBrackets);
    }
    getBrackets();
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
        <div className="flex flex-row flex-wrap justify-start items-stretch gap-5 overflow-scroll mx-5">
          {shownBrackets.map((bracket) => (
            <BracketCard bracket={bracket} key={bracket.id} />
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default App
