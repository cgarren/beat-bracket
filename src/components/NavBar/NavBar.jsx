import React from "react";
import { navigate } from "gatsby";
import ProfileDropdown from "./ProfileDropdown";
import { Button } from "../ui/button";

export default function NavBar({ noChanges }) {
  return (
    <nav className="bg-black mb-4">
      <div className="flex items-center min-h-fit px-4 py-1.5 mx-auto sm:px-6 lg:px-4 justify-between">
        <Button
          className="text-2xl font-logo p-0"
          onClick={() => {
            if (noChanges(true)) navigate("/my-brackets");
          }}
        >
          {" "}
          Beat Bracket{" "}
        </Button>
        <ProfileDropdown noChanges={noChanges} />
      </div>
    </nav>
  );
}
