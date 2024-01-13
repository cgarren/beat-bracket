import React, { useEffect, useState, useMemo, useContext, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import cx from "classnames";
import Layout from "../components/Layout";
import BracketCard from "../components/BracketCard/BracketCard";
import Tab from "../components/Tab";
import LoadingBracketCard from "../components/BracketCard/LoadingBracketCard";
import CreateBracketCard from "../components/BracketCard/CreateBracketCard";
import Alert from "../components/Alert";
import Seo from "../components/SEO";
import { LoginContext } from "../context/LoginContext";
import useBackend from "../hooks/useBackend";

// markup
export default function App({ location }) {
  // const [brackets, setBrackets] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: null, type: null, timeoutId: null });
  const { loginInfo, loginInProgress, loggedIn } = useContext(LoginContext);
  const { getBrackets, getMaxBrackets } = useBackend();
  const maxBrackets = getMaxBrackets();
  const {
    data: brackets,
    isError,
    isSuccess,
    isPending,
  } = useQuery({
    queryKey: ["brackets", { userId: loginInfo.userId }],
    queryFn: () => getBrackets(loginInfo.userId),
    retry: (failureCount, err) => {
      console.log("failureCount:", failureCount, "error:", err);
      return false;
    },
    meta: {
      errorMessage: "Error loading brackets",
    },
  });

  const shownBrackets = useMemo(() => {
    // console.debug("brackets:", brackets);
    if (!brackets) return [];
    return brackets.filter((bracket) => {
      if (activeTab === 0) return true;
      if (activeTab === 1) return !bracket.completed && !bracket.winner;
      if (activeTab === 2) return bracket.completed || bracket.winner;
      return true;
    });
  }, [activeTab, brackets]);

  // scroll to top of window on page load
  useEffect(() => window.scrollTo(0, 0), []);
  //   async function loadBrackets() {
  //     setError(null);
  //     try {
  //       if (!loginInProgress && loggedIn) {
  //         const loadedBrackets = await getBrackets(loginInfo.userId);
  //         console.debug(loadedBrackets);
  //         setBrackets(loadedBrackets);
  //       } else {
  //         setBrackets(null);
  //       }
  //     } catch (e) {
  //       console.error("Error loading brackets:", e);
  //       if (e.cause && e.cause.code === 403) {
  //         // showAlert("Not authenticated!", "error", false);
  //         setError(
  //           <div className="text-center">
  //             Error loading brackets. Try logging out and back in again!
  //             <br />
  //             <br />
  //             {/* It&apos;s possible you logged in from another device. Only one session can be active for a user at any
  //             given time. */}
  //           </div>,
  //         );
  //         showAlert(e.message, "error", false);
  //       } else if (e.cause && e.cause.code === 429) {
  //         showAlert("Your brackets can't be loaded right now. Try again in a few minutes.", "error", false);
  //       } else if (e.message) {
  //         showAlert(e.message, "error", false);
  //       } else {
  //         showAlert("Unknown Error loading brackets", "error", false);
  //       }
  //     }
  //   }
  //   loadBrackets();
  // }, [loginInfo, loggedIn, getBrackets, showAlert, loginInProgress]);

  return (
    <Layout noChanges={() => true} path={location.pathname}>
      <div className="text-center">
        <h1 className="text-4xl font-extrabold">My Brackets</h1>
        {isError && <div className="text-md text-gray-600 mb-2 mt-2">Error loading brackets</div>}
        {!isError && (
          <>
            {isSuccess && maxBrackets && (
              <p className="text-sm text-gray-600 mb-2">{`${brackets.length}/${maxBrackets} brackets used`}</p>
            )}
            <div className="">
              <nav className="inline-flex flex-row">
                <Tab id={0} activeTab={activeTab} setActiveTab={setActiveTab} content="All" />
                <Tab id={1} activeTab={activeTab} setActiveTab={setActiveTab} content="In Progess" />
                <Tab id={2} activeTab={activeTab} setActiveTab={setActiveTab} content="Completed" />
              </nav>
            </div>
            <div
              className={cx(
                "pt-3 items-stretch sm:mx-5 gap-5",
                { "inline-grid 2xl:grid-cols-4 xl:grid-cols-3 md:grid-cols-2": brackets && brackets.length >= 3 },
                { "flex flex-row flex-wrap justify-center": brackets && brackets.length < 3 },
              )}
            >
              {activeTab === 0 && isSuccess && brackets.length < maxBrackets && <CreateBracketCard />}
              {isPending && <LoadingBracketCard />}
              {!loginInProgress && !loggedIn ? (
                <div className="text-center">
                  <p className="text-md text-gray-600 mb-2">You must be logged in to view your brackets.</p>
                </div>
              ) : null}
              {loggedIn &&
                shownBrackets.map((bracket) => (
                  <BracketCard bracket={bracket} key={bracket.id} userId={loginInfo.userId} />
                ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export function Head() {
  return <Seo title="My brackets" />;
}
