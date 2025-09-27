// Trading Component - Swipe-based token trading
import React, { useState, useEffect } from 'react';

const TradingBlock = () => {
  const [tokens, setTokens] = useState([]);
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load tokens from backend
  useEffect(() => {
    const loadTokens = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/tokens');
        const data = await response.json();
        if (data.success) {
          setTokens(data.tokens);
        }
      } catch (error) {
        console.error('Error loading tokens:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTokens();
  }, []);

  const handleSwipe = (direction) => {
    setSwipeDirection(direction);
    
    if (direction === 'right') {
      // Buy token
      handleBuyToken();
    } else if (direction === 'left') {
      // Sell token
      handleSellToken();
    }
    
    // Move to next token after a delay
    setTimeout(() => {
      setCurrentTokenIndex((prev) => (prev + 1) % tokens.length);
      setSwipeDirection(null);
    }, 1000);
  };

  const handleBuyToken = async () => {
    if (!tokens[currentTokenIndex]) return;
    
    try {
      const token = tokens[currentTokenIndex];
      const response = await fetch('http://localhost:3000/api/trading/quote', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // Add query parameters for buy quote
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-4xl font-bold">Loading tokens...</div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-4xl font-bold">No tokens available</div>
      </div>
    );
  }

  const currentToken = tokens[currentTokenIndex];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="p-8 border-b border-gray-800">
        <h1 className="text-6xl font-bold mb-4">BLAZE IT</h1>
        <p className="text-2xl text-gray-400">Swipe right to buy, left to sell</p>
      </div>

      {/* Token Card */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div 
          className={`w-96 h-96 border-4 border-white p-8 transition-all duration-300 ${
            swipeDirection === 'right' ? 'bg-green-900 border-green-500' :
            swipeDirection === 'left' ? 'bg-red-900 border-red-500' :
            'bg-gray-900'
          }`}
        >
          <div className="text-center">
            <div className="text-4xl font-bold mb-4">{currentToken.symbol}</div>
            <div className="text-2xl mb-4">{currentToken.name}</div>
            <div className="text-lg text-gray-400 mb-8">
              Supply: {parseInt(currentToken.total_supply).toLocaleString()}
            </div>
            
            {/* Swipe Instructions */}
            <div className="space-y-4">
              <div className="text-xl">
                <span className="text-green-400">→</span> Swipe Right to BUY
              </div>
              <div className="text-xl">
                <span className="text-red-400">←</span> Swipe Left to SELL
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Swipe Buttons */}
      <div className="p-8 flex justify-center space-x-8">
        <button
          onClick={() => handleSwipe('left')}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 text-xl border-4 border-red-400"
        >
          SELL
        </button>
        <button
          onClick={() => handleSwipe('right')}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 text-xl border-4 border-green-400"
        >
          BUY
        </button>
      </div>

      {/* Token Counter */}
      <div className="p-4 text-center text-gray-400">
        {currentTokenIndex + 1} of {tokens.length}
      </div>
    </div>
  );
};

export default TradingBlock;
