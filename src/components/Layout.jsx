import React, { useState } from "react";
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import AuthBanner from "../components/AuthBanner";
import NavBar from "./NavBar";
import { getParamsFromURL, checkAuth } from "../utilities/helpers";
import { getUserInfo } from "../utilities/spotify";

const Layout = ({ children, noChanges }) => {
  const [loggedIn, setLoggedIn] = useState(true);
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    getParamsFromURL(window.location.pathname).then(() => {
      if (checkAuth()) {
        console.log("logged in");
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
      getUserInfo().then((userInfo) => {
        setUserInfo(userInfo);
      });
      const timer = setInterval(() => {
        if (checkAuth(timer)) {
          setLoggedIn(true);
        } else {
          setLoggedIn(false);
        }
      }, 1000);
      return () => clearInterval(timer);
    });
  }, []);

  return (
    <main className="font-sans text-black min-h-screen bg-zinc-300 relative">
      <Helmet>
        <title>Beat Bracket</title>
      </Helmet>
      {/* <div className="fixed w-full h-full top-0 left-0 bg-repeat bg-scroll bg-slate-900 bg-colosseum bg-blend-screen bg-cover opacity-40 -z-10"></div> */}
      <AuthBanner show={false} />
      <NavBar loggedIn={loggedIn} noChanges={noChanges} userInfo={userInfo} />
      {children}
    </main>
  );
};

export default Layout;
