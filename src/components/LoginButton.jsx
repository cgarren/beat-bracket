import React from "react";

import { generateRandomString } from "../utilities/helpers";

import spotifyLogo from "../assets/images/Spotify_Logo_RGB_Green.png";

const LoginButton = () => {
  function login() {
    const stateKey = "spotify_auth_state";
    const client_id = "fff2634975884bf88e3d3c9c2d77763d"; // Your client id
    //let redirect_uri = 'https://spotifydata.com/songdata'; // Your redirect uri
    console.log(window.location);
    const redirect_uri = window.location.origin + "/my-brackets"; // Your redirect uri

    const state = generateRandomString(16);

    const show_dialog =
      localStorage.getItem("rememberMe") === "true" ? false : true;

    sessionStorage.setItem(stateKey, state);
    const scope =
      "playlist-modify-private playlist-modify-public user-read-private";

    let url = "https://accounts.spotify.com/authorize";
    url += "?response_type=token";
    url += "&client_id=" + encodeURIComponent(client_id);
    url += "&scope=" + encodeURIComponent(scope);
    url += "&redirect_uri=" + encodeURIComponent(redirect_uri);
    url += "&state=" + encodeURIComponent(state);
    url += "&show_dialog=" + encodeURIComponent(show_dialog);

    localStorage.setItem("rememberMe", true);
    window.location = url;
  }

  return (
    <button
      onClick={login}
      className="bg-black hover:bg-zinc-800 text-white border-black hover:border-zinc-800 inline-flex flex-row items-center justify-center"
    >
      <span>Login with&nbsp;</span>
      <img src={spotifyLogo} alt="Spotify" className="h-6 text-white"></img>
    </button>
  );
};

export default LoginButton;
