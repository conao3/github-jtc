import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { App } from "./app/App.tsx";
import "./index.css";

const rootElement = document.body.firstElementChild;

if (!(rootElement instanceof HTMLElement)) {
  throw new Error("Root element was not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
