// Dashboard Component - User portfolio overview
import blazeState from "../src/state.js";

const handleVerifyUser = async () => {
  await blazeState.verifyUser();
};

export const DashboardBlock = () => {
  const portfolio = blazeState.get('portfolio');
  const isLoading = blazeState.get('portfolio.isLoading');
  const error = blazeState.get('portfolio.error');
  const isVerified = blazeState.get('user.isVerified');

  // Load portfolio if user is verified and not already loading
  if (isVerified && !isLoading && portfolio.holdings.length === 0) {
    blazeState.loadPortfolio();
  }

  if (!isVerified) {
    return `
      <div class="text-center py-16">
        <div class="text-2xl font-black text-orange-300 mb-4">VERIFICATION REQUIRED</div>
        <div class="text-orange-200 mb-4">Please verify your identity to view your portfolio</div>
        <button
          onclick="handleVerifyUser()"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 text-sm border-2 border-blue-400 rounded"
        >
          VERIFY IDENTITY
        </button>
      </div>
    `;
  }

  if (isLoading) {
    return `
      <div class="text-center py-8">
        <div class="text-xl font-black text-orange-300">LOADING PORTFOLIO...</div>
      </div>
    `;
  }

  if (error) {
    return `
      <div class="text-center py-8">
        <div class="text-2xl font-black text-red-400 mb-4">ERROR</div>
        <div class="text-orange-200">${error}</div>
        <button onclick="blazeState.loadPortfolio()" class="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 text-sm border-2 border-orange-400 rounded">
          RETRY
        </button>
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
              <div class="text-sm font-bold text-green-400">${portfolio.totalValue || '0'} WLD</div>
            </div>
            <div>
              <div class="text-xs text-orange-200 mb-1">Total PnL</div>
              <div class="text-sm font-bold ${parseFloat(portfolio.totalPnlPercentage || 0) >= 0 ? 'text-green-400' : 'text-red-400'}">
                ${portfolio.totalPnl || '0'} WLD
              </div>
            </div>
            <div>
              <div class="text-xs text-orange-200 mb-1">PnL %</div>
              <div class="text-sm font-bold ${parseFloat(portfolio.totalPnlPercentage || 0) >= 0 ? 'text-green-400' : 'text-red-400'}">
                ${portfolio.totalPnlPercentage || '0'}%
              </div>
            </div>
          </div>
        </div>

        <!-- Token Holdings -->
        <div class="border-2 border-orange-400 p-3 rounded">
          <h3 class="text-lg font-bold mb-3 text-orange-300">Your Holdings</h3>
          <div class="space-y-2">
            ${portfolio.holdings.length === 0 ? `
              <div class="text-center py-4">
                <div class="text-orange-200">No holdings yet</div>
                <div class="text-xs text-orange-300 mt-1">Start trading to build your portfolio!</div>
              </div>
            ` : portfolio.holdings.map(holding => `
              <div class="border border-orange-500 p-2 rounded">
                <div class="flex justify-between items-center">
                  <div>
                    <div class="text-sm font-bold">${holding.token_symbol}</div>
                    <div class="text-xs text-orange-200">${holding.token_name}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-bold">${holding.balance}</div>
                    <div class="text-xs text-orange-200">${holding.avg_buy_price} WLD avg</div>
                    <div class="text-xs ${parseFloat(holding.pnl) >= 0 ? 'text-green-400' : 'text-red-400'}">
                      PnL: ${holding.pnl} WLD
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
            ${portfolio.tradeHistory.length === 0 ? `
              <div class="text-center py-2">
                <div class="text-orange-200 text-xs">No trades yet</div>
              </div>
            ` : portfolio.tradeHistory.slice(0, 3).map(trade => `
              <div class="flex justify-between items-center py-1 border-b border-orange-600 text-xs">
                <div class="flex items-center space-x-2">
                  <span class="font-bold">${trade.type.toUpperCase()}</span>
                  <span class="text-orange-200">${trade.token_symbol}</span>
                </div>
                <div class="text-right">
                  <div class="text-orange-200">${new Date(trade.created_at).toLocaleDateString()}</div>
                  <div>${trade.price} WLD</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
};
