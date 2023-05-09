import React from "react";
import spotifyLogo from "../assets/images/Spotify_Logo_RGB_White.png";
import Faq from "./Faq/Faq";

const Footer = ({ heightClass, loggedIn, path }) => {
  return (
    <footer className={heightClass}>
      <div className="bg-black">
        <Faq loggedIn={loggedIn} path={path} />
        <div className="relative text-center">
          <span className="inline-flex items-center text-white sm:flex-row flex-col">
            © Cooper Garren 2023
            <span className="hidden sm:block">&nbsp;|&nbsp;</span>
            <a
              className="hover:underline"
              target="_blank"
              href="/privacy-policy"
            >
              Privacy Policy
            </a>
            <span className="hidden sm:block">&nbsp;|&nbsp;</span>
            <span className="flex">
              Content from&nbsp;
              <a href="https://spotify.com">
                <img
                  src={spotifyLogo}
                  alt="Spotify"
                  className="h-[22px] text-white"
                />
              </a>
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
