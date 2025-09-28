// Quests Component - Dream11-style token investment competitions
import React, { useState, useEffect } from 'react';

const QuestsBlock = () => {
  const [quests, setQuests] = useState([]);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [portfolio, setPortfolio] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load quests from backend
  useEffect(() => {
    const loadQuests = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/quests');
        const data = await response.json();
        if (data.success) {
          setQuests(data.quests);
        }
      } catch (error) {
        console.error('Error loading quests:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadQuests();
  }, []);

  const handleQuestSelect = (quest) => {
    setSelectedQuest(quest);
  };

  const handlePortfolioChange = (tokenId, allocation) => {
    setPortfolio(prev => ({
      ...prev,
      [tokenId]: allocation
    }));
  };

  const handleSubmitPortfolio = async () => {
    if (!selectedQuest) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/quests/${selectedQuest.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user123', // TODO: Get from World ID
          portfolio: portfolio
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Portfolio submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting portfolio:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl font-black">LOADING QUESTS...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-black mb-2">QUESTS</h2>
        <p className="text-gray-400 text-lg">Token investment competitions</p>
      </div>

      {!selectedQuest ? (
        /* Quest Selection */
        <div className="grid gap-6">
          {quests.map((quest) => (
            <div
              key={quest.id}
              onClick={() => handleQuestSelect(quest)}
              className="border-4 border-white p-6 cursor-pointer hover:bg-gray-900 transition-colors"
            >
              <div className="text-3xl font-bold mb-2">{quest.title}</div>
              <div className="text-lg text-gray-400 mb-4">{quest.description}</div>
              <div className="flex justify-between items-center">
                <div className="text-xl">
                  Prize Pool: {quest.prize_pool} WLD
                </div>
                <div className="text-xl">
                  Status: <span className="text-green-400">{quest.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Portfolio Selection */
        <div className="space-y-6">
          <div className="mb-8">
            <button
              onClick={() => setSelectedQuest(null)}
              className="text-2xl text-gray-400 hover:text-white mb-4"
            >
              ← Back to Quests
            </button>
            <h2 className="text-4xl font-bold mb-4">{selectedQuest.title}</h2>
            <p className="text-xl text-gray-400 mb-6">{selectedQuest.description}</p>
          </div>

          <div className="space-y-6">
            <h3 className="text-3xl font-bold">Select Your Token Portfolio</h3>
            
            {/* Token Selection */}
            <div className="grid gap-4">
              {selectedQuest.token_slate.map((tokenId) => (
                <div key={tokenId} className="border-2 border-gray-600 p-4">
                  <div className="flex justify-between items-center">
                    <div className="text-xl font-bold">Token {tokenId}</div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Allocation %"
                      className="bg-gray-800 text-white p-2 border border-gray-600 w-32"
                      onChange={(e) => handlePortfolioChange(tokenId, parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmitPortfolio}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 text-xl border-4 border-green-400 w-full"
            >
              SUBMIT PORTFOLIO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestsBlock;
