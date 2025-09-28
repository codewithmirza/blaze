// Verify Component - World ID verification
let handleVerifyResponse = null;

const verifyPayload = {
  action: "verify-user",
  signal: "blaze-it-verification"
};

const handleVerify = async () => {
  if (!MiniKit.isInstalled()) {
    console.warn("Tried to invoke 'verify', but MiniKit is not installed.");
    return null;
  }

  try {
    const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

    // no need to verify if command errored
    if (finalPayload.status === "error") {
      console.log("Command error");
      console.log(finalPayload);
      handleVerifyResponse = finalPayload;
      return finalPayload;
    }

    // Verify the proof in the backend
    const verifyResponse = await fetch('http://localhost:3000/verify', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payload: finalPayload,
        action: verifyPayload.action,
        signal: verifyPayload.signal,
      }),
    });

    const verifyResponseJson = await verifyResponse.json();

    if (verifyResponseJson.status === 200) {
      console.log("Verification success!");
      console.log(finalPayload);
    }

    handleVerifyResponse = verifyResponseJson;
    
    // Re-render the content
    document.getElementById('content').innerHTML = VerifyBlock();
    
    return verifyResponseJson;
  } catch (error) {
    console.error('Verification error:', error);
    handleVerifyResponse = { error: error.message };
    document.getElementById('content').innerHTML = VerifyBlock();
  }
};

export const VerifyBlock = () => {
  return `
    <div class="space-y-4">
      <!-- Header -->
      <div class="text-center">
        <h2 class="text-xl font-black mb-2">VERIFY IDENTITY</h2>
        <p class="text-orange-200 text-sm">Verify your World ID</p>
      </div>

      <div class="max-w-sm mx-auto">
        <button 
          onclick="handleVerify()"
          class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 text-sm border-2 border-green-400 rounded"
        >
          TEST VERIFY
        </button>
        
        ${handleVerifyResponse ? `
          <div class="mt-4 p-2 bg-orange-900 border-2 border-orange-500 rounded">
            <h3 class="text-sm font-bold mb-1 text-orange-300">Response:</h3>
            <pre class="text-xs text-orange-200 overflow-auto">${JSON.stringify(handleVerifyResponse, null, 2)}</pre>
          </div>
        ` : ''}
      </div>
    </div>
  `;
};

// Make functions globally available
window.handleVerify = handleVerify;
