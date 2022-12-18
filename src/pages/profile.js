import React, { useEffect, useState } from "react"
import Layout from "../components/Layout";
import BracketCard from "../components/BracketCard";
import kanyeBracketImage from "../assets/images/kanyeBracket.png";

// markup
const App = () => {
  const [brackets, setBrackets] = useState([
    { id: 1, name: "", image: null },
  ]);

  useEffect(() => {
    async function getBrackets() {
      await new Promise(resolve => setTimeout(resolve, 5000)); //simulate network loading
      setBrackets([
        { id: 1, name: "Kanye West Bracket", image: kanyeBracketImage },
        { id: 2, name: "Kanye West Bracket", image: kanyeBracketImage },
        { id: 3, name: "Kanye West Bracket", image: kanyeBracketImage },
        { id: 4, name: "Kanye West Bracket", image: kanyeBracketImage },
        { id: 5, name: "Kanye West Bracket", image: kanyeBracketImage },
        { id: 6, name: "Kanye West Bracket", image: kanyeBracketImage },
      ]);
    }
    getBrackets();
  }, []);

  return (
    <Layout noChanges={true}>
      <div className="">
        <h1 className="text-4xl font-extrabold mb-2">My Brackets</h1>
        <div className="flex flex-row flex-wrap justify-evenly items-center gap-5 flex-shrink">
          {brackets.map((bracket) => (
            <BracketCard name={bracket.name} image={bracket.image} key={bracket.id} />
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default App
