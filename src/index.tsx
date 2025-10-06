import { Buffer } from "buffer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { config } from "./wagmi.ts";
import { logEnvironmentConfig } from "./config/env.ts";
import "./index.css";
import { StyledEngineProvider } from "@mui/material/styles";
import GlobalStyles from "@mui/material/GlobalStyles";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

globalThis.Buffer = Buffer;

// Log environment configuration on startup
logEnvironmentConfig();

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <StyledEngineProvider injectFirst>
            <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
            <App />
          </StyledEngineProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
