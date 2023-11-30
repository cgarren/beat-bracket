import React, { useEffect, useState, useContext, useMemo } from "react";
import guestProfileImage from "../../assets/images/guestProfileImage.png";
import LoginButton from "../LoginButton";
import LoadingIndicator from "../LoadingIndicator";
import { LoginContext } from "../../context/LoginContext";
import { useAuthentication } from "../../hooks/useAuthentication";
import { useHelper } from "../../hooks/useHelper";

export default function ProfileDropdown({ noChanges }) {
    const { userInfo, loginInProgress, loggedIn } = useContext(LoginContext);
    const { logout } = useAuthentication();
    const { handleNaviagtionAttempt } = useHelper();
    const [showDropdown, setShowDropdown] = useState(false);
    const defaultUserInfo = useMemo(() => {
        return {
            display_name: "Guest",
            id: "",
            images: [
                {
                    url: guestProfileImage,
                },
            ],
        };
    }, []);
    const [shownUserInfo, setShownUserInfo] = useState(defaultUserInfo);

    useEffect(() => {
        if (loggedIn && userInfo) {
            setShownUserInfo(userInfo);
        } else {
            setShownUserInfo(defaultUserInfo);
        }
    }, [loggedIn, userInfo, defaultUserInfo]);

    return (
        <div>
            {!loggedIn || loginInProgress ? (
                !loginInProgress ? (
                    <LoginButton variant="bordered" />
                ) : (
                    <LoadingIndicator />
                )
            ) : (
                <div className="inline-block relative">
                    <button
                        type="button"
                        className="flex items-center rounded-lg transition group shrink-0 border-0 hover:bg-transparent px-0 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50"
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
                            alt="Profile avatar"
                            title={`${shownUserInfo.display_name}'s Profile picture from Spotify`}
                        />
                        <p className="hidden ml-2 text-left sm:block">
                            <strong className="block text-s font-bold text-white">
                                {shownUserInfo.display_name}
                            </strong>
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
                        className="absolute right-0 bg-white text-base z-40 list-none divide-y divide-gray-100 rounded shadow w-full cursor-pointer min-w-fit"
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
                                onClick={() => {
                                    setShowDropdown(false);
                                    handleNaviagtionAttempt(
                                        "/my-brackets",
                                        noChanges
                                    );
                                }}
                                className="py-2 px-4 items-center whitespace-nowrap flex gap-1 group-hover:bg-gray-200 border-0 w-full group focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50"
                            >
                                <span>My Brackets</span>
                            </button>
                            <button
                                onClick={() => {
                                    if (noChanges(true)) {
                                        setShowDropdown(false);
                                        logout();
                                    }
                                }}
                                className="py-2 px-4 items-center rounded-t-none whitespace-nowrap flex gap-1 group-hover:bg-gray-200 border-0 w-full group focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50"
                            >
                                <span>Log out</span>
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
            )}
        </div>
    );
}
