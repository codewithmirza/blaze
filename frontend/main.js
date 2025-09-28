import "./index.css";
import { MiniKit } from "https://cdn.jsdelivr.net/npm/@worldcoin/minikit-js@1.1.1/+esm";
import { CONFIG } from "./config.js";
import { VerifyBlock } from "./Verify/index.js";
import { PayBlock } from "./Pay/index.js";
import { TradingBlock } from "./Trading/index.js";
import { QuestsBlock } from "./Quests/index.js";
import { DashboardBlock } from "./Dashboard/index.js";
import { CreateTokenBlock } from "./CreateToken/index.js";
import { TestingBlock } from "./Testing/index.js";

// Install MiniKit
MiniKit.install();

// Make CONFIG globally available
window.CONFIG = CONFIG;

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
    <div class="min-h-screen bg-black text-white font-mono overflow-x-hidden">
      <!-- Header -->
      <header class="border-b-4 border-orange-400 bg-gradient-to-r from-orange-900 to-orange-800">
        <div class="container mx-auto px-2 py-4">
          <h1 class="text-2xl font-black text-center mb-2">BLAZE IT</h1>
          <p class="text-center text-orange-200 text-sm">Token Trading Platform</p>
        </div>
      </header>

      <!-- Navigation -->
      <nav class="border-b-4 border-orange-600 bg-orange-800">
        <div class="container mx-auto px-2 py-2">
          <div class="flex justify-center space-x-1">
            <button id="nav-trading" class="px-3 py-2 text-sm font-bold border-2 border-orange-300 bg-orange-300 text-black rounded">
              TRADE
            </button>
            <button id="nav-quests" class="px-3 py-2 text-sm font-bold border-2 border-orange-500 bg-orange-700 text-white hover:border-orange-300 hover:bg-orange-600 rounded">
              QUESTS
            </button>
            <button id="nav-dashboard" class="px-3 py-2 text-sm font-bold border-2 border-orange-500 bg-orange-700 text-white hover:border-orange-300 hover:bg-orange-600 rounded">
              DASH
            </button>
            <button id="nav-create" class="px-3 py-2 text-sm font-bold border-2 border-orange-500 bg-orange-700 text-white hover:border-orange-300 hover:bg-orange-600 rounded">
              CREATE
            </button>
            <button id="nav-testing" class="px-3 py-2 text-sm font-bold border-2 border-orange-500 bg-orange-700 text-white hover:border-orange-300 hover:bg-orange-600 rounded">
              TEST
            </button>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="container mx-auto px-2 py-4 max-w-sm">
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
      case 'create':
        content.innerHTML = CreateTokenBlock();
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
    document.getElementById('nav-create').addEventListener('click', () => this.setView('create'));
    document.getElementById('nav-testing').addEventListener('click', () => this.setView('testing'));
  }

  setView(view) {
    this.currentView = view;
    
    // Update navigation buttons
    document.querySelectorAll('[id^="nav-"]').forEach(btn => {
      btn.className = 'px-3 py-2 text-sm font-bold border-2 border-orange-500 bg-orange-700 text-white hover:border-orange-300 hover:bg-orange-600 rounded';
    });
    
    const activeBtn = document.getElementById(`nav-${view}`);
    activeBtn.className = 'px-3 py-2 text-sm font-bold border-2 border-orange-300 bg-orange-300 text-black rounded';
    
    this.renderContent();
  }
}

// Initialize the app
new BlazeItApp();
