import React, { useContext } from "react";
import NavBar from "./NavBar/NavBar";
import Clicky from "./Clicky";
import Footer from "./Footer";
import { LoginContext } from "../context/LoginContext";

const Layout = ({ children, noChanges, path }) => {
  const { loggedIn } = useContext(LoginContext);

  return (
    <>
      <Clicky />
      <div className="text-center clear-both">
        <main className="font-sans text-black bg-gradient-radial from-zinc-200 to-zinc-300 relative text-center min-h-screen pb-[24px]">
          {/* <div className="fixed w-full h-full top-0 left-0 bg-repeat bg-scroll bg-slate-900 bg-colosseum bg-blend-screen bg-cover opacity-40 -z-10"></div> */}
          <NavBar loggedIn={loggedIn} noChanges={noChanges} />
          {children}
        </main>
        <Footer loggedIn={loggedIn} path={path} />
      </div>
    </>
  );
};

export default Layout;
