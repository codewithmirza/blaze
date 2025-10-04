// Testing Component - QR Code generator for World App testing
import blazeState from "../src/state.js";

let appId = "app_c3673cdb0b80dceade939081853805d4";
const baseUrl = "https://worldcoin.org/mini-app";

const handleAppIdChange = (value) => {
  appId = value;
  // Re-render the content
  document.getElementById('content').innerHTML = TestingBlock();
};

const testMiniKit = async () => {
  const output = document.getElementById('test-output');
  output.textContent = 'Testing MiniKit...';
  
  try {
    const result = await MiniKit.commandsAsync.verify();
    output.textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    output.textContent = 'Error: ' + error.message;
  }
};

export const TestingBlock = () => {
  const trimmed = appId.trim();
  const isValid = (/^app_[a-f0-9]+$/).test(trimmed);
  const payload = !trimmed || !isValid ? "" : `${baseUrl}?app_id=${trimmed}`;
  const qrSrc = !payload ? "" : (() => {
    const size = "200x200";
    const data = encodeURIComponent(payload);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${data}`;
  })();

  const isVerified = blazeState.get('user.isVerified');
  const user = blazeState.get('user');

  return `
    <div class="space-y-4">
      <!-- Header -->
      <div class="text-center">
        <h2 class="text-xl font-black mb-2">TEST BLAZE IT</h2>
        <p class="text-orange-200 text-sm">Scan QR code to test in World App</p>
      </div>

      <div class="space-y-4">
        <!-- User Status -->
        <div class="border-2 border-orange-400 p-3 rounded">
          <h3 class="text-lg font-bold mb-2 text-orange-300">User Status</h3>
          <div class="text-sm text-orange-200">
            <div>Verified: ${isVerified ? 'Yes' : 'No'}</div>
            <div>User ID: ${user.userId || 'None'}</div>
            <div>World ID: ${user.worldId || 'None'}</div>
            <div>Address: ${user.address || 'None'}</div>
          </div>
        </div>

        <!-- MiniKit Status -->
        <div class="border-2 border-orange-400 p-3 rounded">
          <h3 class="text-lg font-bold mb-2 text-orange-300">MiniKit Status</h3>
          <div class="text-sm text-orange-200">
            <div>Installed: ${MiniKit.isInstalled() ? 'Yes' : 'No'}</div>
            <div>Version: ${MiniKit.version || 'Unknown'}</div>
          </div>
        </div>

        <!-- QR Code Section -->
        <div class="border-2 border-orange-400 p-3 rounded">
          <h3 class="text-lg font-bold mb-2 text-orange-300">World App Testing</h3>
          
          <!-- App ID Input -->
          <div class="mb-4">
            <label class="block text-sm font-bold mb-2 text-orange-300">
              App ID
            </label>
            <input
              type="text"
              placeholder="Enter App Id (eg. app_f88bb2a....)"
              value="${appId}"
              onchange="handleAppIdChange(this.value)"
              class="w-full p-2 text-sm bg-orange-900 border-2 border-orange-400 text-white placeholder-orange-400 rounded"
              aria-label="App ID"
            />
          </div>

          ${trimmed && !isValid ? `
            <div class="mb-4 p-2 bg-red-900 border-2 border-red-500 rounded">
              <p class="text-sm text-red-200">
                Invalid App Id. Format: app_xxxxxxxxxxx
              </p>
            </div>
          ` : ''}

          <!-- QR Code -->
          <div class="flex justify-center mb-4">
            <div class="border-2 border-orange-400 p-2 bg-white rounded">
              ${isValid && payload ? `
                <img src="${qrSrc}" alt="QR for ${payload}" width="150" height="150" loading="eager" />
              ` : `
                <div class="w-36 h-36 flex items-center justify-center text-gray-500 text-xs">
                  ${!appId ? 'Enter a valid App ID' : 'Invalid App ID'}
                </div>
              `}
            </div>
          </div>

          <!-- Instructions -->
          <div class="space-y-2 text-center">
            <div class="text-sm text-orange-200">
              <strong>Encoded value:</strong>
              <code class="ml-1 px-1 py-0.5 bg-orange-800 text-orange-100 rounded text-xs">
                ${payload || "(empty)"}
              </code>
            </div>
            
            <ol class="list-decimal list-inside space-y-1 text-left text-xs text-orange-200">
              <li>Enter your App ID above</li>
              <li>Scan the QR with your phone's camera</li>
              <li>Confirm the prompt in World App</li>
            </ol>
          </div>
        </div>

        <!-- Test Commands -->
        <div class="border-2 border-orange-400 p-3 rounded">
          <h3 class="text-lg font-bold mb-2 text-orange-300">Test Commands</h3>
          <div class="space-y-2">
            <button
              onclick="testMiniKit()"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 text-sm border-2 border-blue-400 rounded"
            >
              Test MiniKit Verify
            </button>
          </div>
        </div>

        <!-- Test Results -->
        <div id="test-results" class="border-2 border-orange-400 p-3 rounded">
          <h3 class="text-lg font-bold mb-2 text-orange-300">Test Results</h3>
          <div id="test-output" class="text-sm text-orange-200">
            Click a test button to see results...
          </div>
        </div>
      </div>
    </div>
  `;
};

// Make functions globally available
window.handleAppIdChange = handleAppIdChange;
window.testMiniKit = testMiniKit;
