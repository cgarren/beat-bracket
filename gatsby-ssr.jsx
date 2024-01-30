import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// This file is to make gatsby build work with tanstack query

// Create a query client
const queryClient = new QueryClient();

// eslint-disable-next-line import/prefer-default-export
export function wrapRootElement({ element }) {
  return <QueryClientProvider client={queryClient}>{element}</QueryClientProvider>;
}
