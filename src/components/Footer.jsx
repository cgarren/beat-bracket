import React, { useContext } from "react";
import Faq from "./Faq/Faq";
import FooterText from "./FooterText";
import { UserInfoContext } from "../context/UserInfoContext";

export default function Footer({ heightClass, path }) {
  const userInfo = useContext(UserInfoContext);
  return (
    <footer className={heightClass}>
      <div className="bg-black">
        <Faq loggedIn={Boolean(userInfo?.id)} path={path} />
        <FooterText />
      </div>
    </footer>
  );
}
