import { navigate } from "gatsby";
import React from "react";
import ProfileDropdown from "./ProfileDropdown";

const NavBar = ({ loggedIn, noChanges, userInfo }) => {
  function handleNaviagtionAttempt() {
    if (noChanges()) {
      navigate("/");
    }
  }
  return (
    <header className="bg-black mb-4">
      <div className="flex items-center h-14 px-4 mx-auto sm:px-6 lg:px-4 justify-between">
        <button
          className="text-white text-2xl font-bold font-display bg-black border-0 hover:bg-black pl-0"
          onClick={handleNaviagtionAttempt}
        >
          Beat Bracket
        </button>
        <ProfileDropdown
          loggedIn={loggedIn}
          noChanges={noChanges}
          userInfo={userInfo}
        />
      </div>
    </header>
  );
};

export default NavBar;
