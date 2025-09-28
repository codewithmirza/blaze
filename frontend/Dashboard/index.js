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
      <div class="text-center py-8">
        <div class="text-xl font-black text-orange-300">LOADING PORTFOLIO...</div>
      </div>
    `;
  }

  return `
    <div class="space-y-4">
      <!-- Header -->
      <div class="text-center">
        <h2 class="text-xl font-black mb-2">DASHBOARD</h2>
        <p class="text-orange-200 text-sm">Your token portfolio</p>
      </div>

      <div class="space-y-4">
        <!-- Portfolio Summary -->
        <div class="border-2 border-orange-400 p-3 rounded">
          <h2 class="text-lg font-bold mb-3 text-orange-300">Portfolio Summary</h2>
          <div class="grid grid-cols-3 gap-2 text-center">
            <div>
              <div class="text-xs text-orange-200 mb-1">Total Value</div>
              <div class="text-sm font-bold text-green-400">${portfolio.total_value || '0'} WLD</div>
            </div>
            <div>
              <div class="text-xs text-orange-200 mb-1">Total PnL</div>
              <div class="text-sm font-bold ${(portfolio.total_pnl_percentage || 0) >= 0 ? 'text-green-400' : 'text-red-400'}">
                ${portfolio.total_pnl || '0'} WLD
              </div>
            </div>
            <div>
              <div class="text-xs text-orange-200 mb-1">PnL %</div>
              <div class="text-sm font-bold ${(portfolio.total_pnl_percentage || 0) >= 0 ? 'text-green-400' : 'text-red-400'}">
                ${portfolio.total_pnl_percentage || '0'}%
              </div>
            </div>
          </div>
        </div>

        <!-- Token Holdings -->
        <div class="border-2 border-orange-400 p-3 rounded">
          <h3 class="text-lg font-bold mb-3 text-orange-300">Your Holdings</h3>
          <div class="space-y-2">
            ${(portfolio.tokens || []).map(token => `
              <div class="border border-orange-500 p-2 rounded">
                <div class="flex justify-between items-center">
                  <div>
                    <div class="text-sm font-bold">${token.token_symbol}</div>
                    <div class="text-xs text-orange-200">${token.token_name}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-bold">${token.balance}</div>
                    <div class="text-xs text-orange-200">${token.value} WLD</div>
                    <div class="text-xs ${token.pnl_percentage >= 0 ? 'text-green-400' : 'text-red-400'}">
                      ${token.pnl_percentage}%
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Recent Trades -->
        <div class="border-2 border-orange-400 p-3 rounded">
          <h3 class="text-lg font-bold mb-3 text-orange-300">Recent Trades</h3>
          <div class="space-y-1">
            ${tradeHistory.slice(0, 3).map(trade => `
              <div class="flex justify-between items-center py-1 border-b border-orange-600 text-xs">
                <div class="flex items-center space-x-2">
                  <span class="font-bold">${trade.type.toUpperCase()}</span>
                  <span class="text-orange-200">${trade.token_symbol}</span>
                </div>
                <div class="text-right">
                  <div class="text-orange-200">${new Date(trade.created_at).toLocaleDateString()}</div>
                  <div>${trade.value} WLD</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
};
