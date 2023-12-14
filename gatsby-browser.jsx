import "@fontsource/righteous";
import "./global-styles.css";

import React from "react";
import mixpanel from "mixpanel-browser";
import { ErrorBoundary } from "react-error-boundary";

import { LoginProvider } from "./src/context/LoginContext";
import { MixpanelProvider } from "./src/context/MixpanelContext";

if (process.env.GATSBY_MIXPANEL_TOKEN && process.env.GATSBY_BACKEND_URL) {
  if (process.env.NODE_ENV !== "production") {
    mixpanel.init(process.env.GATSBY_MIXPANEL_TOKEN, {
      debug: true,
    });
    mixpanel.disable();
  } else {
    mixpanel.init(process.env.GATSBY_MIXPANEL_TOKEN);
  }
  mixpanel.set_config({ persistence: "localStorage", ignore_dnt: true, api_host: process.env.GATSBY_BACKEND_URL });
} else {
  console.warn("Mixpanel token not set");
}

// eslint-disable-next-line import/prefer-default-export
export function wrapRootElement({ element }) {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <MixpanelProvider mixpanel={mixpanel}>
        <LoginProvider>{element}</LoginProvider>
      </MixpanelProvider>
    </ErrorBoundary>
  );
}
