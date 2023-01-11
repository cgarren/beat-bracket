import React, { useState } from "react";
import { useEffect } from "react";
import AuthBanner from "../components/AuthBanner";
import NavBar from "./NavBar";
import { checkSpotifyAuth } from "../utilities/helpers";

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
    <main className="font-sans text-black min-h-screen bg-zinc-300 relative text-center">
      {/* <div className="fixed w-full h-full top-0 left-0 bg-repeat bg-scroll bg-slate-900 bg-colosseum bg-blend-screen bg-cover opacity-40 -z-10"></div> */}
      <AuthBanner show={false} />
      <NavBar loggedIn={loggedIn} noChanges={noChanges} />
      {children}
      <div>© Cooper Garren 2023</div>
    </main>
  );
};

export default Layout;
