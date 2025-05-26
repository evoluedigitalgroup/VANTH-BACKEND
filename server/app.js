import cors from "cors";
import ejs from "ejs";
import express from "express";
import logger from "morgan";
import path from "path";

import packageJson from "../package.json";
import config from "./config/index";
import onConnectDb from "./helpers/scripts/onConnectDb";
import routes from "./routes";
import mongoose from "./services/mongoose";

var app = express();

app.use(logger("dev"));
app.use(cors());
app.use("temp", express.static(__dirname + "/server" + "/temp"));

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: false }));

app.use("/", express.static(path.join(__dirname, "../public")));

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejs.__express);

// Health check endpoint para Elastic Beanstalk
app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: `Vanth ${config.env} Backend (version ${packageJson.version}) works fine`,
  });
});

app.use("/api/v1", routes);

// Conexão com MongoDB
mongoose
  .onConnect()
  .then(() => {
    onConnectDb.init();
    console.log("✅ MongoDB conectado com sucesso!");
  })
  .catch(err => {
    console.error("❌ Erro ao conectar no MongoDB:", err);
  });

// Inicialização do servidor
app.listen(config.port, () => {
  console.log(`🚀 Servidor rodando na porta ${config.port}`);
});

export default app;
