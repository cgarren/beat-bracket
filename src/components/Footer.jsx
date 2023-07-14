import React from "react";
import Faq from "./Faq/Faq";
import FooterText from "./FooterText";

const Footer = ({ heightClass, loggedIn, path }) => {
  return (
    <footer className={heightClass}>
      <div className="bg-black">
        <Faq loggedIn={loggedIn} path={path} />
        <FooterText />
      </div>
    </footer>
  );
};

export default Footer;
