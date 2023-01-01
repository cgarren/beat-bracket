import React, { useState } from "react";
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import AuthBanner from "../components/AuthBanner";
import NavBar from "./NavBar";
import { getParamsFromURL, checkAuth } from "../utilities/helpers";
import { authenticate } from "../utilities/backend";
import { getUserInfo } from "../utilities/spotify";

const Layout = ({ children, noChanges }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    getParamsFromURL(window.location.pathname).then(() => {
      if (checkAuth()) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
      getUserInfo().then((userInfo) => {
        setUserInfo(userInfo);
        authenticate(userInfo.id).then((success) => {
          if (success !== 0) {
            setLoggedIn(false);
          }
        });
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
      <AuthBanner show={!loggedIn} />
      <NavBar loggedIn={loggedIn} noChanges={noChanges} userInfo={userInfo} />
      <div className="">{children}</div>
    </main>
  );
};

export default Layout;
