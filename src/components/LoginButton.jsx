import React from "react";

import { generateRandomString } from "../utilities/helpers";

import spotifyLogo from "../assets/images/Spotify_Logo_RGB_Green.png";

const LoginButton = () => {
  function login() {
    let stateKey = "spotify_auth_state";
    let client_id = "fff2634975884bf88e3d3c9c2d77763d"; // Your client id
    //let redirect_uri = 'https://spotifydata.com/songdata'; // Your redirect uri
    let redirect_uri = window.location.href; //"http://localhost:8000"; // Your redirect uri

    let state = generateRandomString(16);

    sessionStorage.setItem(stateKey, state);
    let scope = "playlist-modify-private playlist-modify-public";

    let url = "https://accounts.spotify.com/authorize";
    url += "?response_type=token";
    url += "&client_id=" + encodeURIComponent(client_id);
    url += "&scope=" + encodeURIComponent(scope);
    url += "&redirect_uri=" + encodeURIComponent(redirect_uri);
    url += "&state=" + encodeURIComponent(state);
    window.location = url;
  }

  return (
    <button
      onClick={login}
      className="bg-black hover:bg-zinc-800 text-white border-black hover:border-zinc-800 flex items-center justify-center"
    >
      <span>Login with&nbsp;</span>
      <img src={spotifyLogo} alt="Spotify" className="h-6"></img>
    </button>
  );
};

export default LoginButton;
