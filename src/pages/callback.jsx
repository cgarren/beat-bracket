/* eslint-disable no-nested-ternary */
import React, { useEffect, useContext } from "react";
import { navigate } from "gatsby";
import { useQuery } from "@tanstack/react-query";
import Layout from "../components/Layout";
import Seo from "../components/SEO";
import { LoginContext } from "../context/LoginContext";
import { UserInfoContext } from "../context/UserInfoContext";
import useAuthentication from "../hooks/useAuthentication";
import useSpotify from "../hooks/useSpotify";
import useBackend from "../hooks/useBackend";
import LoginButton from "../components/Controls/LoginButton";
import LoadingIndicator from "../components/LoadingIndicator";
import { Button } from "../components/ui/button";

// markup
export default function App() {
  const { loginCallback: spotifyLoginCallback } = useSpotify();
  const { authenticate: backendLogin } = useBackend();
  const { toPrevPage, getPrevPath } = useAuthentication(false);
  const { isLoggedIn, setSpotifyLoggedIn, setBackendLoggedIn } = useContext(LoginContext);
  const userInfo = useContext(UserInfoContext);

  const urlParams = new URLSearchParams(window.location.search);

  const {
    data: spotifyLoginData,
    isPending: spotifyLoggingIn,
    isSuccess: spotifyLoginSuccess,
    error: spotifyLoginError,
  } = useQuery({
    queryKey: ["SpotifyLogin", { urlParams: urlParams }],
    queryFn: async () => spotifyLoginCallback(urlParams),
    enabled: urlParams.size !== 0,
  });

  const {
    data: backendLoginData,
    isPending: backendLoggingIn,
    isSuccess: backendLoginSuccess,
    error: backendLoginError,
  } = useQuery({
    queryKey: ["BackendLogin", { userId: userInfo?.id, accessToken: spotifyLoginData?.accessToken }],
    queryFn: async () => ({
      backendToken: await backendLogin(userInfo?.id, null, spotifyLoginData?.accessToken),
    }),
    enabled: Boolean(spotifyLoginData?.accessToken && userInfo?.id),
  });

  // console.log(Boolean(spotifyLoginData?.accessToken && userInfo?.id), spotifyLoginData?.accessToken, userInfo?.id);

  useEffect(() => {
    if (spotifyLoginData?.refreshToken && spotifyLoginData?.accessToken) {
      console.log("setting initial spotify tokens");
      sessionStorage.setItem("accessToken", spotifyLoginData.accessToken);
      localStorage.setItem("refreshToken", spotifyLoginData.refreshToken);
      setSpotifyLoggedIn(true);
    }
  }, [spotifyLoginData]);

  useEffect(() => {
    if (backendLoginData?.backendToken) {
      sessionStorage.setItem("backendToken", backendLoginData.backendToken);
      setBackendLoggedIn(true);
    }
  }, [backendLoginData]);

  const error =
    urlParams.size === 0
      ? "No url parameters found in query string"
      : spotifyLoginError?.message || backendLoginError?.message;

  useEffect(() => {
    if (spotifyLoginSuccess && backendLoginSuccess && isLoggedIn()) {
      if (getPrevPath()) {
        toPrevPage(true);
      } else {
        navigate("/my-brackets", { replace: true });
      }
    }
  }, [backendLoginSuccess, spotifyLoginSuccess, isLoggedIn, getPrevPath, toPrevPage]);

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
                  cleanupFunc={() => {
                    if (isLoggedIn()) {
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
            ) : !error && ((spotifyLoginSuccess && backendLoginSuccess) || isLoggedIn()) ? (
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
                    cleanupFunc={() => {
                      if (isLoggedIn()) {
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
