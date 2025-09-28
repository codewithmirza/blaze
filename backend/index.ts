import 'dotenv/config';
import express from "express";
import './src/blockchain'; // Initialize blockchain service

import { verifyHandler } from "./src/verify";
import { initiatePaymentHandler } from "./src/initiate-payment";
import { confirmPaymentHandler } from "./src/confirm-payment";
import { 
  createTokenHandler,
  listTokensHandler,
  getTokenHandler,
  getPortfolioHandler,
  createQuestHandler,
  getQuestsHandler,
  getQuestHandler,
  getTradeQuoteHandler,
  buyTokenHandler,
  sellTokenHandler
} from "./src/api-handlers";
import cors from "cors";

const app = express();

// trust the proxy to allow HTTPS protocol to be detected
// https://expressjs.com/en/guide/behind-proxies.html
app.set("trust proxy", true);
// allow cors
app.use(cors());
// json middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// request logger middleware
app.use((req, _res, next) => {
  console.log(`logger: ${req.method} ${req.url}`);
  next();
});

app.get("/ping", (_, res) => {
  res.send("blaze-it-backend v1");
});

// World ID verification routes
app.post("/verify", verifyHandler);
app.post("/initiate-payment", initiatePaymentHandler);
app.post("/confirm-payment", confirmPaymentHandler);

// Token creation routes
app.post("/api/tokens", createTokenHandler);
app.get("/api/tokens", listTokensHandler);
app.get("/api/tokens/:tokenId", getTokenHandler);

// Trading routes
app.get("/api/trading/quote", getTradeQuoteHandler);
app.post("/api/trading/buy", buyTokenHandler);
app.post("/api/trading/sell", sellTokenHandler);

// Portfolio routes
app.get("/api/portfolio/:userId", getPortfolioHandler);

// Quest routes
app.post("/api/quests", createQuestHandler);
app.get("/api/quests", getQuestsHandler);
app.get("/api/quests/:questId", getQuestHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Blaze It backend listening on port ${port}`);
});
