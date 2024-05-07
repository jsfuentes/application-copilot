import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
const debug = require("debug")("app:popup");

import "../shared/dev_debug";
import { getAxios } from "../shared/background";

function Popup() {
  useEffect(() => {
    getAxios().then(axios => debug("Axios:", axios));
  }, []);

  return <button className="bg-red-500 p-2">Activate Superpowers</button>;
}

// Clear the existing HTML content
document.body.innerHTML = '<div id="app"></div>';

// Render your React component instead
const root = createRoot(document.getElementById("app") as HTMLElement);
root.render(<Popup />);
