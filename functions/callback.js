import { finishAuth } from "../lib/oauth.js";
export const onRequestGet = (context) => finishAuth(context);
