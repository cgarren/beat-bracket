import React from "react";

import LoginButton from "./LoginButton";

const AuthBanner = ({ show }) => {
  return (
    <div hidden={!show}>
      <div className="bg-orange-400 text-black font-bold text-center width-full overflow-x-hidden py-1 flex justify-center">
        <div className="flex flex-col items-center gap-1">
          You are not logged in! In order to get tracks from Spotify you need to
          be authenticated
          <LoginButton />
        </div>
      </div>
    </div>
  );
};

export default AuthBanner;
