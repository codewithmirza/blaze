# Blaze It - Testing Guide

## 🚀 Your App is Ready for Testing!

### App ID
```
app_c3673cdb0b80dceade939081853805d4
```

### Current Status
- ✅ **Backend**: Running on http://localhost:3000
- ✅ **Frontend**: Running on http://localhost:5173
- ✅ **Database**: Supabase connected
- ✅ **Smart Contracts**: Deployed locally

## 📱 Testing Methods

### Method 1: Direct Browser Testing
1. Open your browser
2. Go to: `http://localhost:5173`
3. Click the **TEST** tab
4. Scan the QR code with your phone
5. Test in World App

### Method 2: Ngrok Tunnel (Recommended)
1. Install Ngrok: https://ngrok.com/download
2. Run: `ngrok http 5173`
3. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
4. Update your App ID in World Developer Portal with the Ngrok URL
5. Test via QR code

### Method 3: Mobile Testing
1. Connect your phone to the same WiFi
2. Find your computer's IP address
3. Access: `http://YOUR_IP:5173`
4. Test the app on mobile

## 🧪 Testing Checklist

### Trading Features
- [ ] Swipe right to buy tokens
- [ ] Swipe left to sell tokens
- [ ] Token cards display correctly
- [ ] Backend API responds to trades

### Quest Features
- [ ] View available quests
- [ ] Select quest and create portfolio
- [ ] Submit portfolio allocation
- [ ] View leaderboards

### Dashboard Features
- [ ] View portfolio holdings
- [ ] Check trade history
- [ ] See PnL calculations

### World App Integration
- [ ] QR code scans successfully
- [ ] World ID verification works
- [ ] MiniKit commands execute
- [ ] Transactions process correctly

## 🔧 Troubleshooting

### If QR Code Doesn't Work
1. Check your App ID is correct
2. Ensure Ngrok tunnel is running
3. Verify backend is accessible
4. Check World App is updated

### If Backend Errors
1. Check Supabase connection
2. Verify environment variables
3. Restart backend server
4. Check contract addresses

### If Frontend Issues
1. Clear browser cache
2. Check console for errors
3. Restart Vite dev server
4. Verify React components load

## 📊 Test Data

### Sample Tokens (from backend)
- BlazeCoin (BLAZE) - 1,000,000 supply
- Available for trading via swipe interface

### Sample Quests
- Token Investment Competition
- Prize Pool: 1 WLD
- Status: Active

## 🎯 Success Criteria

Your Blaze It app is working correctly when:
- ✅ All 4 tabs load without errors
- ✅ QR code generates and scans
- ✅ Trading interface responds to swipes
- ✅ Quest system allows portfolio submission
- ✅ Dashboard shows portfolio data
- ✅ World App integration works

## 🚀 Ready for Submission!

Once all tests pass, your Blaze It platform is ready for World App submission!

### Next Steps
1. Complete testing checklist
2. Take screenshots/videos
3. Prepare submission materials
4. Submit to World Developer Portal

---

**Good luck with your Blaze It submission! 🔥**
