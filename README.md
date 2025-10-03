# Blaze It — World Mini App

Brutalist, swipe-based trading for creating, buying, and selling memecoins on Worldchain Sepolia. Built with Vite + Vanilla JS + MiniKit on the frontend and Express.js + TypeScript on the backend, with Supabase for off-chain data.

## Tech Stack
- Frontend: Vite, Vanilla JS, Tailwind CSS, MiniKit (`MiniKit.commandsAsync.verify/transaction/pay`)
- Backend: Express.js, TypeScript
- Database: Supabase
- Blockchain: Worldchain Sepolia (via MiniKit, gas sponsored by World App)
- Deployment: Vercel (frontend + backend)
- Dev Proxy/Tunnel: Nginx + Ngrok

## Features
- Swipe trading: right = buy, left = sell
- Token creation via factory + bonding curve pricing
- Quest competitions (Dream11-style portfolios) with leaderboards
- Portfolio tracking with PnL
- Gas fees treated as transaction fees; 1% protocol fee to treasury

## Monorepo Structure
```
frontend/           # Vite app with MiniKit components
backend/            # Express + TypeScript API
contracts/          # Hardhat Solidity: TokenFactory, BondingCurve, Treasury
nginx.conf          # Dev reverse proxy (ports: 5173 -> frontend, 3000 -> backend)
```

## Quickstart (Local Dev)
1) Install deps
```bash
cd frontend && pnpm i && cd - && cd backend && pnpm i && cd -
```

2) Start apps
```bash
# frontend (Vite)
cd frontend && pnpm dev
# backend (Express)
cd backend && pnpm dev
```

3) Run Nginx reverse proxy
```bash
sudo nginx -c $(pwd)/nginx.conf
# stop with
sudo nginx -s stop
```

4) Expose via Ngrok (optional for MiniKit testing in app)
```bash
ngrok http 8080
```

Visit http://localhost:8080

## Environment Variables

Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=https://your-backend.vercel.app
VITE_APP_ID=app_your_app_id
VITE_TOKEN_FACTORY_ADDRESS=0x...
VITE_TREASURY_ADDRESS=0x...
VITE_BONDING_CURVE_ADDRESS=0x...
VITE_BLAZE_TOKEN_ADDRESS=0x...
VITE_CHAIN_ID=480
VITE_RPC_URL=https://worldchain-sepolia.g.alchemy.com/v2/yourKey
```

Backend (`backend/.env`)
```
APP_ID=app_your_app_id
DEV_PORTAL_API_KEY=your_dev_portal_api_key
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
TOKEN_FACTORY_ADDRESS=0x...
TREASURY_ADDRESS=0x...
```

## Key Frontend Modules
- `frontend/main.js`: app shell, brutalist UI, navigation
- `frontend/Trading/index.js`: swipe buy/sell; connects to `/api/tokens` and `/api/trading/*`
- `frontend/Quests/index.js`: quest list/submit flow
- `frontend/Dashboard/index.js`: portfolio overview
- `frontend/CreateToken/index.js`: token creation via factory
- `frontend/Verify` and `frontend/Pay`: MiniKit flows

MiniKit is installed via CDN and used through `MiniKit.commandsAsync.*` with World App gas sponsorship.

## API Highlights
Backend base URL proxied at `/api` via Nginx. Selected routes:
- World ID: `POST /verify`, `POST /initiate-payment`, `POST /confirm-payment`
- Tokens: `POST /api/tokens`, `GET /api/tokens`, `GET /api/tokens/:tokenId`
- Trading: `GET /api/trading/quote`, `POST /api/trading/buy`, `POST /api/trading/sell`
- Portfolio: `GET /api/portfolio/:userId`
- Quests: `POST /api/quests`, `GET /api/quests`, `GET /api/quests/:questId`

## Development Workflow
1. Keep Vite + Express split; iterate components and handlers in parallel
2. Use Supabase for off-chain state (tokens, trades, portfolios, quests)
3. Use MiniKit verify/transaction/pay for all user actions
4. Test via Nginx + Ngrok; deploy to Vercel

## Next Up (Roadmap)
- Implement MiniKit-powered buy/sell execution in `frontend/Trading/index.js`
- Wire real bonding-curve quotes using `backend/src/bonding-curve.ts`
- Complete quests UI and submissions; show leaderboards
- Portfolio PnL calculations and token analytics endpoints
- Contract address wiring and on-chain tx data in handlers

## World App Compliance
- Verify with World ID, use approved MiniKit patterns, and test gas sponsorship end-to-end before submission.
