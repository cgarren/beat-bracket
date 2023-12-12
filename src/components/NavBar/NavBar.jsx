import React from "react";
import ProfileDropdown from "./ProfileDropdown";
import useHelper from "../../hooks/useHelper";

export default function NavBar({ noChanges }) {
  const { handleNaviagtionAttempt } = useHelper();

  return (
    <header className="bg-black mb-4">
      <div className="flex items-center min-h-fit px-4 mx-auto sm:px-6 lg:px-4 justify-between">
        <button
          type="button"
          className="text-white text-2xl font-bold font-display bg-black border-0 hover:bg-black pl-0 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50"
          onClick={() => handleNaviagtionAttempt("/my-brackets", noChanges)}
        >
          Beat Bracket
        </button>
        <ProfileDropdown noChanges={noChanges} />
      </div>
    </header>
  );
}
