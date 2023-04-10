import React, { useState, useEffect } from "react";
import NavBar from "./NavBar/NavBar";
import { checkSpotifyAuth } from "../utilities/helpers";
import Clicky from "./Clicky";
import Footer from "./Footer";

const Layout = ({ children, noChanges }) => {
  const [loggedIn, setLoggedIn] = useState(true);

  useEffect(() => {
    if (checkSpotifyAuth()) {
      console.log("logged in");
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
    const timer = setInterval(() => {
      if (checkSpotifyAuth(timer)) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Clicky />
      <div className="text-center clear-both">
        <main className="font-sans text-black bg-zinc-300 relative text-center min-h-screen pb-[24px]">
          {/* <div className="fixed w-full h-full top-0 left-0 bg-repeat bg-scroll bg-slate-900 bg-colosseum bg-blend-screen bg-cover opacity-40 -z-10"></div> */}
          <NavBar loggedIn={loggedIn} noChanges={noChanges} />
          {children}
        </main>
        <Footer loggedIn={loggedIn} />
      </div>
    </>
  );
};

export default Layout;
