/* eslint-disable no-nested-ternary */
import React, { useEffect, useContext, useCallback, useState } from "react";
import { navigate } from "gatsby";
import Layout from "../components/Layout";
import Seo from "../components/SEO";
import { LoginContext } from "../context/LoginContext";
import useAuthentication from "../hooks/useAuthentication";
import LoginButton from "../components/Controls/LoginButton";
import LoadingIndicator from "../components/LoadingIndicator";
import ActionButton from "../components/Controls/ActionButton";

// markup
export default function App({ location }) {
  const { loginCallback, toPrevPage } = useAuthentication(false);
  const { loginInProgress, loggedIn } = useContext(LoginContext);

  const [error, setError] = useState(null);

  const processLogin = useCallback(async () => {
    // const params = await getParamsFromURL(window.location.pathname)
    const urlParams = new URLSearchParams(window.location.search);
    window.history.replaceState({}, document.title, window.location.pathname);

    if (urlParams.size !== 0) {
      // check to see if the user just logged in
      try {
        await loginCallback(urlParams);
      } catch (e) {
        // if there's an error, redirect to home page
        console.error("Error authenticating:", e);
        setError("Error authenticating");
        // redirect to home page
        // navigate("/");
      }
    } else {
      setError("No url parameters found in query string");
    }
  }, [loginCallback]);

  useEffect(() => {
    processLogin();
  }, []);

  return (
    <Layout noChanges={() => true} path="/callback/" showNavBar={false} showFooter={false} track={false}>
      <div className="h-screen bg-gradient-radial from-zinc-100 from-60% to-zinc-400 relative">
        <div className="flex flex-row justify-center items-center h-full px-4 sm:w-9/12 m-auto">
          {loginInProgress ? (
            <h3 className="text-xl text-black">
              <LoadingIndicator /> Logging in...
            </h3>
          ) : loggedIn ? (
            <div className="flex flex-inline flex-col items-center">
              <h3 className="text-xl text-black">
                <LoadingIndicator /> Login successful! Redirecting...
              </h3>
              <ActionButton
                customStyling="bg-black text-white hover:bg-black hover:text-gray-200"
                onClick={() => {
                  toPrevPage();
                }}
                text="Click here if not redirected"
              />
            </div>
          ) : (
            <div>
              {error ? (
                <>
                  <span className="font-bold text-lg">Error logging in!</span>
                  <div className="">Error: {error}</div>
                </>
              ) : (
                <>
                  <span className="font-bold text-lg">Error logging in!</span>
                  <div className="">Error: Unknown</div>
                </>
              )}
              <div className="mt-2">
                <span className="">Try again? </span>
                <LoginButton
                  cleanupFunc={() => {
                    if (loggedIn) {
                      navigate("/my-brackets");
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export function Head() {
  return <Seo title="Logging in..." />;
}
