// Trading Component - Swipe-based token trading
let tokens = [];
let currentTokenIndex = 0;
let swipeDirection = null;
let isLoading = true;

// Load tokens from backend
const loadTokens = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/tokens');
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
    const response = await fetch('http://localhost:3000/api/trading/quote', {
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
    <div class="space-y-8">
      <!-- Instructions -->
      <div class="text-center">
        <h2 class="text-3xl font-black mb-2">TRADE TOKENS</h2>
        <p class="text-gray-400 text-lg">Swipe right to buy, left to sell</p>
      </div>

      <!-- Token Card -->
      <div class="flex justify-center">
        <div class="w-96 h-96 border-4 border-white p-8 transition-all duration-300 ${
          swipeDirection === 'right' ? 'bg-green-900 border-green-500' :
          swipeDirection === 'left' ? 'bg-red-900 border-red-500' :
          'bg-gray-900'
        }">
          <div class="text-center">
            <div class="text-4xl font-bold mb-4">${currentToken.symbol}</div>
            <div class="text-2xl mb-4">${currentToken.name}</div>
            <div class="text-lg text-gray-400 mb-8">
              Supply: ${parseInt(currentToken.total_supply).toLocaleString()}
            </div>
            
            <!-- Swipe Instructions -->
            <div class="space-y-4">
              <div class="text-xl">
                <span class="text-green-400">→</span> Swipe Right to BUY
              </div>
              <div class="text-xl">
                <span class="text-red-400">←</span> Swipe Left to SELL
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Swipe Buttons -->
      <div class="flex justify-center space-x-8">
        <button
          onclick="handleSwipe('left')"
          class="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 text-xl border-4 border-red-400"
        >
          SELL
        </button>
        <button
          onclick="handleSwipe('right')"
          class="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 text-xl border-4 border-green-400"
        >
          BUY
        </button>
      </div>

      <!-- Token Counter -->
      <div class="text-center text-gray-400">
        ${currentTokenIndex + 1} of ${tokens.length}
      </div>
    </div>
  `;
};

// Make functions globally available for onclick handlers
window.handleSwipe = handleSwipe;
