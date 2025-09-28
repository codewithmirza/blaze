// Pay Component - Payment functionality
let paymentResponse = null;

const sendPayment = async () => {
  try {
    const res = await fetch('http://localhost:3000/initiate-payment', {
      method: "POST",
    });

    const { id } = await res.json();
    console.log(id);

    const payload = {
      reference: id,
      to: "0x0c892815f0B058E69987920A23FBb33c834289cf", // Test address
      tokens: [
        {
          symbol: "WLD",
          token_amount: "500000000000000000", // 0.5 WLD
        },
        {
          symbol: "USDCE", 
          token_amount: "100000", // 0.1 USDCE
        },
      ],
      description: "Blaze It test payment",
    };
    
    if (MiniKit.isInstalled()) {
      return await MiniKit.commandsAsync.pay(payload);
    }
    return null;
  } catch (error) {
    console.log("Error sending payment", error);
    return null;
  }
};

const handlePay = async () => {
  if (!MiniKit.isInstalled()) {
    console.error("MiniKit is not installed");
    paymentResponse = { error: "MiniKit is not installed" };
    document.getElementById('content').innerHTML = PayBlock();
    return;
  }
  
  try {
    const sendPaymentResponse = await sendPayment();
    const response = sendPaymentResponse?.finalPayload;
    if (!response) {
      paymentResponse = { error: "No response from payment" };
      document.getElementById('content').innerHTML = PayBlock();
      return;
    }

    if (response.status == "success") {
      const res = await fetch('http://localhost:3000/confirm-payment', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: response }),
      });
      const payment = await res.json();
      if (payment.success) {
        console.log("SUCCESS!");
        paymentResponse = { success: true, message: "Payment successful!" };
      } else {
        console.log("FAILED!");
        paymentResponse = { success: false, message: "Payment failed!" };
      }
    } else {
      paymentResponse = { success: false, message: "Payment cancelled or failed" };
    }
  } catch (error) {
    console.error("Payment error:", error);
    paymentResponse = { error: error.message };
  }
  
  // Re-render the content
  document.getElementById('content').innerHTML = PayBlock();
};

export const PayBlock = () => {
  return `
    <div class="space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h2 class="text-3xl font-black mb-2">PAYMENT TEST</h2>
        <p class="text-gray-400 text-lg">Test payment functionality</p>
      </div>

      <div class="max-w-md mx-auto">
        <button 
          onclick="handlePay()"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 text-xl border-4 border-blue-400"
        >
          TEST PAY
        </button>
        
        ${paymentResponse ? `
          <div class="mt-8 p-4 bg-gray-800 border-2 border-gray-600">
            <h3 class="text-lg font-bold mb-2">Response:</h3>
            <pre class="text-sm text-gray-300 overflow-auto">${JSON.stringify(paymentResponse, null, 2)}</pre>
          </div>
        ` : ''}
      </div>
    </div>
  `;
};

// Make functions globally available
window.handlePay = handlePay;
