import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types for TypeScript
export interface Token {
  id: string;
  name: string;
  symbol: string;
  contract_address: string;
  creator_id: string;
  created_at: string;
  total_supply: string;
  bonding_curve_params: {
    base_price: string;
    slope: string;
    protocol_fee_rate: string;
  };
}

export interface Trade {
  id: string;
  user_id: string;
  token_id: string;
  type: 'buy' | 'sell';
  amount: string;
  price: string;
  tx_hash?: string;
  created_at: string;
}

export interface Quest {
  id: string;
  title: string;
  description?: string;
  token_slate: string[]; // Array of token IDs
  start_date: string;
  end_date: string;
  prize_pool: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface QuestSubmission {
  id: string;
  quest_id: string;
  user_id: string;
  portfolio: {
    [tokenId: string]: {
      amount: string;
      allocation_percentage: number;
    };
  };
  score: number;
  submitted_at: string;
}

export interface Portfolio {
  user_id: string;
  token_id: string;
  balance: string;
  avg_buy_price: string;
  pnl: string;
}
