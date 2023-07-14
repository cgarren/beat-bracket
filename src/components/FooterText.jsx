import React from "react";
import spotifyLogoWhite from "../assets/images/Spotify_Logo_RGB_White.png";
import spotifyLogoBlack from "../assets/images/Spotify_Logo_RGB_Black.png";
import cx from "classnames";

const FooterText = ({ whiteText = true }) => {
  return (
    <div
      className={cx(
        "relative text-center",
        { "text-white": whiteText },
        { "text-black": !whiteText }
      )}
    >
      <span className="inline-flex items-center sm:flex-row flex-col">
        © Cooper Garren 2023
        <span className="hidden sm:block">&nbsp;|&nbsp;</span>
        <a
          className={cx(
            "hover:underline",
            "after:my-0",
            "after:ml-[5px]",
            "after:mr-[3px]",
            "after:content-[url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAQElEQVR42qXKwQkAIAxDUUdxtO6/RBQkQZvSi8I/pL4BoGw/XPkh4XigPmsUgh0626AjRsgxHTkUThsG2T/sIlzdTsp52kSS1wAAAABJRU5ErkJggg==)]",
            { "after:brightness-0": whiteText },
            { "after:invert": whiteText }
          )}
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
              src={whiteText ? spotifyLogoWhite : spotifyLogoBlack}
              alt="Spotify"
              className="h-[22px]"
            />
          </a>
        </span>
      </span>
    </div>
  );
};

export default FooterText;
