// Blaze It App Configuration
export const CONFIG = {
  // Backend API URL
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  
  // App Configuration
  APP_ID: 'app_c3673cdb0b80dceade939081853805d4',
  
  // Contract Addresses (deployed on Worldchain Sepolia)
  CONTRACTS: {
    TOKEN_FACTORY: import.meta.env.VITE_TOKEN_FACTORY_ADDRESS || '0x303562bcbb6e1a8B0d00d95a3203c362E12AF08A',
    TREASURY: import.meta.env.VITE_TREASURY_ADDRESS || '0xF576Ee3f6A4C01AA60f4A864B7A0264D5743Bdbb',
    BONDING_CURVE: import.meta.env.VITE_BONDING_CURVE_ADDRESS || '0xfED5dadbb09893251B8c14FBE44834021F1FE613',
    BLAZE_TOKEN: import.meta.env.VITE_BLAZE_TOKEN_ADDRESS || '0xBF8bA437E4a93aE91E865889fD2564107eb52530',
  },
  
  // Network Configuration
  NETWORK: {
    CHAIN_ID: parseInt(import.meta.env.VITE_CHAIN_ID) || 480, // Worldchain Sepolia
    RPC_URL: import.meta.env.VITE_RPC_URL || 'https://worldchain-sepolia.g.alchemy.com/v2/demo',
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${CONFIG.API_BASE_URL}${endpoint}`;
};
