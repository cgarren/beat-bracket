import React from "react";
import AuthBanner from "../components/AuthBanner";
import {
  pageStyles,
  pageMargin,
  headerStyle,
  subHeaderStyle,
} from "./Layout.module.css";

const Layout = ({ children }) => {
  return (
    <main className={pageStyles}>
      <AuthBanner />
      <div className={pageMargin}>
        <title>Song Coliseum</title>
        <h1 className={headerStyle}>Song Coliseum ⚔️🛡️</h1>
        <h4 className={subHeaderStyle}>There can only be one winner...</h4>
        {children}
      </div>
    </main>
  );
};

export default Layout;
