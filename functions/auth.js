import { startAuth } from "../lib/oauth.js";
export const onRequestGet = (context) => startAuth(context);
