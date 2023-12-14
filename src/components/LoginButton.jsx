import React, { useContext, useCallback } from "react";

import * as cx from "classnames";

import spotifyLogoGreen from "../assets/images/Spotify_Logo_RGB_Green.png";
import LoadingIndicator from "./LoadingIndicator";

import { LoginContext } from "../context/LoginContext";
import useAuthentication from "../hooks/useAuthentication";

export default function LoginButton({ variant = "borderless", cleanupFunc = () => {} }) {
  const { loginInProgress } = useContext(LoginContext);
  const { login } = useAuthentication();

  const buttonClicked = useCallback(async () => {
    const loginResult = await login();
    await cleanupFunc(loginResult);
  }, [cleanupFunc, login]);

  return (
    <button
      type="button"
      onClick={buttonClicked}
      disabled={loginInProgress}
      className={cx(
        "inline-flex",
        "flex-row",
        "items-center",
        "justify-center",
        "bg-black",
        "hover:bg-zinc-800",
        "text-white",
        {
          "border-white hover:border-zinc-200": variant === "bordered",
        },
        { "border-black hover:border-zinc-800": variant !== "bordered" },
      )}
    >
      {loginInProgress ? (
        <LoadingIndicator />
      ) : (
        <>
          <span>Login with&nbsp;</span>
          <img src={spotifyLogoGreen} alt="Spotify" className="h-6 text-white" />
        </>
      )}
    </button>
  );
}
