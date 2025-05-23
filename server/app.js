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

const app = express();

// Middlewares
app.use(logger("dev"));
app.use(cors());
app.use("/temp", express.static(path.join(__dirname, "/server/temp")));

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

// Test endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: `Vanth ${config.env} Backend (version ${packageJson.version}) works fine`,
  });
});

// API routes
app.use("/api/v1", routes);

// Conexão com MongoDB
mongoose
  .onConnect()
  .then(() => {
    onConnectDb.init();
    console.log("✅ MongoDB conectado com sucesso!");
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar no MongoDB:", err);
  });

// Inicialização do servidor
app.listen(config.port, () => {
  console.log(`🚀 Servidor rodando na porta ${config.port}`);
});

export default app;
