import React, { useState } from "react";

import spotifyLogoGreen from "../assets/images/Spotify_Logo_RGB_Green.png";
import { login } from "../utilities/authentication";
import { navigate } from "gatsby";
import LoadingIndicator from "./LoadingIndicator";

const LoginButton = ({ variant = "borderless" }) => {
  const [loading, setLoading] = useState(false);
  async function signIn() {
    setLoading(true);
    console.log("loading true");
    await login();
    navigate("/my-brackets");
    setLoading(false);
  }
  return (
    <button
      onClick={signIn}
      disabled={loading}
      className={`${
        variant === "bordered"
          ? "bg-black hover:bg-zinc-800 border-white hover:border-zinc-200 text-white"
          : "bg-black hover:bg-zinc-800 border-black hover:border-zinc-800 text-white"
      } inline-flex flex-row items-center justify-center`}
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
