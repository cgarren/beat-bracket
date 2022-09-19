import React from "react";
import ProfileDropdown from "./ProfileDropdown";

const NavBar = ({ loggedIn, noChanges }) => {
  function handleNaviagtionAttempt() {
    if (noChanges()) {
      window.location = "/";
    }
  }
  return (
    <header className="bg-black mb-4">
      <div className="flex items-center h-14 px-4 mx-auto sm:px-6 lg:px-4 justify-between">
        <button
          className="text-white text-2xl font-bold font-display bg-black border-0 hover:bg-black pl-0"
          onClick={handleNaviagtionAttempt}
        >
          🏛️ Song Colosseum
        </button>
        <ProfileDropdown loggedIn={loggedIn} />
      </div>
    </header>
  );
};

export default NavBar;
