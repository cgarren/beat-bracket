import { navigate } from "gatsby";
import React, { useEffect, useState } from "react";
import guestProfileImage from "../assets/images/guestProfileImage.png";

const ProfileDropdown = ({ loggedIn, noChanges, userInfo }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [shownUserInfo, setShownUserInfo] = useState({
    display_name: "Guest",
    id: "",
    images: [
      {
        url: guestProfileImage,
      },
    ],
  });

  function handleNaviagtionAttempt(path) {
    if (noChanges()) {
      navigate(path);
    }
  }

  function signOut() {
    if (noChanges()) {
      setShowDropdown(false);
      sessionStorage.clear();
      localStorage.setItem("rememberMe", false);
      navigate("/");
    }
  }

  function navProfile() {
    setShowDropdown(false);
    handleNaviagtionAttempt("/my-brackets");
  }

  useEffect(() => {
    if (loggedIn && userInfo.id) {
      setShownUserInfo(userInfo);
    } else {
      setShownUserInfo({
        display_name: "Guest",
        id: "",
        images: [
          {
            url: guestProfileImage,
          },
        ],
      });
    }
  }, [loggedIn, userInfo]);

  return (
    <div className="inline-block relative">
      <button
        type="button"
        className="flex items-center rounded-lg transition group shrink-0 border-0 hover:bg-transparent px-0"
        id="menu-button"
        aria-expanded="true"
        aria-haspopup="true"
        data-dropdown-toggle="dropdownNavbar"
        onClick={() => {
          if (loggedIn) {
            setShowDropdown(!showDropdown);
          }
        }}
      >
        <img
          className="object-cover w-10 h-10 rounded-full"
          src={shownUserInfo.images[0].url}
          alt={shownUserInfo.display_name}
        />
        <p className="hidden ml-2 text-left sm:block">
          <strong className="block text-s font-bold text-white">
            {shownUserInfo.display_name}
          </strong>
          <span className="text-gray-300 text-xs transition sm:block group-hover:text-white">
            {shownUserInfo.id}
          </span>
        </p>
        <div hidden={!loggedIn}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 ml-4 text-gray-300 transition sm:block group-hover:text-white"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>
      <ul
        id="dropdownNavbar"
        className="absolute right-0 bg-white text-base z-10 list-none divide-y divide-gray-100 rounded shadow w-full cursor-pointer min-w-fit"
        aria-labelledby="dropdownDefault"
        hidden={!showDropdown}
      >
        {/* <li>
          <button className="py-2 px-4 items-center whitespace-nowrap flex gap-1 group-hover:bg-gray-200 border-0 w-full group">
            My Brackets
          </button>
        </li> */}
        <li>
          <button
            onClick={navProfile}
            className="py-2 px-4 items-center whitespace-nowrap flex gap-1 group-hover:bg-gray-200 border-0 w-full group"
          >
            <span>My Brackets</span>
          </button>
          <button
            onClick={signOut}
            className="py-2 px-4 items-center rounded-t-none whitespace-nowrap flex gap-1 group-hover:bg-gray-200 border-0 w-full group"
          >
            <span>Sign out</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-secondary transition sm:block group-hover:text-secondary"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M16 10v-5l8 7-8 7v-5h-8v-4h8zm-16-8v20h14v-2h-12v-16h12v-2h-14z" />
            </svg>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ProfileDropdown;
