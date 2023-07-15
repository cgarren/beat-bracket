import React, { createContext, useState, useEffect } from "react";
import { isLoggedIn } from "../utilities/authentication";
export const LoginContext = createContext([null, () => {}]);

export function LoginProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  //const [, updateState] = useState();
  useEffect(() => {
    // check if user is logged in when the localstorage changes
    window.onstorage = () => {
      setLoggedIn(isLoggedIn());
    };
    return () => {
      window.onstorage = null;
    };
  }, []);

  // useEffect(() => {
  //   //updateState({});
  //   // check if user is logged in when the localstorage changes
  //   window.onstorage = () => {
  //     console.log("storage changed");
  //     updateState({});
  //   };

  //   return () => {
  //     window.onstorage = null;
  //   };
  // }, []);

  return (
    <LoginContext.Provider value={{ loggedIn, setLoggedIn }}>
      {children}
    </LoginContext.Provider>
  );
}
