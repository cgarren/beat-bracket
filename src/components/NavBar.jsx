import { navigate } from "gatsby";
import React from "react";
import ProfileDropdown from "./ProfileDropdown";

const NavBar = ({ loggedIn, noChanges }) => {
  function handleNaviagtionAttempt() {
    if (noChanges(true)) {
      navigate("/my-brackets");
    }
  }
  return (
    <header className="bg-black mb-4">
      <div className="flex items-center min-h-fit px-4 mx-auto sm:px-6 lg:px-4 justify-between">
        <button
          className="text-white text-2xl font-bold font-display bg-black border-0 hover:bg-black pl-0"
          onClick={handleNaviagtionAttempt}
        >
          Beat Bracket
        </button>
        <ProfileDropdown loggedIn={loggedIn} noChanges={noChanges} />
      </div>
    </header>
  );
};

export default NavBar;
