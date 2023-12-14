import React from "react";
import { Script } from "gatsby";

export default function Clicky() {
  return (
    <>
      <Script src="//static.getclicky.com/101396268.js" />
      <noscript>
        <p>
          <img alt="Clicky" width="1" height="1" src="//in.getclicky.com/101396268ns.gif" />
        </p>
      </noscript>
    </>
  );
}
