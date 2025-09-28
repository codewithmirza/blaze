// Testing Component - QR Code generator for World App testing
let appId = "app_c3673cdb0b80dceade939081853805d4";
const baseUrl = "https://worldcoin.org/mini-app";

const trimmed = appId.trim();
const isValid = (/^app_[a-f0-9]+$/).test(trimmed);

const payload = !trimmed || !isValid ? "" : `${baseUrl}?app_id=${trimmed}`;

const qrSrc = !payload ? "" : (() => {
  const size = "200x200";
  const data = encodeURIComponent(payload);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${data}`;
})();

const handleAppIdChange = (value) => {
  appId = value;
  // Re-render the content
  document.getElementById('content').innerHTML = TestingBlock();
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

  return `
    <div class="space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h2 class="text-3xl font-black mb-2">TEST BLAZE IT</h2>
        <p class="text-gray-400 text-lg">Scan QR code to test in World App</p>
      </div>

      <div class="max-w-4xl mx-auto">
        <!-- App ID Input -->
        <div class="mb-8">
          <label class="block text-2xl font-bold mb-4">
            App ID
          </label>
          <input
            type="text"
            placeholder="Enter App Id (eg. app_f88bb2a....)"
            value="${appId}"
            onchange="handleAppIdChange(this.value)"
            class="w-full p-4 text-xl bg-gray-800 border-4 border-white text-white placeholder-gray-400"
            aria-label="App ID"
          />
        </div>

        ${trimmed && !isValid ? `
          <div class="mb-8 p-4 bg-red-900 border-4 border-red-500">
            <p class="text-xl text-red-200">
              Invalid App Id. Format: app_xxxxxxxxxxx
            </p>
          </div>
        ` : ''}

        <!-- QR Code -->
        <div class="flex justify-center">
          <div class="border-4 border-white p-4 bg-white">
            ${isValid && payload ? `
              <img src="${qrSrc}" alt="QR for ${payload}" width="200" height="200" loading="eager" />
            ` : `
              <div class="w-48 h-48 flex items-center justify-center text-gray-500">
                ${!appId ? 'Enter a valid App ID' : 'Invalid App ID'}
              </div>
            `}
          </div>
        </div>

        <!-- Instructions -->
        <div class="mt-8 space-y-4 text-center">
          <div class="text-lg text-gray-300">
            <strong>Encoded value:</strong>
            <code class="ml-2 px-2 py-1 bg-gray-700 text-white rounded">
              ${payload || "(empty)"}
            </code>
          </div>
          
          <ol class="list-decimal list-inside space-y-2 text-left max-w-md mx-auto">
            <li>Enter your App ID above</li>
            <li>Scan the QR with your phone's camera</li>
            <li>Confirm the prompt in World App</li>
          </ol>
        </div>
      </div>
    </div>
  `;
};

// Make functions globally available
window.handleAppIdChange = handleAppIdChange;
