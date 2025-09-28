import "./index.css";
import { MiniKit } from "https://cdn.jsdelivr.net/npm/@worldcoin/minikit-js@1.1.1/+esm";
import { VerifyBlock } from "./Verify/index.js";
import { PayBlock } from "./Pay/index.js";
import { TradingBlock } from "./Trading/index.js";
import { QuestsBlock } from "./Quests/index.js";
import { DashboardBlock } from "./Dashboard/index.js";
import { TestingBlock } from "./Testing/index.js";

// Install MiniKit
MiniKit.install();

// Blaze It App - Vanilla JS implementation
class BlazeItApp {
  constructor() {
    this.currentView = 'trading';
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
    console.log('Blaze It app loaded!');
    console.log('MiniKit installed:', MiniKit.isInstalled());
  }

  render() {
    const app = document.getElementById('root');
    app.innerHTML = `
      <div class="min-h-screen bg-black text-white font-mono">
        <!-- Header -->
        <header class="border-b-4 border-white bg-gray-900">
          <div class="container mx-auto px-4 py-6">
            <h1 class="text-4xl font-black text-center mb-4">BLAZE IT</h1>
            <p class="text-center text-gray-300 text-lg">Token Trading Platform</p>
          </div>
        </header>

        <!-- Navigation -->
        <nav class="border-b-4 border-gray-600 bg-gray-800">
          <div class="container mx-auto px-4 py-4">
            <div class="flex justify-center space-x-4">
              <button id="nav-trading" class="px-8 py-4 text-lg font-bold border-4 border-white bg-white text-black">
                TRADE
              </button>
              <button id="nav-quests" class="px-8 py-4 text-lg font-bold border-4 border-gray-500 bg-gray-700 text-white hover:border-gray-300 hover:bg-gray-600">
                QUESTS
              </button>
              <button id="nav-dashboard" class="px-8 py-4 text-lg font-bold border-4 border-gray-500 bg-gray-700 text-white hover:border-gray-300 hover:bg-gray-600">
                DASHBOARD
              </button>
              <button id="nav-testing" class="px-8 py-4 text-lg font-bold border-4 border-gray-500 bg-gray-700 text-white hover:border-gray-300 hover:bg-gray-600">
                TEST
              </button>
            </div>
          </div>
        </nav>

        <!-- Main Content -->
        <main class="container mx-auto px-4 py-8">
          <div id="content"></div>
        </main>
      </div>
    `;
    
    this.renderContent();
  }

  renderContent() {
    const content = document.getElementById('content');
    
    switch(this.currentView) {
      case 'trading':
        content.innerHTML = TradingBlock();
        break;
      case 'quests':
        content.innerHTML = QuestsBlock();
        break;
      case 'dashboard':
        content.innerHTML = DashboardBlock();
        break;
      case 'testing':
        content.innerHTML = TestingBlock();
        break;
      default:
        content.innerHTML = TradingBlock();
    }
  }

  bindEvents() {
    // Navigation events
    document.getElementById('nav-trading').addEventListener('click', () => this.setView('trading'));
    document.getElementById('nav-quests').addEventListener('click', () => this.setView('quests'));
    document.getElementById('nav-dashboard').addEventListener('click', () => this.setView('dashboard'));
    document.getElementById('nav-testing').addEventListener('click', () => this.setView('testing'));
  }

  setView(view) {
    this.currentView = view;
    
    // Update navigation buttons
    document.querySelectorAll('[id^="nav-"]').forEach(btn => {
      btn.className = 'px-8 py-4 text-lg font-bold border-4 border-gray-500 bg-gray-700 text-white hover:border-gray-300 hover:bg-gray-600';
    });
    
    const activeBtn = document.getElementById(`nav-${view}`);
    activeBtn.className = 'px-8 py-4 text-lg font-bold border-4 border-white bg-white text-black';
    
    this.renderContent();
  }
}

// Initialize the app
new BlazeItApp();
