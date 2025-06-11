import "@fontsource/righteous";
// Supports weights 100-900 in a single small file.
import "@fontsource-variable/roboto-flex";
import "./global-styles.css";

import React, { StrictMode } from "react";
import mixpanel from "mixpanel-browser";
import { ErrorBoundary } from "react-error-boundary";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { enableMapSet } from "immer";

import { LoginProvider } from "./src/context/LoginContext";
import { MixpanelProvider } from "./src/context/MixpanelContext";
import { UserInfoProvider } from "./src/context/UserInfoContext";

// Enable Map/Set in immer
enableMapSet();

// Create a query client
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error(error);
      if (error?.cause?.code === 429) {
        toast.error("Traffic is high right now. Try again in a few minutes!", { id: "tooManyRequests" });
      } else if (error?.cause?.code === 403) {
        toast.error("User not authenticated. Please login!", { id: "unauthenticated" });
      } else if (error?.cause?.code === 401) {
        toast.error("User not authenticated. Please login!", { id: "unauthenticated" });
      } else if (query?.meta?.errorMessage) {
        toast.error(query.meta.errorMessage, { id: query.meta.errorMessage });
      } else if (query?.meta?.errorMessage === false) {
        // do nothing
      } else if (error?.message) {
        toast.error(error.message, { id: error.message });
      } else {
        toast.error("Unknown error occured");
      }
    },
    onSuccess: (data, query) => {
      if (query.meta?.successMessage) {
        toast.success(query.meta.successMessage);
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, variables, context, mutation) => {
      console.error(error);
      if (error?.cause?.code === 429) {
        toast.error("Traffic is high right now. Try again in a few minutes!", { id: "429" });
      } else if (error?.cause?.code === 403) {
        toast.error("User not authenticated. Please login!", { id: "403" });
      } else if (mutation?.meta?.errorMessage) {
        toast.error(mutation.meta.errorMessage);
      } else if (mutation?.meta?.errorMessage === false) {
        // do nothing
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Unknown error occured");
      }
    },
    onSuccess: (data, variables, context, mutation) => {
      if (mutation.meta?.successMessage) {
        toast.success(mutation.meta.successMessage);
      }
    },
  }),
  defaultOptions: {
    queries: {
      retryDelay: (attemptIndex, error) => {
        let startingDelay = 1000;
        let maxDelay = 30000;
        if (error?.cause?.code === 429) {
          startingDelay = 5000;
          maxDelay = 60000;
        }
        Math.min(startingDelay * 2 ** attemptIndex, maxDelay);
      },
    },
  },
});

if (process.env.GATSBY_MIXPANEL_TOKEN && process.env.GATSBY_BACKEND_URL) {
  if (process.env.NODE_ENV !== "production") {
    mixpanel.init(process.env.GATSBY_MIXPANEL_TOKEN, {
      debug: true,
      record_sessions_percent: 1,
    });
    // mixpanel.disable();
  } else {
    mixpanel.init(process.env.GATSBY_MIXPANEL_TOKEN);
  }
  mixpanel.set_config({ persistence: "localStorage", ignore_dnt: true, api_host: process.env.GATSBY_BACKEND_URL });
} else {
  console.warn("Mixpanel token not set");
}

// export function wrapPageElement({ element }) {
//   return (
//     <>
//       <Toaster position="top-right" containerStyle={{ marginTop: "60px" }} />
//       {element}
//     </>
//   );
// }

// eslint-disable-next-line import/prefer-default-export
export function wrapRootElement({ element }) {
  return (
    <StrictMode>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        {/* <SpotifyInterceptor> */}
        <MixpanelProvider mixpanel={mixpanel}>
          <LoginProvider>
            <QueryClientProvider client={queryClient}>
              <UserInfoProvider>{element}</UserInfoProvider>
            </QueryClientProvider>
          </LoginProvider>
        </MixpanelProvider>
        {/* </SpotifyInterceptor> */}
      </ErrorBoundary>
    </StrictMode>
  );
}
