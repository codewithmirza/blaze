// CreateToken Component - Create new tokens
let isCreating = false;
let createResponse = null;

const handleCreateToken = async () => {
  if (isCreating) return;
  
  const name = document.getElementById('token-name').value;
  const symbol = document.getElementById('token-symbol').value;
  const totalSupply = document.getElementById('token-supply').value;
  const basePrice = document.getElementById('base-price').value;
  const slope = document.getElementById('slope').value;
  
  if (!name || !symbol || !totalSupply || !basePrice || !slope) {
    createResponse = { error: "Please fill in all fields" };
    document.getElementById('content').innerHTML = CreateTokenBlock();
    return;
  }
  
  isCreating = true;
  createResponse = { loading: true };
  document.getElementById('content').innerHTML = CreateTokenBlock();
  
  try {
    const response = await fetch('https://blaze-backend-2xzvgrhww-codewithmirzas-projects.vercel.app/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        symbol: symbol.toUpperCase(),
        total_supply: totalSupply,
        bonding_curve_params: {
          base_price: basePrice,
          slope: slope,
          protocol_fee_rate: "0.01"
        },
        creator_id: 'user123' // TODO: Get from World ID
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      createResponse = { 
        success: true, 
        token: data.token,
        transaction_data: data.transaction_data 
      };
      
      // TODO: Use MiniKit to execute the transaction
      console.log('Token created! Transaction data:', data.transaction_data);
      
      // Reset form
      document.getElementById('token-name').value = '';
      document.getElementById('token-symbol').value = '';
      document.getElementById('token-supply').value = '';
      document.getElementById('base-price').value = '';
      document.getElementById('slope').value = '';
    } else {
      createResponse = { error: data.error || "Failed to create token" };
    }
  } catch (error) {
    console.error('Error creating token:', error);
    createResponse = { error: error.message };
  } finally {
    isCreating = false;
    document.getElementById('content').innerHTML = CreateTokenBlock();
  }
};

export const CreateTokenBlock = () => {
  return `
    <div class="space-y-4">
      <!-- Header -->
      <div class="text-center">
        <h2 class="text-2xl font-black mb-2">CREATE TOKEN</h2>
        <p class="text-orange-200 text-sm">Deploy your own token</p>
      </div>

      <!-- Form -->
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-bold mb-1 text-orange-300">Token Name</label>
          <input
            id="token-name"
            type="text"
            placeholder="e.g., BlazeCoin"
            class="w-full p-2 text-sm bg-orange-900 border-2 border-orange-500 text-white placeholder-orange-400 rounded"
          />
        </div>
        
        <div>
          <label class="block text-sm font-bold mb-1 text-orange-300">Symbol</label>
          <input
            id="token-symbol"
            type="text"
            placeholder="e.g., BLAZE"
            maxlength="10"
            class="w-full p-2 text-sm bg-orange-900 border-2 border-orange-500 text-white placeholder-orange-400 rounded uppercase"
          />
        </div>
        
        <div>
          <label class="block text-sm font-bold mb-1 text-orange-300">Total Supply</label>
          <input
            id="token-supply"
            type="number"
            placeholder="1000000"
            class="w-full p-2 text-sm bg-orange-900 border-2 border-orange-500 text-white placeholder-orange-400 rounded"
          />
        </div>
        
        <div>
          <label class="block text-sm font-bold mb-1 text-orange-300">Base Price (wei)</label>
          <input
            id="base-price"
            type="number"
            placeholder="1000000000000000"
            class="w-full p-2 text-sm bg-orange-900 border-2 border-orange-500 text-white placeholder-orange-400 rounded"
          />
        </div>
        
        <div>
          <label class="block text-sm font-bold mb-1 text-orange-300">Slope (wei)</label>
          <input
            id="slope"
            type="number"
            placeholder="1000000000000"
            class="w-full p-2 text-sm bg-orange-900 border-2 border-orange-500 text-white placeholder-orange-400 rounded"
          />
        </div>
        
        <button
          onclick="handleCreateToken()"
          disabled="${isCreating}"
          class="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white font-bold py-3 px-4 text-sm border-2 border-orange-400 rounded"
        >
          ${isCreating ? 'CREATING...' : 'CREATE TOKEN'}
        </button>
      </div>

      <!-- Response -->
      ${createResponse ? `
        <div class="mt-4 p-3 bg-orange-900 border-2 border-orange-500 rounded">
          <h3 class="text-sm font-bold mb-2 text-orange-300">Response:</h3>
          <pre class="text-xs text-orange-200 overflow-auto">${JSON.stringify(createResponse, null, 2)}</pre>
        </div>
      ` : ''}
      
      <!-- Info -->
      <div class="text-xs text-orange-300 space-y-1">
        <p>• Base Price: Starting price in wei</p>
        <p>• Slope: Price increase per token sold</p>
        <p>• Protocol Fee: 1% on all trades</p>
      </div>
    </div>
  `;
};

// Make functions globally available
window.handleCreateToken = handleCreateToken;
