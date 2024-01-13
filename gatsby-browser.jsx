import "@fontsource/righteous";
import "./global-styles.css";

import React from "react";
import mixpanel from "mixpanel-browser";
import { ErrorBoundary } from "react-error-boundary";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

import { LoginProvider } from "./src/context/LoginContext";
import { MixpanelProvider } from "./src/context/MixpanelContext";

// Create a query client
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error(error);
      if (error?.cause?.code === 429) {
        toast.error("The server is busy right now. Try again in a few minutes!", { id: "429" });
      } else if (error?.cause?.code === 403) {
        toast.error("User not authenticated. Please login again!", { id: "403" });
      } else if (query?.meta?.errorMessage) {
        toast.error(query.meta.errorMessage);
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error("Unknown error occured");
      }
    },
  }),
});

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
        <LoginProvider>
          <QueryClientProvider client={queryClient}>{element}</QueryClientProvider>
        </LoginProvider>
      </MixpanelProvider>

      <Toaster
        toastOptions={{
          error: {
            duration: 6000,
          },
        }}
      />
    </ErrorBoundary>
  );
}
