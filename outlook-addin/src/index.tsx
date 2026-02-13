import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/globals.css";

window.addEventListener("error", (event) => {
});

window.addEventListener("unhandledrejection", (event) => {
});

// Initialize Office.js before rendering the React app
Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    const container = document.getElementById("root");
    if (container) {
      const root = createRoot(container);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    }
  }
});
