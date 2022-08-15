import React, { useEffect, useState } from "react";

import { getParamsFromURL } from "../utilities/helpers";

import { bannerStyle, contentHolder } from "./AuthBanner.module.css";

import LoginButton from "./LoginButton";

const AuthBanner = () => {
  const [show, setShow] = useState(false);

  function checkAuth(timer = undefined) {
    let mydate = new Date(parseInt(sessionStorage.getItem("expires_at")));
    if (
      sessionStorage.getItem("expires_at") === null ||
      mydate.toString() === "Invalid Date" ||
      Date.now() > mydate
    ) {
      setShow(true);
      if (timer) {
        clearInterval(timer);
      }
    }
  }

  useEffect(() => {
    checkAuth();
    const timer = setInterval(() => {
      checkAuth(timer);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getParamsFromURL(window.location.pathname);
    if (
      sessionStorage.getItem("received_state") ===
      sessionStorage.getItem("spotify_auth_state")
    ) {
      setShow(false);
    } else {
      setShow(true);
    }
  }, []);

  return (
    <div>
      <div hidden={!show} className={bannerStyle}>
        <div className={contentHolder}>
          You are not logged in! In order to get tracks from Spotify you need to
          be authenticated
          <LoginButton />
        </div>
      </div>
    </div>
  );
};

export default AuthBanner;
