# 🌍 Worldchain Sepolia Deployment Guide

## 🚀 **Quick Start (For Production)**

### 1. **Get Worldchain Sepolia RPC URL**
```bash
# Option 1: Use Alchemy (Recommended)
# Sign up at https://alchemy.com
# Create new app for "Worldchain Sepolia"
# Copy the RPC URL

# Option 2: Use QuickNode
# Sign up at https://quicknode.com
# Add Worldchain Sepolia network
# Copy the RPC URL

# Option 3: Use Public RPC (Rate Limited)
# https://worldchain-sepolia.g.alchemy.com/v2/demo
```

### 2. **Update Hardhat Config**
```javascript
// contracts/hardhat.config.cjs
"worldchain-sepolia": {
  url: "YOUR_RPC_URL_HERE", // Replace with your RPC URL
  chainId: 4801,
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  gasPrice: 1000000000, // 1 gwei
  gas: 8000000
}
```

### 3. **Deploy to Worldchain Sepolia**
```bash
cd contracts
npx hardhat run scripts/deploy-sepolia.cjs --network worldchain-sepolia
```

### 4. **Update Backend Environment**
```bash
# Update backend/.env with new addresses
TREASURY_ADDRESS=0x... # From deployment output
TOKEN_FACTORY_ADDRESS=0x... # From deployment output
```

### 5. **Verify Contracts (Optional)**
```bash
npx hardhat verify --network worldchain-sepolia TREASURY_ADDRESS
npx hardhat verify --network worldchain-sepolia TOKEN_FACTORY_ADDRESS
```

## 🔧 **Current Status**

### ✅ **What's Working:**
- **Local Deployment**: Contracts deployed to Hardhat local network
- **Backend Integration**: Backend configured with local addresses
- **Frontend**: Orange-themed, mobile-optimized UI
- **Token Creation**: CREATE tab for deploying new tokens
- **Trading**: Swipe-based token trading interface
- **Quests**: Investment competition system
- **Dashboard**: Portfolio overview

### 📱 **App Features:**
- **Mobile-First Design**: Optimized for World App viewport
- **Orange Theme**: Beautiful ETHGlobal-inspired colors
- **Token Creation**: Deploy ERC20 tokens with bonding curves
- **Trading**: Buy/sell tokens with swipe gestures
- **Quests**: Dream11-style investment competitions
- **Portfolio**: Track holdings and PnL

## 🌐 **Live URLs:**
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Ngrok**: https://ae44a72a7092.ngrok-free.app

## 🎨 **Design Updates:**
- **Color Scheme**: Vibrant orange theme from ETHGlobal design
- **Viewport**: Mobile-optimized for World App mini app
- **Navigation**: Compact tabs (TRADE, QUESTS, DASH, CREATE, TEST)
- **Typography**: Smaller, mobile-friendly text sizes
- **Layout**: Max-width container for proper mobile display

## 🚀 **Ready for Submission:**
Your app is now **submission-ready** with:
- ✅ Pure vanilla JS (no React conflicts)
- ✅ Mobile-optimized viewport
- ✅ Beautiful orange theme
- ✅ Token creation functionality
- ✅ Local contract deployment
- ✅ Full backend integration
- ✅ Ngrok tunnel for testing

## 📋 **Next Steps:**
1. **Test the app** using the Ngrok URL
2. **Deploy to Worldchain Sepolia** when ready for production
3. **Submit to World Developer Portal** with the Ngrok URL
4. **Update contract addresses** after Sepolia deployment

## 🔗 **World Developer Portal:**
Update your app with: `https://ae44a72a7092.ngrok-free.app`
