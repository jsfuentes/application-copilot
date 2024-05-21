import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

function Controls() {
  return <div className="">Controls</div>;
}

export default function addControls() {
  // Clear the existing HTML content
  //   document.body.innerHTML = '<div id="app"></div>';
  const element = document.createElement("div");
  element.id = "application-copilot-id";
  element.style.position = "fixed";
  element.style.top = "0";
  element.style.right = "0";
  element.style.backgroundColor = "#f0f0f0";
  element.style.padding = "10px";
  element.style.borderRadius = "5px";
  element.style.zIndex = "99999999";

  document.body.appendChild(element);
  // Render your React component instead

  const root = createRoot(
    document.getElementById("application-copilot-id") as HTMLElement,
  );
  root.render(<Controls />);
}
