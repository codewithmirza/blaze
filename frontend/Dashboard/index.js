// Dashboard Component - User portfolio overview
let portfolio = [];
let tradeHistory = [];
let isLoading = true;

// Load portfolio data
const loadPortfolio = async () => {
  try {
    const userId = 'user123'; // TODO: Get from World ID
    
    // Load portfolio
    const portfolioResponse = await fetch(`http://localhost:3000/api/portfolio/${userId}`);
    const portfolioData = await portfolioResponse.json();
    if (portfolioData.success) {
      portfolio = portfolioData.portfolio;
    }

    // Load trade history
    const historyResponse = await fetch(`http://localhost:3000/api/portfolio/${userId}/trades`);
    const historyData = await historyResponse.json();
    if (historyData.success) {
      tradeHistory = historyData.trades;
    }
  } catch (error) {
    console.error('Error loading portfolio:', error);
  } finally {
    isLoading = false;
  }
};

export const DashboardBlock = () => {
  // Load portfolio on first render
  if (isLoading) {
    loadPortfolio();
  }

  if (isLoading) {
    return `
      <div class="text-center py-16">
        <div class="text-4xl font-black">LOADING PORTFOLIO...</div>
      </div>
    `;
  }

  return `
    <div class="space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h2 class="text-3xl font-black mb-2">DASHBOARD</h2>
        <p class="text-gray-400 text-lg">Your token portfolio</p>
      </div>

      <div class="space-y-8">
        <!-- Portfolio Summary -->
        <div class="border-4 border-white p-6">
          <h2 class="text-4xl font-bold mb-6">Portfolio Holdings</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-2xl text-gray-400 mb-2">Total Value</div>
              <div class="text-4xl font-bold text-green-400">${portfolio.total_value || '0'} WLD</div>
            </div>
            <div class="text-center">
              <div class="text-2xl text-gray-400 mb-2">Total PnL</div>
              <div class="text-4xl font-bold ${(portfolio.total_pnl_percentage || 0) >= 0 ? 'text-green-400' : 'text-red-400'}">
                ${portfolio.total_pnl || '0'} WLD
              </div>
            </div>
            <div class="text-center">
              <div class="text-2xl text-gray-400 mb-2">PnL %</div>
              <div class="text-4xl font-bold ${(portfolio.total_pnl_percentage || 0) >= 0 ? 'text-green-400' : 'text-red-400'}">
                ${portfolio.total_pnl_percentage || '0'}%
              </div>
            </div>
          </div>
        </div>

        <!-- Token Holdings -->
        <div class="border-4 border-white p-6">
          <h3 class="text-3xl font-bold mb-6">Your Holdings</h3>
          <div class="space-y-4">
            ${(portfolio.tokens || []).map(token => `
              <div class="border-2 border-gray-600 p-4">
                <div class="flex justify-between items-center">
                  <div>
                    <div class="text-xl font-bold">${token.token_symbol}</div>
                    <div class="text-gray-400">${token.token_name}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold">${token.balance}</div>
                    <div class="text-sm text-gray-400">Value: ${token.value} WLD</div>
                    <div class="text-sm ${token.pnl_percentage >= 0 ? 'text-green-400' : 'text-red-400'}">
                      PnL: ${token.pnl_percentage}%
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Recent Trades -->
        <div class="border-4 border-white p-6">
          <h3 class="text-3xl font-bold mb-6">Recent Trades</h3>
          <div class="space-y-2">
            ${tradeHistory.slice(0, 5).map(trade => `
              <div class="flex justify-between items-center py-2 border-b border-gray-600">
                <div class="flex items-center space-x-4">
                  <span class="text-lg font-bold">${trade.type.toUpperCase()}</span>
                  <span class="text-gray-400">${trade.token_symbol}</span>
                  <span class="text-sm">${trade.amount}</span>
                </div>
                <div class="text-right">
                  <div class="text-sm text-gray-400">${new Date(trade.created_at).toLocaleDateString()}</div>
                  <div class="text-sm">${trade.value} WLD</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
};
