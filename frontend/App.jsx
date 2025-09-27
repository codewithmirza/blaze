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
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="flex justify-center space-x-8 p-4">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`px-6 py-3 text-xl font-bold border-4 transition-colors ${
                currentView === item.id
                  ? 'border-white bg-gray-800'
                  : 'border-gray-600 hover:border-gray-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <CurrentComponent />
    </div>
  );
};

export default App;
