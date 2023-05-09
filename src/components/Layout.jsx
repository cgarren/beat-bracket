import React, { useEffect, useState } from "react";
import NavBar from "./NavBar/NavBar";
import Clicky from "./Clicky";
import Footer from "./Footer";
import { isLoggedIn } from "../utilities/authentication";

const Layout = ({ children, noChanges, path }) => {
  const loggedIn = isLoggedIn();
  const [, updateState] = useState();

  useEffect(() => {
    // check if user is logged in when the localstorage changes
    window.onstorage = () => {
      console.log("storage changed");
      updateState({});
    };
    return () => {
      window.onstorage = null;
    };
  }, []);

  return (
    <>
      <Clicky />
      <div className="text-center clear-both">
        <main className="font-sans text-black bg-gradient-radial from-zinc-200 to-zinc-300 relative text-center min-h-screen pb-[24px]">
          {/* <div className="fixed w-full h-full top-0 left-0 bg-repeat bg-scroll bg-slate-900 bg-colosseum bg-blend-screen bg-cover opacity-40 -z-10"></div> */}
          <NavBar loggedIn={loggedIn} noChanges={noChanges} />
          {children}
        </main>
        <Footer loggedIn={loggedIn} path={path} />
      </div>
    </>
  );
};

export default Layout;
