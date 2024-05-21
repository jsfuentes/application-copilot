import { AxiosInstance, default as axiosBase } from "axios";

import { isDevMode } from "./utils";
const debug = require("debug")("app:shared:background");

//singletons are just to avoid multiple async calls, consider renaming this file singletons.ts when you need to add more utils
let eConfig: JSON; //singleton
export async function getExtendedConfig() {
  if (eConfig === undefined) {
    const userInfo =
      typeof chrome !== "undefined" && typeof chrome.identity !== "undefined"
        ? await chrome.identity.getProfileUserInfo()
        : {};
    debug("User info", userInfo);

    let config: JSON;
    if (isDevMode()) {
      config = require("../config/dev.json");
    } else {
      config = require("../config/prod.json");
    }

    // this won't change between calls
    eConfig = { ...config, ...userInfo };
  }

  return eConfig;
}

let axios: AxiosInstance;
export async function getAxios() {
  if (axios === undefined) {
    const eConfig = await getExtendedConfig();
    if (eConfig["env"] === "dev") {
      debug("Using axios base");
      axios = axiosBase.create();
    } else {
      debug("Using axios prod");
      axios = axiosBase.create({
        baseURL: eConfig["server_url"],
        // withCredentials: true
        /* other custom settings */
      });
    }
  }

  return axios;
}
