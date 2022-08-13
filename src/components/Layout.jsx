import React from "react";
import { Helmet } from "react-helmet";
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
      <Helmet>
        <title>Song Coliseum</title>
      </Helmet>
      <AuthBanner />
      <div className={pageMargin}>
        <h1 className={headerStyle}>Song Coliseum ⚔️🛡️</h1>
        <h4 className={subHeaderStyle}>There can only be one winner...</h4>
        {children}
      </div>
    </main>
  );
};

export default Layout;
