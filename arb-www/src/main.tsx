import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import App from "../App.tsx";
import { USE_STRICT_MODE } from "./config";

const AppComponent = USE_STRICT_MODE ? (
  <StrictMode>
    <App />
  </StrictMode>
) : (
  <App />
);

createRoot(document.getElementById("root")!).render(AppComponent);
