// Global State Management for Blaze It
class BlazeItState {
  constructor() {
    this.state = {
      // User state
      user: {
        isVerified: false,
        userId: null,
        worldId: null,
        address: null
      },
      
      // Trading state
      trading: {
        tokens: [],
        currentTokenIndex: 0,
        isLoading: false,
        error: null
      },
      
      // Portfolio state
      portfolio: {
        holdings: [],
        totalValue: '0',
        totalPnl: '0',
        totalPnlPercentage: '0',
        tradeHistory: [],
        isLoading: false,
        error: null
      },
      
      // Quest state
      quests: {
        list: [],
        selectedQuest: null,
        submissions: [],
        leaderboards: {},
        isLoading: false,
        error: null
      },
      
      // UI state
      ui: {
        currentView: 'trading',
        isLoading: false,
        notifications: []
      }
    };
    
    this.listeners = new Map();
  }
  
  // State getters
  getState() {
    return this.state;
  }
  
  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.state);
  }
  
  // State setters
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (!obj[key]) obj[key] = {};
      return obj[key];
    }, this.state);
    target[lastKey] = value;
    this.notifyListeners(path);
  }
  
  // Update multiple state properties
  update(updates) {
    Object.keys(updates).forEach(path => {
      this.set(path, updates[path]);
    });
  }
  
  // Event listeners
  subscribe(path, callback) {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }
    this.listeners.get(path).add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(path)?.delete(callback);
    };
  }
  
  notifyListeners(path) {
    this.listeners.get(path)?.forEach(callback => callback(this.get(path)));
  }
  
  // Action methods
  async verifyUser() {
    try {
      this.set('ui.isLoading', true);
      this.set('user.error', null);
      
      const result = await MiniKit.commandsAsync.verify();
      
      if (result.success) {
        this.update({
          'user.isVerified': true,
          'user.userId': result.userId,
          'user.worldId': result.worldId,
          'user.address': result.address
        });
        
        this.addNotification('User verified successfully!', 'success');
        return true;
      } else {
        this.set('user.error', result.error || 'Verification failed');
        this.addNotification('Verification failed', 'error');
        return false;
      }
    } catch (error) {
      console.error('Verification error:', error);
      this.set('user.error', error.message);
      this.addNotification('Verification error', 'error');
      return false;
    } finally {
      this.set('ui.isLoading', false);
    }
  }
  
  async loadTokens() {
    try {
      this.set('trading.isLoading', true);
      this.set('trading.error', null);
      
      const response = await fetch(getApiUrl('/api/tokens'));
      const data = await response.json();
      
      if (data.success) {
        this.set('trading.tokens', data.tokens);
      } else {
        this.set('trading.error', data.error);
        this.addNotification('Failed to load tokens', 'error');
      }
    } catch (error) {
      console.error('Load tokens error:', error);
      this.set('trading.error', error.message);
      this.addNotification('Failed to load tokens', 'error');
    } finally {
      this.set('trading.isLoading', false);
    }
  }
  
  async loadPortfolio() {
    if (!this.get('user.userId')) return;
    
    try {
      this.set('portfolio.isLoading', true);
      this.set('portfolio.error', null);
      
      const userId = this.get('user.userId');
      const response = await fetch(getApiUrl(`/api/portfolio/${userId}`));
      const data = await response.json();
      
      if (data.success) {
        this.update({
          'portfolio.holdings': data.portfolio.holdings || [],
          'portfolio.totalValue': data.portfolio.total_value || '0',
          'portfolio.totalPnl': data.portfolio.total_pnl || '0',
          'portfolio.totalPnlPercentage': data.portfolio.total_pnl_percentage || '0'
        });
      } else {
        this.set('portfolio.error', data.error);
      }
    } catch (error) {
      console.error('Load portfolio error:', error);
      this.set('portfolio.error', error.message);
    } finally {
      this.set('portfolio.isLoading', false);
    }
  }
  
  async loadQuests() {
    try {
      this.set('quests.isLoading', true);
      this.set('quests.error', null);
      
      const response = await fetch(getApiUrl('/api/quests'));
      const data = await response.json();
      
      if (data.success) {
        this.set('quests.list', data.quests);
      } else {
        this.set('quests.error', data.error);
        this.addNotification('Failed to load quests', 'error');
      }
    } catch (error) {
      console.error('Load quests error:', error);
      this.set('quests.error', error.message);
      this.addNotification('Failed to load quests', 'error');
    } finally {
      this.set('quests.isLoading', false);
    }
  }
  
  async buyToken(tokenId, amount) {
    if (!this.get('user.isVerified')) {
      this.addNotification('Please verify your identity first', 'error');
      return false;
    }
    
    try {
      this.set('ui.isLoading', true);
      
      // Get quote
      const quoteResponse = await fetch(getApiUrl(`/api/trading/quote?token_id=${tokenId}&trade_type=buy&amount=${amount}`));
      const quoteData = await quoteResponse.json();
      
      if (!quoteData.success) {
        this.addNotification('Failed to get quote', 'error');
        return false;
      }
      
      // Execute transaction
      const txResult = await MiniKit.commandsAsync.transaction({
        to: quoteData.quote.transaction_data.to,
        data: quoteData.quote.transaction_data.data,
        value: quoteData.quote.transaction_data.value
      });
      
      if (txResult.success) {
        // Record trade
        const tradeResponse = await fetch(getApiUrl('/api/trading/buy'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token_id: tokenId,
            amount: amount,
            user_id: this.get('user.userId'),
            tx_hash: txResult.txHash
          })
        });
        
        const tradeData = await tradeResponse.json();
        
        if (tradeData.success) {
          this.addNotification('Token purchased successfully!', 'success');
          // Refresh portfolio
          await this.loadPortfolio();
          return true;
        } else {
          this.addNotification('Failed to record trade', 'error');
          return false;
        }
      } else {
        this.addNotification('Transaction failed', 'error');
        return false;
      }
    } catch (error) {
      console.error('Buy token error:', error);
      this.addNotification('Buy failed', 'error');
      return false;
    } finally {
      this.set('ui.isLoading', false);
    }
  }
  
  async sellToken(tokenId, amount) {
    if (!this.get('user.isVerified')) {
      this.addNotification('Please verify your identity first', 'error');
      return false;
    }
    
    try {
      this.set('ui.isLoading', true);
      
      // Get quote
      const quoteResponse = await fetch(getApiUrl(`/api/trading/quote?token_id=${tokenId}&trade_type=sell&amount=${amount}`));
      const quoteData = await quoteResponse.json();
      
      if (!quoteData.success) {
        this.addNotification('Failed to get quote', 'error');
        return false;
      }
      
      // Execute transaction
      const txResult = await MiniKit.commandsAsync.transaction({
        to: quoteData.quote.transaction_data.to,
        data: quoteData.quote.transaction_data.data,
        value: quoteData.quote.transaction_data.value
      });
      
      if (txResult.success) {
        // Record trade
        const tradeResponse = await fetch(getApiUrl('/api/trading/sell'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token_id: tokenId,
            amount: amount,
            user_id: this.get('user.userId'),
            tx_hash: txResult.txHash
          })
        });
        
        const tradeData = await tradeResponse.json();
        
        if (tradeData.success) {
          this.addNotification('Token sold successfully!', 'success');
          // Refresh portfolio
          await this.loadPortfolio();
          return true;
        } else {
          this.addNotification('Failed to record trade', 'error');
          return false;
        }
      } else {
        this.addNotification('Transaction failed', 'error');
        return false;
      }
    } catch (error) {
      console.error('Sell token error:', error);
      this.addNotification('Sell failed', 'error');
      return false;
    } finally {
      this.set('ui.isLoading', false);
    }
  }
  
  async createToken(tokenData) {
    if (!this.get('user.isVerified')) {
      this.addNotification('Please verify your identity first', 'error');
      return false;
    }
    
    try {
      this.set('ui.isLoading', true);
      
      const response = await fetch(getApiUrl('/api/tokens'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...tokenData,
          creator_id: this.get('user.userId')
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Execute deployment transaction
        const txResult = await MiniKit.commandsAsync.transaction({
          to: data.transaction_data.to,
          data: data.transaction_data.data,
          value: data.transaction_data.value
        });
        
        if (txResult.success) {
          this.addNotification('Token created successfully!', 'success');
          // Refresh tokens list
          await this.loadTokens();
          return true;
        } else {
          this.addNotification('Token deployment failed', 'error');
          return false;
        }
      } else {
        this.addNotification(data.error || 'Failed to create token', 'error');
        return false;
      }
    } catch (error) {
      console.error('Create token error:', error);
      this.addNotification('Create token failed', 'error');
      return false;
    } finally {
      this.set('ui.isLoading', false);
    }
  }
  
  async submitQuestPortfolio(questId, portfolio) {
    if (!this.get('user.isVerified')) {
      this.addNotification('Please verify your identity first', 'error');
      return false;
    }
    
    try {
      this.set('ui.isLoading', true);
      
      const response = await fetch(getApiUrl(`/api/quests/${questId}/submit`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: this.get('user.userId'),
          portfolio: portfolio
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.addNotification('Portfolio submitted successfully!', 'success');
        // Refresh quests
        await this.loadQuests();
        return true;
      } else {
        this.addNotification(data.error || 'Failed to submit portfolio', 'error');
        return false;
      }
    } catch (error) {
      console.error('Submit portfolio error:', error);
      this.addNotification('Submit portfolio failed', 'error');
      return false;
    } finally {
      this.set('ui.isLoading', false);
    }
  }
  
  // UI helpers
  setView(view) {
    this.set('ui.currentView', view);
  }
  
  addNotification(message, type = 'info') {
    const notifications = this.get('ui.notifications') || [];
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    
    this.set('ui.notifications', [...notifications, notification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      const currentNotifications = this.get('ui.notifications') || [];
      this.set('ui.notifications', currentNotifications.filter(n => n.id !== notification.id));
    }, 5000);
  }
  
  removeNotification(id) {
    const notifications = this.get('ui.notifications') || [];
    this.set('ui.notifications', notifications.filter(n => n.id !== id));
  }
}

// Create global state instance
window.blazeState = new BlazeItState();

// Export for modules
export default window.blazeState;