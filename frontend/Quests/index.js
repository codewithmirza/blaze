// Quests Component - Dream11-style token investment competitions
let quests = [];
let selectedQuest = null;
let portfolio = {};
let isLoading = true;

// Load quests from backend
const loadQuests = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/quests');
    const data = await response.json();
    if (data.success) {
      quests = data.quests;
    }
  } catch (error) {
    console.error('Error loading quests:', error);
  } finally {
    isLoading = false;
  }
};

const handleQuestSelect = (quest) => {
  selectedQuest = quest;
  // Re-render the content
  document.getElementById('content').innerHTML = QuestsBlock();
};

const handlePortfolioChange = (tokenId, allocation) => {
  portfolio[tokenId] = allocation;
};

const handleSubmitPortfolio = async () => {
  if (!selectedQuest) return;
  
  try {
    const response = await fetch(`http://localhost:3000/api/quests/${selectedQuest.id}/submit`, {
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

const goBackToQuests = () => {
  selectedQuest = null;
  document.getElementById('content').innerHTML = QuestsBlock();
};

export const QuestsBlock = () => {
  // Load quests on first render
  if (isLoading) {
    loadQuests();
  }

  if (isLoading) {
    return `
      <div class="text-center py-8">
        <div class="text-xl font-black text-orange-300">LOADING QUESTS...</div>
      </div>
    `;
  }

  if (!selectedQuest) {
    // Quest Selection
    return `
      <div class="space-y-4">
        <!-- Header -->
        <div class="text-center">
          <h2 class="text-xl font-black mb-2">QUESTS</h2>
          <p class="text-orange-200 text-sm">Token investment competitions</p>
        </div>

        <div class="space-y-3">
          ${quests.map(quest => `
            <div
              onclick="handleQuestSelect(${JSON.stringify(quest).replace(/"/g, '&quot;')})"
              class="border-2 border-orange-400 p-3 cursor-pointer hover:bg-orange-900 transition-colors rounded"
            >
              <div class="text-lg font-bold mb-1">${quest.title}</div>
              <div class="text-sm text-orange-200 mb-2">${quest.description || ''}</div>
              <div class="flex justify-between items-center text-xs">
                <div>
                  Prize: ${quest.prize_pool} WLD
                </div>
                <div>
                  <span class="text-green-400">${quest.status}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    // Portfolio Selection
    return `
      <div class="space-y-4">
        <!-- Header -->
        <div class="text-center">
          <h2 class="text-xl font-black mb-2">QUESTS</h2>
          <p class="text-orange-200 text-sm">Token investment competitions</p>
        </div>

        <div class="space-y-3">
          <div class="mb-4">
            <button
              onclick="goBackToQuests()"
              class="text-sm text-orange-300 hover:text-orange-100 mb-2"
            >
              ← Back to Quests
            </button>
            <h2 class="text-lg font-bold mb-2">${selectedQuest.title}</h2>
            <p class="text-sm text-orange-200 mb-3">${selectedQuest.description || ''}</p>
          </div>

          <div class="space-y-3">
            <h3 class="text-lg font-bold text-orange-300">Select Your Token Portfolio</h3>
            
            <!-- Token Selection -->
            <div class="space-y-2">
              ${selectedQuest.token_slate.map(tokenId => `
                <div class="border-2 border-orange-500 p-2 rounded">
                  <div class="flex justify-between items-center">
                    <div class="text-sm font-bold">Token ${tokenId}</div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="%"
                      class="bg-orange-900 text-white p-1 border border-orange-400 w-16 text-xs rounded"
                      onchange="handlePortfolioChange('${tokenId}', parseInt(this.value) || 0)"
                    />
                  </div>
                </div>
              `).join('')}
            </div>

            <button
              onclick="handleSubmitPortfolio()"
              class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 text-sm border-2 border-green-400 w-full rounded"
            >
              SUBMIT PORTFOLIO
            </button>
          </div>
        </div>
      </div>
    `;
  }
};

// Make functions globally available
window.handleQuestSelect = handleQuestSelect;
window.goBackToQuests = goBackToQuests;
window.handlePortfolioChange = handlePortfolioChange;
window.handleSubmitPortfolio = handleSubmitPortfolio;
