import React, { useContext } from "react";
import Faq from "./Faq/Faq";
import FooterText from "./FooterText";
import { LoginContext } from "../context/LoginContext";

const Footer = ({ heightClass, path }) => {
    const { loggedIn } = useContext(LoginContext);
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
