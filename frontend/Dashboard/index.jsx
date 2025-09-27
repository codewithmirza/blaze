// Dashboard Component - User portfolio overview
import React, { useState, useEffect } from 'react';

const DashboardBlock = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load portfolio data
  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const userId = 'user123'; // TODO: Get from World ID
        
        // Load portfolio
        const portfolioResponse = await fetch(`http://localhost:3000/api/portfolio/${userId}`);
        const portfolioData = await portfolioResponse.json();
        if (portfolioData.success) {
          setPortfolio(portfolioData.portfolio);
        }

        // Load trade history
        const historyResponse = await fetch(`http://localhost:3000/api/portfolio/${userId}/trades`);
        const historyData = await historyResponse.json();
        if (historyData.success) {
          setTradeHistory(historyData.trades);
        }
      } catch (error) {
        console.error('Error loading portfolio:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPortfolio();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-4xl font-bold">Loading portfolio...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="p-8 border-b border-gray-800">
        <h1 className="text-6xl font-bold mb-4">DASHBOARD</h1>
        <p className="text-2xl text-gray-400">Your token portfolio</p>
      </div>

      <div className="p-8 space-y-8">
        {/* Portfolio Summary */}
        <div className="border-4 border-white p-6">
          <h2 className="text-4xl font-bold mb-6">Portfolio Holdings</h2>
          {portfolio.length === 0 ? (
            <div className="text-2xl text-gray-400">No tokens in portfolio</div>
          ) : (
            <div className="space-y-4">
              {portfolio.map((holding, index) => (
                <div key={index} className="border-2 border-gray-600 p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold">{holding.token.symbol}</div>
                      <div className="text-lg text-gray-400">{holding.token.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl">Balance: {holding.amount}</div>
                      <div className="text-lg text-gray-400">
                        PnL: <span className={holding.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {holding.pnl >= 0 ? '+' : ''}{holding.pnl}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trade History */}
        <div className="border-4 border-white p-6">
          <h2 className="text-4xl font-bold mb-6">Recent Trades</h2>
          {tradeHistory.length === 0 ? (
            <div className="text-2xl text-gray-400">No trades yet</div>
          ) : (
            <div className="space-y-2">
              {tradeHistory.slice(0, 10).map((trade, index) => (
                <div key={index} className="border border-gray-600 p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 text-sm font-bold ${
                        trade.type === 'buy' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {trade.type.toUpperCase()}
                      </div>
                      <div className="text-lg">Token ID: {trade.token_id}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg">Amount: {trade.amount}</div>
                      <div className="text-sm text-gray-400">Price: {trade.price}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardBlock;
