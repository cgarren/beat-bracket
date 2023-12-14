/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useMemo, useState } from "react";
import NavBar from "./NavBar/NavBar";
import Clicky from "./Clicky";
import Footer from "./Footer";
import { MixpanelContext } from "../context/MixpanelContext";
import { LoginContext } from "../context/LoginContext";
import useAuthentication from "../hooks/useAuthentication";
import useGlobalTimer from "../hooks/useGlobalTimer";
import LoginExpiredModal from "./LoginExpiredModal";

export default function Layout({
  children,
  noChanges = () => true,
  path = typeof window !== "undefined" ? window.location.pathname : undefined,
  showNavBar = true,
  showFooter = true,
  track = true,
  saveBracketLocally,
  isBracketSavedLocally = false,
  deleteBracketSavedLocally,
}) {
  const mixpanel = useContext(MixpanelContext);
  const { setTimer, clearTimer } = useGlobalTimer();
  const { loginRef } = useAuthentication();
  const { loginInfo, loggedIn } = useContext(LoginContext);
  const bracketPageRegex = useMemo(() => /^\/user\/.+\/bracket\/[a-zA-Z0-9-]+\/?$/, []);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Runs once, after page load
  useEffect(() => {
    console.log("attempting to track");
    if (track && mixpanel && mixpanel.track_pageview) {
      mixpanel.track_pageview();
      console.debug("Tracked page load");
    }
  }, [mixpanel, track]);

  // set timer to refresh spotify session
  useEffect(() => {
    if (loggedIn && loginInfo && loginInfo.expiresAt && loginRef.current && !showLoginModal) {
      // refresh access token 1 minute before it expires
      const refreshTime = loginInfo.expiresAt - 60000 - Date.now();
      if (refreshTime > 0) {
        setTimer(
          () => {
            const onBracketPage = bracketPageRegex.test(window.location.pathname);
            // if (deleteBracketSavedLocally) deleteBracketSavedLocally();
            // if (onBracketPage) {
            //   if (saveBracketLocally) saveBracketLocally();
            // }

            loginRef.current(true).then((loginResult) => {
              if (!loginResult) {
                setShowLoginModal(true);
              }
            });
          },
          refreshTime,
          "auth",
        );
        return () => {
          clearTimer("auth");
        };
      }

      return () => {};
    }
    return () => {};
  }, [
    showLoginModal,
    loginInfo,
    setTimer,
    clearTimer,
    loggedIn,
    loginRef,
    // saveBracketLocally,
    // deleteBracketSavedLocally,
    bracketPageRegex,
  ]);

  return (
    <>
      <Clicky />
      {(showFooter || showNavBar || children) && (
        <div className="text-center clear-both">
          <main className="font-sans text-black bg-gradient-radial from-zinc-200 to-zinc-300 relative text-center min-h-screen pb-[24px]">
            {/* <div className="fixed w-full h-full top-0 left-0 bg-repeat bg-scroll bg-slate-900 bg-colosseum bg-blend-screen bg-cover opacity-40 -z-10"></div> */}
            {showNavBar && <NavBar noChanges={noChanges} />}
            <LoginExpiredModal
              showModal={showLoginModal}
              setShowModal={setShowLoginModal}
              login={loginRef.current}
              bracketSavedLocally={false && isBracketSavedLocally}
            />
            {children}
          </main>
          {showFooter && <Footer path={path} />}
        </div>
      )}
    </>
  );
}
