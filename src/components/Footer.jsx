import React, { useContext } from "react";
import Faq from "./Faq/Faq";
import FooterText from "./FooterText";
import { LoginContext } from "../context/LoginContext";

export default function Footer({ heightClass, path }) {
  const { isLoggedIn } = useContext(LoginContext);
  return (
    <footer className={heightClass}>
      <div className="bg-black">
        <Faq loggedIn={isLoggedIn()} path={path} />
        <FooterText />
      </div>
    </footer>
  );
}
