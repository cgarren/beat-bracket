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
  const { loggedIn, setLoginInfo, loginInfo } = useContext(LoginContext);
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
    queryKey: ["BackendLogin", { userId: userInfo?.id, accessToken: loginInfo?.accessToken }],
    queryFn: async () => ({
      backendToken: await backendLogin(userInfo?.id, null, loginInfo.accessToken),
    }),
    enabled: Boolean(loginInfo?.accessToken && userInfo?.id),
  });

  useEffect(() => {
    if (spotifyLoginData?.refreshToken && spotifyLoginData?.accessToken) {
      setLoginInfo({
        ...loginInfo,
        refreshToken: spotifyLoginData.refreshToken,
        accessToken: spotifyLoginData.accessToken,
      });
    }
  }, [spotifyLoginData]);

  useEffect(() => {
    if (backendLoginData?.backendToken) {
      setLoginInfo({ ...loginInfo, backendToken: backendLoginData.backendToken });
    }
  }, [backendLoginData]);

  const error =
    urlParams.size === 0
      ? "No url parameters found in query string"
      : spotifyLoginError?.message || backendLoginError?.message;

  useEffect(() => {
    if (spotifyLoginSuccess && backendLoginSuccess && loggedIn) {
      if (getPrevPath()) {
        toPrevPage(true);
      } else {
        navigate("/my-brackets", { replace: true });
      }
    }
  }, [backendLoginSuccess, spotifyLoginSuccess, loggedIn]);

  return (
    <Layout noChanges={() => true} path="/callback/" showNavBar={false} showFooter={false} track={false}>
      <div className="h-screen bg-gradient-radial from-zinc-100 from-60% to-zinc-400 relative">
        <div className="flex flex-row justify-center items-center h-full px-4 sm:w-9/12 m-auto">
          {spotifyLoggingIn || backendLoggingIn ? (
            <h3 className="text-xl text-black">
              <LoadingIndicator /> Logging in...
            </h3>
          ) : (spotifyLoginSuccess && backendLoginSuccess) || loggedIn ? (
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
              <div className="">{error || "Unknown Error"}</div>
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

export function Head({ location }) {
  return <Seo title="Logging in..." pathname={location.pathname} />;
}
