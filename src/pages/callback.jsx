/* eslint-disable no-nested-ternary */
import React, { useEffect, useContext } from "react";
import { navigate } from "gatsby";
import { useQuery } from "@tanstack/react-query";
import Layout from "../components/Layout";
import Seo from "../components/SEO";
import { UserInfoContext } from "../context/UserInfoContext";
import { LoginContext } from "../context/LoginContext";
import useAuthentication from "../hooks/useAuthentication";
import { loginCallback as spotifyLoginCallback } from "../axios/spotifyInstance";
import { login as backendLogin } from "../axios/backendInstance";
import LoginButton from "../components/Controls/LoginButton";
import LoadingIndicator from "../components/LoadingIndicator";
import { Button } from "../components/ui/button";

// markup
export default function App({ location }) {
  const { toPrevPage, getPrevPath } = useAuthentication(false);
  const userInfo = useContext(UserInfoContext);
  const { setupDone } = useContext(LoginContext);

  useEffect(() => {
    console.log("setupDone", setupDone);
  }, [setupDone]);

  const {
    data: spotifyLoginData,
    isPending: spotifyLoggingIn,
    isSuccess: spotifyLoginSuccess,
    error: spotifyLoginError,
  } = useQuery({
    queryKey: ["spotifyLogin", setupDone],
    queryFn: async () => {
      console.log("calling callabck", location, setupDone);
      return spotifyLoginCallback(new URLSearchParams(window.location.search));
    },
    enabled: setupDone,
  });

  const {
    isPending: backendLoggingIn,
    isSuccess: backendLoginSuccess,
    error: backendLoginError,
  } = useQuery({
    queryKey: ["backendLogin", { userId: userInfo?.id, accessToken: spotifyLoginData?.accessToken }],
    queryFn: async () => ({
      backendToken: await backendLogin(userInfo?.id, spotifyLoginData?.accessToken),
    }),
    enabled: Boolean(spotifyLoginData?.accessToken && userInfo?.id),
  });

  const error =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).size === 0
      ? "No url parameters found in query string"
      : spotifyLoginError?.message || backendLoginError?.message;

  // useEffect(() => {
  //   console.log("spotifyLoggingIn", spotifyLoggingIn);
  // }, [spotifyLoggingIn]);

  // useEffect(() => {
  //   console.log("data", spotifyLoginData?.accessToken, userInfo?.id);
  // }, [spotifyLoginData, userInfo]);

  // useEffect(() => {
  //   if (backendLoginData?.backendToken) {
  //     console.log("setting initital backend token");
  //     sessionStorage.setItem("backendToken", backendLoginData.backendToken);
  //     queryClient.invalidateQueries({ queryKey: ["backend"] });
  //   }
  // }, [backendLoginData]);

  useEffect(() => {
    if (spotifyLoginSuccess && backendLoginSuccess) {
      if (getPrevPath()) {
        toPrevPage(true);
      } else {
        navigate("/my-brackets", { replace: true });
      }
    }
  }, [backendLoginSuccess, spotifyLoginSuccess, getPrevPath, toPrevPage]);

  return (
    <Layout noChanges={() => true} path="/callback/" showNavBar={false} showFooter={false} track={false}>
      <div className="h-screen bg-gradient-radial from-zinc-100 from-60% to-zinc-400 relative">
        <div className="flex flex-row justify-center items-center h-full px-4 sm:w-9/12 m-auto">
          {error && (
            <div>
              <span className="font-bold text-lg">Error logging in!</span>
              <div className="">{error || "Unknown Error"}</div>
              <div className="mt-2">
                <span className="">Try again? </span>
                <LoginButton
                  cleanupFunc={(loginResult) => {
                    if (loginResult) {
                      navigate("/my-brackets");
                    }
                  }}
                />
              </div>
            </div>
          )}
          {!error &&
            (spotifyLoggingIn || backendLoggingIn ? (
              <h3 className="text-xl text-black">
                <LoadingIndicator /> Logging in...
              </h3>
            ) : !error && spotifyLoginSuccess && backendLoginSuccess ? (
              <div className="flex flex-inline flex-col items-center">
                <h3 className="text-xl text-black">
                  <LoadingIndicator /> Login successful! Redirecting...
                </h3>
                <Button className="" onClick={() => toPrevPage()}>
                  Click here if not redirected
                </Button>
              </div>
            ) : (
              <div>
                <span className="font-bold text-lg">Error logging in!</span>
                <div className="">Unknown Error</div>
                <div className="mt-2">
                  <span className="">Try again? </span>
                  <LoginButton
                    cleanupFunc={(loginResult) => {
                      if (loginResult) {
                        navigate("/my-brackets");
                      }
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </Layout>
  );
}

export function Head({ location }) {
  return <Seo title="Logging in..." pathname={location.pathname} />;
}
