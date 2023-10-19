/* eslint-disable global-require */
import dotEnv from "dotenv";
dotEnv.config();
import { credentials } from "./configHelper";
const { ENV_TYPE } = process.env;
console.log("ENV_TYPE", ENV_TYPE);
const config = credentials(ENV_TYPE);

export default config;
