# Blaze It — Frontend (Vite + Vanilla JS + MiniKit)

Brutalist UI mini app with swipe-based trading, quests, and portfolio tracking. Uses MiniKit via CDN and Tailwind CSS.

## Structure
- `main.js`: App shell, navigation, MiniKit install
- `Trading/`: Swipe buy/sell component
- `Quests/`: Quest listing and submissions
- `Dashboard/`: Portfolio overview
- `CreateToken/`: Token creation flow
- `Verify/`, `Pay/`: MiniKit verification and payment blocks
- `abi/`: Contract ABIs
- `config.js`: App/contract/worldchain configuration

## Scripts
```bash
pnpm dev     # start Vite
pnpm build   # build for production
pnpm preview # preview build
pnpm cf:deploy # deploy to Cloudflare Pages (requires wrangler)
```

## MiniKit
Loaded via CDN in `main.js`:

```js
import { MiniKit } from "https://cdn.jsdelivr.net/npm/@worldcoin/minikit-js@1.1.1/+esm";
MiniKit.install();
```

Use `MiniKit.commandsAsync.verify()`, `MiniKit.commandsAsync.transaction()`, `MiniKit.commandsAsync.pay()` for user actions.

## Env
Create `./.env` with:
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

## Dev Notes
- The proxy in `nginx.conf` serves frontend at `/` and backend at `/api` for a single Ngrok tunnel.
- `Trading/index.js` currently loads tokens and stubs buy/sell execution; wire with MiniKit `transaction()` next.
 - Cloud: Deploy frontend on Cloudflare Pages; backend on Cloudflare Workers.
