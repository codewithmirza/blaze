// Quests Component - Dream11-style token investment competitions
import blazeState from "../src/state.js";

let selectedQuest = null;
let portfolio = {};

const handleQuestSelect = (quest) => {
  selectedQuest = quest;
  // Re-render the content
  document.getElementById('content').innerHTML = QuestsBlock();
};

const handlePortfolioChange = (tokenId, allocation) => {
  portfolio[tokenId] = {
    amount: '1000000000000000000', // Fixed amount for demo
    allocation_percentage: allocation
  };
};

const handleSubmitPortfolio = async () => {
  if (!selectedQuest) return;
  
  // Check if user is verified
  if (!blazeState.get('user.isVerified')) {
    blazeState.addNotification('Please verify your identity first', 'error');
    return;
  }
  
  const success = await blazeState.submitQuestPortfolio(selectedQuest.id, portfolio);
  if (success) {
    selectedQuest = null;
    portfolio = {};
    // Re-render the content
    document.getElementById('content').innerHTML = QuestsBlock();
  }
};

const goBackToQuests = () => {
  selectedQuest = null;
  document.getElementById('content').innerHTML = QuestsBlock();
};

const handleVerifyUser = async () => {
  await blazeState.verifyUser();
};

export const QuestsBlock = () => {
  const quests = blazeState.get('quests.list');
  const isLoading = blazeState.get('quests.isLoading');
  const error = blazeState.get('quests.error');
  const isVerified = blazeState.get('user.isVerified');

  if (isLoading) {
    return `
      <div class="text-center py-8">
        <div class="text-xl font-black text-orange-300">LOADING QUESTS...</div>
      </div>
    `;
  }

  if (error) {
    return `
      <div class="text-center py-8">
        <div class="text-2xl font-black text-red-400 mb-4">ERROR</div>
        <div class="text-orange-200">${error}</div>
        <button onclick="blazeState.loadQuests()" class="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 text-sm border-2 border-orange-400 rounded">
          RETRY
        </button>
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

        <div class="space-y-3">
          ${quests.length === 0 ? `
            <div class="text-center py-8">
              <div class="text-lg font-bold text-orange-300">NO QUESTS AVAILABLE</div>
              <div class="text-orange-200 mt-2">Check back later for new competitions!</div>
            </div>
          ` : quests.map(quest => `
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
    const tokenSlate = typeof selectedQuest.token_slate === 'string' 
      ? JSON.parse(selectedQuest.token_slate) 
      : selectedQuest.token_slate;

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
            <p class="text-xs text-orange-200">Allocate percentages for each token (total should be 100%)</p>
            
            <!-- Token Selection -->
            <div class="space-y-2">
              ${tokenSlate.map(tokenId => `
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
              ${!isVerified ? 'disabled' : ''}
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
