import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// ✅ FIXED PATH
import "./styles/index.css";
import "./styles/tables.css";
import "./styles/panels.css";
import "./styles/login.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
