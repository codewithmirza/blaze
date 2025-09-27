import express from "express";

import { verifyHandler } from "./src/verify";
import { initiatePaymentHandler } from "./src/initiate-payment";
import { confirmPaymentHandler } from "./src/confirm-payment";
import { 
  createTokenHandler, 
  getTokenHandler, 
  listTokensHandler, 
  updateTokenContractHandler 
} from "./src/token-creation";
import { 
  getTradeQuoteHandler, 
  buyTokenHandler, 
  sellTokenHandler 
} from "./src/trading";
import { 
  getPortfolioHandler, 
  getTradeHistoryHandler, 
  getTokenAnalyticsHandler, 
  getTokenLeaderboardHandler 
} from "./src/portfolio";
import { 
  createQuestHandler, 
  getQuestsHandler, 
  getQuestHandler, 
  submitPortfolioHandler, 
  getQuestLeaderboardHandler, 
  getUserSubmissionsHandler, 
  updateQuestStatusHandler 
} from "./src/quests";
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
app.put("/api/tokens/:tokenId/contract", updateTokenContractHandler);

// Trading routes
app.get("/api/trading/quote", getTradeQuoteHandler);
app.post("/api/trading/buy", buyTokenHandler);
app.post("/api/trading/sell", sellTokenHandler);

// Portfolio routes
app.get("/api/portfolio/:userId", getPortfolioHandler);
app.get("/api/portfolio/:userId/trades", getTradeHistoryHandler);
app.get("/api/tokens/:tokenId/analytics", getTokenAnalyticsHandler);
app.get("/api/tokens/:tokenId/leaderboard", getTokenLeaderboardHandler);

// Quest routes
app.post("/api/quests", createQuestHandler);
app.get("/api/quests", getQuestsHandler);
app.get("/api/quests/:questId", getQuestHandler);
app.post("/api/quests/:questId/submit", submitPortfolioHandler);
app.get("/api/quests/:questId/leaderboard", getQuestLeaderboardHandler);
app.get("/api/users/:userId/submissions", getUserSubmissionsHandler);
app.put("/api/quests/:questId/status", updateQuestStatusHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Blaze It backend listening on port ${port}`);
});
