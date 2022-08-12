import React from "react";
import AuthBanner from "../components/AuthBanner";
import { pageStyles, pageMargin } from "./Layout.module.css";

const Layout = ({ children }) => {
  return (
    <main className={pageStyles}>
      <AuthBanner />
      <div className={pageMargin}>{children}</div>
    </main>
  );
};

export default Layout;
