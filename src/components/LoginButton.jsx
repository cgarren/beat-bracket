import React from "react";

import { generateRandomString } from "../utilities/helpers";

import { buttonStyle, logoStyle } from "./LoginButton.module.css";

import spotifyLogo from "../images/Spotify_Logo_RGB_Green.png";

const LoginButton = () => {
  function login() {
    let stateKey = "spotify_auth_state";
    let client_id = "fff2634975884bf88e3d3c9c2d77763d"; // Your client id
    //let redirect_uri = 'https://spotifydata.com/songdata'; // Your redirect uri
    let redirect_uri = "http://localhost:8000"; // Your redirect uri

    let state = generateRandomString(16);

    sessionStorage.setItem(stateKey, state);
    let scope =
      "user-read-private user-read-email user-follow-read user-follow-modify user-read-private user-read-email streaming user-read-currently-playing user-read-recently-played user-modify-playback-state user-library-modify user-library-read user-top-read user-modify-private";

    let url = "https://accounts.spotify.com/authorize";
    url += "?response_type=token";
    url += "&client_id=" + encodeURIComponent(client_id);
    url += "&scope=" + encodeURIComponent(scope);
    url += "&redirect_uri=" + encodeURIComponent(redirect_uri);
    url += "&state=" + encodeURIComponent(state);
    window.location = url;
  }

  return (
    <button onClick={login} className={buttonStyle}>
      <span>Login with&nbsp;</span>
      <img src={spotifyLogo} alt="Spotify logo" className={logoStyle}></img>
    </button>
  );
};

export default LoginButton;
