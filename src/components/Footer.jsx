import React from "react";
import spotifyLogo from "../assets/images/Spotify_Logo_RGB_White.png";
import Faq from "./Faq/Faq";

const Footer = ({ heightClass, loggedIn, path }) => {
  return (
    <footer className={heightClass}>
      <div className="bg-black">
        <Faq loggedIn={loggedIn} path={path} />
        <div className="relative text-center">
          <span className="inline-flex items-center text-white">
            © Cooper Garren 2023 |&nbsp;
            <a className="hover:underline" href="/privacy-policy">
              Privacy Policy
            </a>
            &nbsp;| Content from&nbsp;
            <a href="https://spotify.com">
              <img
                src={spotifyLogo}
                alt="Spotify"
                className="h-[22px] text-white"
              />
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
