-- Blaze It Database Schema for Cloudflare D1

-- Tokens table
CREATE TABLE IF NOT EXISTS tokens (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT UNIQUE NOT NULL,
  contract_address TEXT NOT NULL,
  bonding_curve_address TEXT,
  creator_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_supply TEXT NOT NULL,
  bonding_curve_params TEXT NOT NULL -- JSON string
);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  amount TEXT NOT NULL,
  price TEXT NOT NULL,
  tx_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (token_id) REFERENCES tokens(id)
);

-- Portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  user_id TEXT NOT NULL,
  token_id TEXT NOT NULL,
  balance TEXT NOT NULL DEFAULT '0',
  avg_buy_price TEXT NOT NULL DEFAULT '0',
  pnl TEXT NOT NULL DEFAULT '0',
  PRIMARY KEY (user_id, token_id),
  FOREIGN KEY (token_id) REFERENCES tokens(id)
);

-- Quests table
CREATE TABLE IF NOT EXISTS quests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  token_slate TEXT NOT NULL, -- JSON array of token IDs
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  prize_pool TEXT NOT NULL DEFAULT '0',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Quest submissions table
CREATE TABLE IF NOT EXISTS quest_submissions (
  id TEXT PRIMARY KEY,
  quest_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  portfolio TEXT NOT NULL, -- JSON object
  score REAL NOT NULL DEFAULT 0,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quest_id) REFERENCES quests(id)
);

-- Leaderboards table
CREATE TABLE IF NOT EXISTS leaderboards (
  quest_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  rank INTEGER NOT NULL,
  score REAL NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (quest_id, user_id),
  FOREIGN KEY (quest_id) REFERENCES quests(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_token_id ON trades(token_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_submissions_quest_id ON quest_submissions(quest_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_quest_id ON leaderboards(quest_id);