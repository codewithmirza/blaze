// Trading Component - Swipe-based token trading
import blazeState from "../src/state.js";

let currentTokenIndex = 0;
let swipeDirection = null;

const handleSwipe = (direction) => {
  swipeDirection = direction;
  
  if (direction === 'right') {
    handleBuyToken();
  } else if (direction === 'left') {
    handleSellToken();
  }
  
  // Move to next token after a delay
  setTimeout(() => {
    const tokens = blazeState.get('trading.tokens');
    currentTokenIndex = (currentTokenIndex + 1) % tokens.length;
    swipeDirection = null;
    // Re-render the content
    document.getElementById('content').innerHTML = TradingBlock();
  }, 1000);
};

const handleBuyToken = async () => {
  const tokens = blazeState.get('trading.tokens');
  const token = tokens[currentTokenIndex];
  if (!token) return;
  
  // Check if user is verified
  if (!blazeState.get('user.isVerified')) {
    blazeState.addNotification('Please verify your identity first', 'error');
    return;
  }
  
  // For demo, use a fixed amount
  const amount = '1000000000000000000'; // 1 token in wei
  
  const success = await blazeState.buyToken(token.id, amount);
  if (success) {
    // Refresh portfolio after successful trade
    await blazeState.loadPortfolio();
  }
};

const handleSellToken = async () => {
  const tokens = blazeState.get('trading.tokens');
  const token = tokens[currentTokenIndex];
  if (!token) return;
  
  // Check if user is verified
  if (!blazeState.get('user.isVerified')) {
    blazeState.addNotification('Please verify your identity first', 'error');
    return;
  }
  
  // For demo, use a fixed amount
  const amount = '1000000000000000000'; // 1 token in wei
  
  const success = await blazeState.sellToken(token.id, amount);
  if (success) {
    // Refresh portfolio after successful trade
    await blazeState.loadPortfolio();
  }
};

const handleVerifyUser = async () => {
  await blazeState.verifyUser();
};

export const TradingBlock = () => {
  const tokens = blazeState.get('trading.tokens');
  const isLoading = blazeState.get('trading.isLoading');
  const error = blazeState.get('trading.error');
  const isVerified = blazeState.get('user.isVerified');

  if (isLoading) {
    return `
      <div class="text-center py-16">
        <div class="text-4xl font-black">LOADING TOKENS...</div>
      </div>
    `;
  }

  if (error) {
    return `
      <div class="text-center py-16">
        <div class="text-2xl font-black text-red-400 mb-4">ERROR</div>
        <div class="text-orange-200">${error}</div>
        <button onclick="blazeState.loadTokens()" class="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 text-sm border-2 border-orange-400 rounded">
          RETRY
        </button>
      </div>
    `;
  }

  if (tokens.length === 0) {
    return `
      <div class="text-center py-16">
        <div class="text-4xl font-black">NO TOKENS AVAILABLE</div>
        <div class="text-orange-200 mt-4">Create your first token to get started!</div>
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
        ${!isVerified ? `
          <div class="mt-2">
            <button
              onclick="handleVerifyUser()"
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 text-xs border-2 border-blue-400 rounded"
            >
              VERIFY IDENTITY
            </button>
          </div>
        ` : ''}
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
            
            <!-- Bonding Curve Info -->
            <div class="text-xs text-orange-300 mb-4">
              <div>Base Price: ${currentToken.bonding_curve_params?.base_price || '0'}</div>
              <div>Slope: ${currentToken.bonding_curve_params?.slope || '0'}</div>
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
          ${!isVerified ? 'disabled' : ''}
        >
          SELL
        </button>
        <button
          onclick="handleSwipe('right')"
          class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 text-sm border-2 border-green-400 rounded"
          ${!isVerified ? 'disabled' : ''}
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
