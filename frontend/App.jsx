// Main App Component - Navigation between Blaze It features
import React, { useState } from 'react';
import TradingBlock from './Trading/index.jsx';
import QuestsBlock from './Quests/index.jsx';
import DashboardBlock from './Dashboard/index.jsx';
import QRCodeGenerator from './Testing/index.jsx';

const App = () => {
  const [currentView, setCurrentView] = useState('trading');

  const navigationItems = [
    { id: 'trading', label: 'TRADE', component: TradingBlock },
    { id: 'quests', label: 'QUESTS', component: QuestsBlock },
    { id: 'dashboard', label: 'DASHBOARD', component: DashboardBlock },
    { id: 'testing', label: 'TEST', component: QRCodeGenerator },
  ];

  const CurrentComponent = navigationItems.find(item => item.id === currentView)?.component || TradingBlock;

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Header */}
      <header className="border-b-4 border-white bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-black text-center mb-4">BLAZE IT</h1>
          <p className="text-center text-gray-300 text-lg">Token Trading Platform</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b-4 border-gray-600 bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-center space-x-4">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`px-8 py-4 text-lg font-bold border-4 transition-all duration-200 ${
                  currentView === item.id
                    ? 'border-white bg-white text-black'
                    : 'border-gray-500 bg-gray-700 text-white hover:border-gray-300 hover:bg-gray-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <CurrentComponent />
      </main>
    </div>
  );
};

export default App;
