import express from "express";
import path from "path";
import logger from "morgan";
import cors from "cors";
import ejs from "ejs";

import routes from "./routes";
import onConnectDb from "./helpers/scripts/onConnectDb";
import mongoose from "./services/mongoose";
import config from "./config/index";
import packageJson from "../package.json";
// import { dirname } from "path";
// import { fileURLToPath } from "url";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

var app = express();

app.use(logger("dev"));
app.use(cors());
app.use("temp", express.static(__dirname + "/server" + "/temp"));

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: false }));

app.use("/", express.static(path.join(__dirname, "../public")));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejs.__express);

mongoose
  .onConnect()
  .then(() => {
    onConnectDb.init();
    console.log("DB CONNECTED !!....");
    //  on Connect mongoose
  })
  .catch(err => {
    console.error("error on connect do mongoose : ", err);
    //  on catch mongoose
  });

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: `Vanth ${config.env} Backend (version ${packageJson.version}) works fine`,
  });
});

app.use("/api/v1", routes);

export default app;
