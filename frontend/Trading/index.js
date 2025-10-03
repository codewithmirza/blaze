// Trading Component - Swipe-based token trading
import { getApiUrl } from "../config.js";
let tokens = [];
let currentTokenIndex = 0;
let swipeDirection = null;
let isLoading = true;

// Load tokens from backend
const loadTokens = async () => {
  try {
    const response = await fetch(getApiUrl('/api/tokens'));
    const data = await response.json();
    if (data.success) {
      tokens = data.tokens;
    }
  } catch (error) {
    console.error('Error loading tokens:', error);
  } finally {
    isLoading = false;
  }
};

const handleSwipe = (direction) => {
  swipeDirection = direction;
  
  if (direction === 'right') {
    handleBuyToken();
  } else if (direction === 'left') {
    handleSellToken();
  }
  
  // Move to next token after a delay
  setTimeout(() => {
    currentTokenIndex = (currentTokenIndex + 1) % tokens.length;
    swipeDirection = null;
    // Re-render the content
    document.getElementById('content').innerHTML = TradingBlock();
  }, 1000);
};

const handleBuyToken = async () => {
  if (!tokens[currentTokenIndex]) return;
  
  try {
    const token = tokens[currentTokenIndex];
    const response = await fetch(getApiUrl('/api/trading/quote'), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    // TODO: Implement actual buy logic with MiniKit
    console.log('Buying token:', token.symbol);
  } catch (error) {
    console.error('Error buying token:', error);
  }
};

const handleSellToken = async () => {
  if (!tokens[currentTokenIndex]) return;
  
  try {
    const token = tokens[currentTokenIndex];
    // TODO: Implement actual sell logic with MiniKit
    console.log('Selling token:', token.symbol);
  } catch (error) {
    console.error('Error selling token:', error);
  }
};

export const TradingBlock = () => {
  // Load tokens on first render
  if (isLoading) {
    loadTokens();
  }

  if (isLoading) {
    return `
      <div class="text-center py-16">
        <div class="text-4xl font-black">LOADING TOKENS...</div>
      </div>
    `;
  }

  if (tokens.length === 0) {
    return `
      <div class="text-center py-16">
        <div class="text-4xl font-black">NO TOKENS AVAILABLE</div>
      </div>
    `;
  }

  const currentToken = tokens[currentTokenIndex];

  return `
    <div class="space-y-4">
      <!-- Instructions -->
      <div class="text-center">
        <h2 class="text-xl font-black mb-2">TRADE TOKENS</h2>
        <p class="text-orange-200 text-sm">Swipe right to buy, left to sell</p>
      </div>

      <!-- Token Card -->
      <div class="flex justify-center">
        <div class="w-72 h-72 border-2 border-orange-400 p-4 transition-all duration-300 ${
          swipeDirection === 'right' ? 'bg-green-900 border-green-500' :
          swipeDirection === 'left' ? 'bg-red-900 border-red-500' :
          'bg-orange-900'
        } rounded">
          <div class="text-center">
            <div class="text-2xl font-bold mb-2">${currentToken.symbol}</div>
            <div class="text-lg mb-2">${currentToken.name}</div>
            <div class="text-sm text-orange-200 mb-4">
              Supply: ${parseInt(currentToken.total_supply).toLocaleString()}
            </div>
            
            <!-- Swipe Instructions -->
            <div class="space-y-2">
              <div class="text-sm">
                <span class="text-green-400">→</span> Swipe Right to BUY
              </div>
              <div class="text-sm">
                <span class="text-red-400">←</span> Swipe Left to SELL
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Swipe Buttons -->
      <div class="flex justify-center space-x-4">
        <button
          onclick="handleSwipe('left')"
          class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 text-sm border-2 border-red-400 rounded"
        >
          SELL
        </button>
        <button
          onclick="handleSwipe('right')"
          class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 text-sm border-2 border-green-400 rounded"
        >
          BUY
        </button>
      </div>

      <!-- Token Counter -->
      <div class="text-center text-orange-200 text-sm">
        ${currentTokenIndex + 1} of ${tokens.length}
      </div>
    </div>
  `;
};

// Make functions globally available for onclick handlers
window.handleSwipe = handleSwipe;
