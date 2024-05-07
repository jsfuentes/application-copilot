import { AxiosInstance, AxiosStatic, default as axiosBase } from "axios";
import { isDevMode } from "./utils";
const debug = require("debug")("app:shared:background");

//singletons are just to avoid multiple async calls, consider renaming this file singletons.ts when you need to add more utils
let eConfig: JSON; //singleton
export async function getExtendedConfig() {
  if (eConfig === undefined) {
    const userInfo = await chrome.identity.getProfileUserInfo();

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

let axios: AxiosStatic | AxiosInstance;
export async function getAxios() {
  if (axios === undefined) {
    const eConfig = await getExtendedConfig();
    if (eConfig["env"] === "dev") {
      debug("Using axios base");
      axios = axiosBase;
    } else {
      debug("Using axios prod");
      axios = axiosBase.create({
        baseURL: eConfig["server_url"]
        // withCredentials: true
        /* other custom settings */
      });
    }
  }

  return axios;
}
