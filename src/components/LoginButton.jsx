import React, { useState, useContext } from "react";

import spotifyLogoGreen from "../assets/images/Spotify_Logo_RGB_Green.png";
import { login } from "../utilities/authentication";
import { navigate } from "gatsby";
import LoadingIndicator from "./LoadingIndicator";

import { LoginContext } from "../context/LoginContext";

import * as cx from "classnames";

const LoginButton = ({ variant = "borderless" }) => {
  const [loading, setLoading] = useState(false);
  const { setLoggedIn } = useContext(LoginContext);
  async function signIn() {
    setLoading(true);
    console.log("loading true");
    await login(setLoggedIn);
    navigate("/my-brackets");
    setLoading(false);
  }
  return (
    <button
      onClick={signIn}
      disabled={loading}
      className={cx(
        "inline-flex",
        "flex-row",
        "items-center",
        "justify-center",
        "bg-black",
        "hover:bg-zinc-800",
        "text-white",
        { "border-white hover:border-zinc-200": variant === "bordered" },
        { "border-black hover:border-zinc-800": variant !== "bordered" }
      )}
    >
      {loading ? (
        <LoadingIndicator />
      ) : (
        <>
          <span>Login with&nbsp;</span>
          <img
            src={spotifyLogoGreen}
            alt="Spotify"
            className="h-6 text-white"
          ></img>
        </>
      )}
    </button>
  );
};

export default LoginButton;
