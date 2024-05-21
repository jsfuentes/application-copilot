import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { llmGenerate } from "../shared/utils";
const debug = require("debug")("app:popup");

import "../shared/dev_debug";
import { getAxios } from "../shared/background";

function Popup() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  useEffect(() => {
    getAxios().then((axios) => debug("Axios:", axios));
  }, []);

  function sendToLlama() {
    debug("Sending to llama", prompt);
    getAxios().then(async (axios) => {
      const resp = await llmGenerate(axios, prompt);
      setResponse(resp);
    });
  }

  return (
    <div>
      <input
        type="text"
        className="w-full border border-1 border-gray-400"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button className="bg-blue-200 p-2" onClick={sendToLlama}>
        Send to LLAMA
      </button>
      {response && (
        <div className=" mt-1 bg-gray-200 p-4 w-full">{response}</div>
      )}
    </div>
  );
}

// Clear the existing HTML content
document.body.innerHTML = '<div id="app"></div>';

// Render your React component instead
const root = createRoot(document.getElementById("app") as HTMLElement);
root.render(<Popup />);
