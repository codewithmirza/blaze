// Testing Component - QR Code generator for World App testing
import React, { useState, useMemo } from 'react';

const QRCodeGenerator = () => {
  const [appId, setAppId] = useState("app_c3673cdb0b80dceade939081853805d4");
  const baseUrl = "https://worldcoin.org/mini-app";
  
  const trimmed = useMemo(() => appId.trim(), [appId]);
  const isValid = useMemo(() => (/^app_[a-f0-9]+$/).test(trimmed), [trimmed]);
  
  const payload = useMemo(() => {
    if (!trimmed || !isValid) return "";
    return `${baseUrl}?app_id=${trimmed}`;
  }, [trimmed, isValid, baseUrl]);
  
  const qrSrc = useMemo(() => {
    const size = "200x200";
    const data = encodeURIComponent(payload);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${data}`;
  }, [payload]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-6xl font-bold mb-4">TEST BLAZE IT</h1>
        <p className="text-2xl text-gray-400">Scan QR code to test in World App</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* App ID Input */}
        <div className="mb-8">
          <label className="block text-2xl font-bold mb-4">
            App ID
          </label>
          <input
            type="text"
            placeholder="Enter App Id (eg. app_f88bb2a....)"
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            className="w-full p-4 text-xl bg-gray-800 border-4 border-white text-white placeholder-gray-400"
            aria-label="App ID"
          />
        </div>

        {trimmed && !isValid && (
          <div className="mb-8 p-4 bg-red-900 border-4 border-red-500">
            <p className="text-xl text-red-200">
              Invalid App Id. Format: app_xxxxxxxxxxx
            </p>
          </div>
        )}

        {/* QR Code and Instructions */}
        <div className="grid gap-8 md:grid-cols-[300px_1fr] items-start">
          {/* QR Code */}
          <div className="flex items-center justify-center border-4 border-white p-4 bg-white">
            {isValid && payload ? (
              <img 
                src={qrSrc} 
                alt={`QR for ${payload}`} 
                width="300" 
                height="300" 
                loading="eager" 
              />
            ) : (
              <div className="w-[300px] h-[300px] grid place-items-center text-lg text-gray-500">
                Enter a valid App ID
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-6 text-xl">
            <div className="p-4 bg-gray-800 border-2 border-gray-600">
              <div className="text-gray-300 mb-2">Encoded URL:</div>
              <code className="text-lg text-green-400 break-all">
                {payload || "(empty)"}
              </code>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-3xl font-bold">Testing Steps:</h3>
              <ol className="list-decimal pl-6 space-y-3 text-lg">
                <li>Enter your App ID above (already filled with your ID)</li>
                <li>Scan the QR code with your phone's camera</li>
                <li>Confirm the prompt in World App</li>
                <li>Test the Blaze It features!</li>
              </ol>
            </div>

            {/* Testing Tips */}
            <div className="p-6 bg-gray-800 border-2 border-gray-600">
              <h4 className="text-2xl font-bold mb-4">Testing Tips:</h4>
              <ul className="space-y-2 text-lg">
                <li>• Use Ngrok for local testing (see terminal)</li>
                <li>• Install Eruda for mobile debugging</li>
                <li>• Get testnet WLD from L2 Faucet</li>
                <li>• Test all three tabs: Trade, Quests, Dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
