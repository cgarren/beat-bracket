import React from "react";
import ProfileDropdown from "./ProfileDropdown";

const NavBar = ({ loggedIn }) => {
  return (
    <header className="bg-black mb-4">
      <div className="flex items-center h-14 px-4 mx-auto sm:px-6 lg:px-4 justify-between">
        <div className="text-white text-2xl font-bold font-display">
          🏛️ Song Colosseum
        </div>
        <ProfileDropdown loggedIn={loggedIn} />
      </div>
    </header>
  );
};

export default NavBar;
