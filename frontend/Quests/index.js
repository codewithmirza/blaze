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
      <div class="text-center py-16">
        <div class="text-4xl font-black">LOADING QUESTS...</div>
      </div>
    `;
  }

  if (!selectedQuest) {
    // Quest Selection
    return `
      <div class="space-y-8">
        <!-- Header -->
        <div class="text-center">
          <h2 class="text-3xl font-black mb-2">QUESTS</h2>
          <p class="text-gray-400 text-lg">Token investment competitions</p>
        </div>

        <div class="grid gap-6">
          ${quests.map(quest => `
            <div
              onclick="handleQuestSelect(${JSON.stringify(quest).replace(/"/g, '&quot;')})"
              class="border-4 border-white p-6 cursor-pointer hover:bg-gray-900 transition-colors"
            >
              <div class="text-3xl font-bold mb-2">${quest.title}</div>
              <div class="text-lg text-gray-400 mb-4">${quest.description || ''}</div>
              <div class="flex justify-between items-center">
                <div class="text-xl">
                  Prize Pool: ${quest.prize_pool} WLD
                </div>
                <div class="text-xl">
                  Status: <span class="text-green-400">${quest.status}</span>
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
      <div class="space-y-8">
        <!-- Header -->
        <div class="text-center">
          <h2 class="text-3xl font-black mb-2">QUESTS</h2>
          <p class="text-gray-400 text-lg">Token investment competitions</p>
        </div>

        <div class="space-y-6">
          <div class="mb-8">
            <button
              onclick="goBackToQuests()"
              class="text-2xl text-gray-400 hover:text-white mb-4"
            >
              ← Back to Quests
            </button>
            <h2 class="text-4xl font-bold mb-4">${selectedQuest.title}</h2>
            <p class="text-xl text-gray-400 mb-6">${selectedQuest.description || ''}</p>
          </div>

          <div class="space-y-6">
            <h3 class="text-3xl font-bold">Select Your Token Portfolio</h3>
            
            <!-- Token Selection -->
            <div class="grid gap-4">
              ${selectedQuest.token_slate.map(tokenId => `
                <div class="border-2 border-gray-600 p-4">
                  <div class="flex justify-between items-center">
                    <div class="text-xl font-bold">Token ${tokenId}</div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Allocation %"
                      class="bg-gray-800 text-white p-2 border border-gray-600 w-32"
                      onchange="handlePortfolioChange('${tokenId}', parseInt(this.value) || 0)"
                    />
                  </div>
                </div>
              `).join('')}
            </div>

            <button
              onclick="handleSubmitPortfolio()"
              class="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 text-xl border-4 border-green-400 w-full"
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
