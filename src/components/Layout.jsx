/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useMemo } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import useWindowSize from "react-use/lib/useWindowSize";
import resolveConfig from "tailwindcss/resolveConfig";
// eslint-disable-next-line import/extensions
import tailwindConfig from "../../tailwind.config.js";
import { Interceptor } from "../axios/spotifyInstance";
import NavBar from "./NavBar/NavBar";
import Clicky from "./Clicky";
import Footer from "./Footer";
import { MixpanelContext } from "../context/MixpanelContext";
import { LoginContext } from "../context/LoginContext";
import useAuthentication from "../hooks/useAuthentication";
import LoginExpiredModal from "./Modals/LoginExpiredModal";

export default function Layout({
  children,
  noChanges = () => true,
  path = typeof window !== "undefined" ? window.location.pathname : undefined,
  pageName,
  trackedProps = {},
  showNavBar = true,
  showFooter = true,
  track = true,
}) {
  const mixpanel = useContext(MixpanelContext);
  const { loginRef } = useAuthentication();
  const { showLoginExpiredModal, setShowLoginExpiredModal } = useContext(LoginContext);
  // const bracketPageRegex = useMemo(() => /^\/user\/.+\/bracket\/[a-zA-Z0-9-]+\/?$/, []);
  // const [showLoginModal, setShowLoginModal] = useState(false);
  const { width } = useWindowSize();
  const fullConfig = resolveConfig(tailwindConfig);
  const superProps = useMemo(
    () => ({
      Path: path,
      ...(pageName && { "Page Name": pageName }),
      ...trackedProps,
    }),
    [path, pageName, trackedProps],
  );

  // Runs once, after page load
  useEffect(() => {
    if (track && mixpanel?.track_pageview) {
      mixpanel.track_pageview();
    }
  }, [mixpanel, track]);

  useEffect(() => {
    if (mixpanel?.register) {
      mixpanel.register(superProps);
    }
  }, [mixpanel, superProps, trackedProps]);

  return (
    <>
      <ReactQueryDevtools initialIsOpen={false} />
      <Clicky />
      {(showFooter || showNavBar || children) && (
        <div className="text-center clear-both">
          <Interceptor>
            <main
              className={`font-sans text-black bg-gradient-radial bg-zinc-200 relative text-center min-h-screen ${
                showFooter ? "pb-[24px]" : ""
              }`}
            >
              {showNavBar && <NavBar noChanges={noChanges} />}
              {width > Number(fullConfig.theme.screens.sm.replace("px", "")) && (
                <Toaster position="top-right" containerClassName="!sticky" />
              )}
              {width <= Number(fullConfig.theme.screens.sm.replace("px", "")) && <Toaster position="bottom-center" />}
              <LoginExpiredModal
                showModal={showLoginExpiredModal}
                setShowModal={setShowLoginExpiredModal}
                login={loginRef.current}
                bracketSavedLocally={false}
              />
              {children}
            </main>
          </Interceptor>
          {showFooter && <Footer path={path} />}
        </div>
      )}
    </>
  );
}
