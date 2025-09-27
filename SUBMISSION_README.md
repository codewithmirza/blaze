# 🚀 Blaze It - World Mini App

**A complete token trading platform with quest-based investment system built for World App**

## 🎯 **Platform Overview**

Blaze It is a revolutionary World mini app that enables users to create, buy, and sell tokens/memecoins with an innovative swipe-based trading interface and quest-based investment competitions.

### ✨ **Key Features**

- **🪙 Token Creation**: Deploy ERC20 tokens with custom bonding curves
- **📱 Swipe Trading**: Right swipe = buy, left swipe = sell
- **🏆 Quest System**: Dream11-style investment competitions
- **📊 Portfolio Tracking**: Real-time PnL and holdings
- **🎮 Gamification**: Leaderboards and achievements
- **🔐 World ID Integration**: Secure human verification

## 🏗️ **Architecture**

### **Frontend (Vite + MiniKit)**
- **Framework**: Vite + Vanilla JS + MiniKit
- **Styling**: Tailwind CSS (Brutalist design)
- **Integration**: World App MiniKit SDK
- **Port**: 5173

### **Backend (Express + TypeScript)**
- **Framework**: Express.js + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: World ID verification
- **Port**: 3000

### **Smart Contracts (Solidity)**
- **Network**: Worldchain Sepolia
- **Contracts**: TokenFactory, BlazeToken, BondingCurve, Treasury
- **Features**: Linear bonding curve, protocol fees, anti-sniping

## 🚀 **Quick Start**

### **1. Prerequisites**
```bash
# Node.js 20+
node --version

# pnpm
npm install -g pnpm
```

### **2. Environment Setup**
```bash
# Backend environment (already configured)
cd backend
cp .env.example .env
# Update with your credentials

# Frontend environment
cd frontend
pnpm install
```

### **3. Start the Platform**
```bash
# Terminal 1: Start Backend
cd backend
pnpm run dev

# Terminal 2: Start Frontend  
cd frontend
pnpm run dev

# Terminal 3: Start Local Blockchain (for testing)
cd contracts
npx hardhat node
```

### **4. Access the Platform**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Local Blockchain**: http://localhost:8545

## 📡 **API Endpoints**

### **Token Management**
```bash
POST /api/tokens                    # Create new token
GET  /api/tokens                    # List all tokens
GET  /api/tokens/:id                # Get token details
PUT  /api/tokens/:id/contract       # Update contract address
```

### **Trading**
```bash
GET  /api/trading/quote             # Get trade quote
POST /api/trading/buy               # Buy tokens
POST /api/trading/sell              # Sell tokens
```

### **Portfolio**
```bash
GET  /api/portfolio/:userId         # Get user portfolio
GET  /api/portfolio/:userId/trades  # Get trade history
GET  /api/tokens/:id/analytics      # Get token analytics
GET  /api/tokens/:id/leaderboard    # Get token leaderboard
```

### **Quests**
```bash
POST /api/quests                    # Create quest
GET  /api/quests                    # List quests
GET  /api/quests/:id                # Get quest details
POST /api/quests/:id/submit         # Submit portfolio
GET  /api/quests/:id/leaderboard    # Get quest leaderboard
```

## 🗄️ **Database Schema**

### **Tables Created**
- `tokens` - Token registry and metadata
- `trades` - Trading history
- `portfolios` - User holdings and PnL
- `quests` - Quest competitions
- `quest_submissions` - User submissions

### **Features**
- Row Level Security (RLS) enabled
- Optimized indexes for performance
- JSONB support for complex data

## 🔧 **Smart Contracts**

### **Deployed Contracts**
- **Treasury**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **TokenFactory**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

### **Contract Features**
- ERC20 token standard
- Linear bonding curve pricing
- Protocol fee collection (1%)
- Anti-sniping mechanisms
- Ownership management

## 🎨 **UI/UX Design**

### **Brutalist Design Principles**
- Stark, spacious layouts
- High contrast colors
- Functional typography
- Minimalist interface
- Focus on usability

### **Components**
- Token creation form
- Swipe trading interface
- Quest dashboard
- Portfolio overview
- Leaderboard displays

## 🔐 **Security Features**

- **World ID Verification**: Human-only access
- **Smart Contract Security**: OpenZeppelin standards
- **Database Security**: RLS policies
- **Input Validation**: Comprehensive sanitization
- **Rate Limiting**: API protection

## 📊 **Performance Optimizations**

- **Database Indexing**: Optimized queries
- **Caching**: Redis integration ready
- **CDN**: Static asset delivery
- **Compression**: Gzip enabled
- **Lazy Loading**: Component-based loading

## 🧪 **Testing**

### **Backend Testing**
```bash
cd backend
pnpm test
```

### **Contract Testing**
```bash
cd contracts
npx hardhat test
```

### **Integration Testing**
```bash
# Test complete flow
curl -X POST http://localhost:3000/api/tokens \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Token","symbol":"TEST","creator_id":"user123","initial_supply":"100000000000000000000000000","basePrice":"1000000000000000","slope":"1000000000000","antiSnipingDelay":300}'
```

## 🚀 **Deployment**

### **Production Deployment**
1. **Backend**: Deploy to Vercel
2. **Frontend**: Deploy to Vercel
3. **Database**: Supabase (already configured)
4. **Contracts**: Deploy to Worldchain Mainnet

### **Environment Variables**
```env
# World App
APP_ID=your_app_id
DEV_PORTAL_API_KEY=your_api_key

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# Contracts
TREASURY_ADDRESS=0x...
TOKEN_FACTORY_ADDRESS=0x...
```

## 📈 **Business Model**

- **Protocol Fees**: 1% on all trades
- **Quest Entry Fees**: Configurable per quest
- **Premium Features**: Advanced analytics
- **Token Creation**: One-time deployment fee

## 🔮 **Future Roadmap**

- **Phase 1**: Core trading functionality ✅
- **Phase 2**: Quest system ✅
- **Phase 3**: Advanced analytics
- **Phase 4**: Mobile app
- **Phase 5**: Cross-chain support

## 📞 **Support**

For technical support or questions:
- **Documentation**: See individual README files
- **Issues**: GitHub issues
- **Community**: World App Discord

## 🏆 **Achievements**

✅ **Complete Backend API** - 20+ endpoints  
✅ **Smart Contracts** - Deployed and tested  
✅ **Database Schema** - Production ready  
✅ **Frontend Integration** - MiniKit ready  
✅ **Security** - World ID + RLS  
✅ **Performance** - Optimized queries  
✅ **Documentation** - Comprehensive guides  

---

**Built with ❤️ for the World App ecosystem**

*Ready for production deployment and user testing*
