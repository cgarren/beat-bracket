/* eslint-disable no-nested-ternary */
import React, { useEffect, useContext, useState } from "react";
import { navigate } from "gatsby";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const { toPrevPage } = useAuthentication(false);
  const { loggedIn, setLoginInfo, loginInfo } = useContext(LoginContext);
  const userInfo = useContext(UserInfoContext);
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);

  const [error, setError] = useState(null);

  const { isLoading: spotifyLoggingIn } = useQuery({
    queryKey: "SpotifyLogin",
    queryFn: async () => {
      const { refreshToken, accessToken, expiresAt } = await spotifyLoginCallback(urlParams);
      setLoginInfo();
    },
    enabled: urlParams.size !== 0,
  });

  const { isLoading: backendLoggingIn } = useQuery({
    queryKey: ["BackendLogin", { userId: userInfo?.id, accessToken: loginInfo?.accessToken }],
    queryFn: async () => {
      const backendToken = await backendLogin(userInfo.id, expiresAt, loginInfo.accessToken);
      setLoginInfo();
    },
    enabled: !spotifyLoggingIn && loginInfo?.accessToken && userInfo?.id,
  });

  useEffect(() => {
    window.history.replaceState({}, document.title, window.location.pathname);
    const prevPath = sessionStorage.getItem(prevKey);
    queryClient.removeQueries();
    if (prevPath) {
      sessionStorage.removeItem(prevKey);
      navigate(prevPath, { replace: true });
    } else {
      navigate("/my-brackets", { replace: true });
    }
  }, [backendLoggingIn, spotifyLoggingIn]);

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
              <Button className="" onClick={() => toPrevPage()}>
                Click here if not redirected
              </Button>
            </div>
          ) : (
            <div>
              {error || urlParams.size === 0 ? (
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

export function Head({ location }) {
  return <Seo title="Logging in..." pathname={location.pathname} />;
}
