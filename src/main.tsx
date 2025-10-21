import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import Popup from "./components/Popup.tsx";
import React from "react";

console.log(`Renderer src/main.tsx - Initial hash: ${window.location.hash}`);

const rootElement = document.getElementById("root")!;
const currentHash = window.location.hash;
console.log(`Current hash: ${currentHash}`);

if (currentHash === "#popup") {
  createRoot(rootElement).render(<Popup />);
} else {
  createRoot(rootElement).render(<App />);
}
