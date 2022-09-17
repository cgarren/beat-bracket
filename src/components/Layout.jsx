import React, { useState } from "react";
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import AuthBanner from "../components/AuthBanner";
import NavBar from "./NavBar";
import { getParamsFromURL } from "../utilities/helpers";

const Layout = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);

  function checkAuth(timer = undefined) {
    let mydate = new Date(parseInt(sessionStorage.getItem("expires_at")));
    if (
      sessionStorage.getItem("expires_at") === null ||
      mydate.toString() === "Invalid Date" ||
      Date.now() > mydate ||
      sessionStorage.getItem("received_state") !==
        sessionStorage.getItem("spotify_auth_state")
    ) {
      console.log("setting false");
      setLoggedIn(false);
      if (timer) {
        clearInterval(timer);
      }
    } else {
      console.log("setting true");
      setLoggedIn(true);
    }
  }

  useEffect(() => {
    getParamsFromURL(window.location.pathname);
    checkAuth();
    const timer = setInterval(() => {
      checkAuth(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="font-sans text-black h-full">
      <Helmet>
        <title>Song Colosseum</title>
      </Helmet>
      <div className="fixed w-full h-full top-0 left-0 bg-repeat bg-scroll bg-slate-900 bg-colosseum bg-blend-screen bg-cover opacity-40 -z-10"></div>
      <AuthBanner show={!loggedIn} />
      <NavBar loggedIn={loggedIn} />
      <div className="">{children}</div>
    </main>
  );
};

export default Layout;
