import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

if (typeof window !== "undefined") {
  const resizeObserverError = (event) => {
    if (event?.message?.includes("ResizeObserver loop")) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  };
  window.addEventListener("error", resizeObserverError);
  window.addEventListener("unhandledrejection", resizeObserverError);

  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args?.[0]?.toString?.().includes("ResizeObserver loop")) return;
    originalConsoleError(...args);
  };
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <App />
);
