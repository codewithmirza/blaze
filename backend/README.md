# Blaze It - Backend API

This is the backend API for the "Blaze It" World mini app, built with Express.js and TypeScript.

## Features

### 🔐 World ID Integration
- User verification using World ID
- Secure proof validation
- User authentication

### 🪙 Token Management
- Create new ERC20 tokens
- Token registry and metadata
- Bonding curve price calculation
- Protocol fee collection

### 📈 Trading System
- Buy/sell tokens with bonding curve pricing
- Real-time price quotes
- Slippage protection
- Trade history tracking

### 🎯 Quest System
- Create investment quests (Dream11-style)
- Portfolio submission and scoring
- Leaderboards and rankings
- Prize pool management

### 💼 Portfolio Tracking
- User portfolio overview
- Real-time PnL calculation
- Trade history
- Token analytics

## API Endpoints

### World ID Verification
- `POST /verify` - Verify World ID proof
- `POST /initiate-payment` - Initiate payment flow
- `POST /confirm-payment` - Confirm payment completion

### Token Management
- `POST /api/tokens` - Create new token
- `GET /api/tokens` - List all tokens
- `GET /api/tokens/:tokenId` - Get token details
- `PUT /api/tokens/:tokenId/contract` - Update contract address

### Trading
- `GET /api/trading/quote` - Get trade quote
- `POST /api/trading/buy` - Execute buy trade
- `POST /api/trading/sell` - Execute sell trade

### Portfolio
- `GET /api/portfolio/:userId` - Get user portfolio
- `GET /api/portfolio/:userId/trades` - Get trade history
- `GET /api/tokens/:tokenId/analytics` - Get token analytics
- `GET /api/tokens/:tokenId/leaderboard` - Get token leaderboard

### Quests
- `POST /api/quests` - Create new quest
- `GET /api/quests` - List quests
- `GET /api/quests/:questId` - Get quest details
- `POST /api/quests/:questId/submit` - Submit portfolio
- `GET /api/quests/:questId/leaderboard` - Get quest leaderboard
- `GET /api/users/:userId/submissions` - Get user submissions
- `PUT /api/quests/:questId/status` - Update quest status

## Setup

### Prerequisites
- Node.js 20+
- pnpm
- Supabase account
- World App Developer Portal account

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Copy environment variables:
```bash
cp env.example .env
```

3. Configure environment variables:
```env
# World App Configuration
APP_ID=app_your_app_id_here
DEV_PORTAL_API_KEY=your_dev_portal_api_key_here

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Smart Contract Addresses
TOKEN_FACTORY_ADDRESS=0x...
TREASURY_ADDRESS=0x...
```

4. Set up Supabase database:
```sql
-- Run the SQL migrations in supabase/migrations/
```

5. Start development server:
```bash
pnpm run dev
```

## Database Schema

### Tables
- `tokens` - Token registry and metadata
- `trades` - Trading history
- `portfolios` - User token holdings
- `quests` - Investment quests
- `quest_submissions` - User quest submissions

### Key Features
- Real-time portfolio tracking
- Bonding curve price calculation
- Quest scoring system
- Trade analytics

## Architecture

### Bonding Curve
- Linear pricing model: `price = base_price + (supply * slope)`
- Protocol fee collection (default 1%)
- Anti-sniping mechanisms
- Slippage protection

### Quest System
- Token slate selection
- Portfolio allocation scoring
- Real-time leaderboards
- Prize distribution

### Security
- World ID verification
- Input validation
- Rate limiting
- Error handling

## Development

### Scripts
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server

### Testing
- Unit tests for bonding curve calculations
- Integration tests for API endpoints
- End-to-end testing with MiniKit

## Deployment

### Cloudflare Workers
1. Install wrangler: `npm i -g wrangler`
2. Configure `wrangler.toml` and set vars/secrets
3. `wrangler dev` (local) then `wrangler deploy`

### Environment Variables
- `APP_ID` - World App ID
- `DEV_PORTAL_API_KEY` - World Developer Portal API key
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `TOKEN_FACTORY_ADDRESS` - Deployed TokenFactory contract
- `TREASURY_ADDRESS` - Treasury contract for fees

## API Documentation

### Request/Response Format
All API responses follow this format:
```json
{
  "success": boolean,
  "data": any,
  "error": string
}
```

### Error Handling
- 400: Bad Request (validation errors)
- 404: Not Found (resource not found)
- 500: Internal Server Error (server errors)

### Rate Limiting
- 100 requests per minute per IP
- 1000 requests per hour per user

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include comprehensive logging
4. Write unit tests
5. Update documentation

## License

MIT License - see LICENSE file for details