import { RequestHandler } from "express";
import { supabase, Token, Trade } from "./database";
import { 
  calculateBuyPrice, 
  calculateSellPrice, 
  calculateSlippage, 
  validateTrade,
  parseTokenAmount,
  formatTokenAmount
} from "./bonding-curve";

interface BuyTokenRequest {
  token_id: string;
  amount: string;
  user_id: string;
  max_slippage?: string; // Optional slippage tolerance
}

interface SellTokenRequest {
  token_id: string;
  amount: string;
  user_id: string;
  max_slippage?: string; // Optional slippage tolerance
}

interface TradeQuote {
  token_id: string;
  trade_type: 'buy' | 'sell';
  amount: string;
  current_price: string;
  total_cost?: string;
  total_value?: string;
  average_price: string;
  protocol_fee: string;
  slippage: string;
  price_impact: string;
  transaction_data: {
    to: string;
    data: string;
    value: string;
  };
}

// Get trading quote
export const getTradeQuoteHandler: RequestHandler = async (req, res) => {
  try {
    const { token_id, trade_type, amount } = req.query;

    if (!token_id || !trade_type || !amount) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: token_id, trade_type, amount"
      });
    }

    if (!['buy', 'sell'].includes(trade_type as string)) {
      return res.status(400).json({
        success: false,
        error: "Invalid trade_type. Must be 'buy' or 'sell'"
      });
    }

    // Get token details
    const { data: token, error: tokenError } = await supabase
      .from('tokens')
      .select('*')
      .eq('id', token_id)
      .single();

    if (tokenError || !token) {
      return res.status(404).json({
        success: false,
        error: "Token not found"
      });
    }

    // Get current supply (would be fetched from blockchain in production)
    const { data: trades } = await supabase
      .from('trades')
      .select('amount, type')
      .eq('token_id', token_id);

    let currentSupply = "0";
    if (trades) {
      const totalBought = trades
        .filter(t => t.type === 'buy')
        .reduce((sum, t) => sum.plus(t.amount), new (require('bignumber.js'))(0));
      const totalSold = trades
        .filter(t => t.type === 'sell')
        .reduce((sum, t) => sum.plus(t.amount), new (require('bignumber.js'))(0));
      currentSupply = totalBought.minus(totalSold).toFixed(0);
    }

    // Validate trade
    const validation = validateTrade(
      amount as string,
      currentSupply,
      token.total_supply,
      trade_type as 'buy' | 'sell'
    );

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Calculate pricing
    let pricing;
    if (trade_type === 'buy') {
      pricing = calculateBuyPrice(amount as string, currentSupply, token.bonding_curve_params);
    } else {
      pricing = calculateSellPrice(amount as string, currentSupply, token.bonding_curve_params);
    }

    // Calculate slippage
    const slippage = calculateSlippage(
      amount as string,
      currentSupply,
      token.bonding_curve_params,
      trade_type as 'buy' | 'sell'
    );

    // Generate transaction data
    const transactionData = generateTradeCalldata(
      token.contract_address,
      trade_type as 'buy' | 'sell',
      amount as string,
      token.bonding_curve_params
    );

    const quote: TradeQuote = {
      token_id: token_id as string,
      trade_type: trade_type as 'buy' | 'sell',
      amount: amount as string,
      current_price: pricing.average_price,
      ...(trade_type === 'buy' ? { total_cost: pricing.totalCost } : { total_value: pricing.totalValue }),
      average_price: pricing.average_price,
      protocol_fee: pricing.protocolFee,
      slippage: slippage.slippage,
      price_impact: slippage.price_impact,
      transaction_data: transactionData
    };

    res.json({
      success: true,
      quote
    });

  } catch (error) {
    console.error('Get trade quote error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Execute buy trade
export const buyTokenHandler: RequestHandler = async (req, res) => {
  try {
    const { token_id, amount, user_id, tx_hash }: BuyTokenRequest & { tx_hash: string } = req.body;

    if (!token_id || !amount || !user_id || !tx_hash) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: token_id, amount, user_id, tx_hash"
      });
    }

    // Get token details
    const { data: token, error: tokenError } = await supabase
      .from('tokens')
      .select('*')
      .eq('id', token_id)
      .single();

    if (tokenError || !token) {
      return res.status(404).json({
        success: false,
        error: "Token not found"
      });
    }

    // Get current supply
    const { data: trades } = await supabase
      .from('trades')
      .select('amount, type')
      .eq('token_id', token_id);

    let currentSupply = "0";
    if (trades) {
      const totalBought = trades
        .filter(t => t.type === 'buy')
        .reduce((sum, t) => sum.plus(t.amount), new (require('bignumber.js'))(0));
      const totalSold = trades
        .filter(t => t.type === 'sell')
        .reduce((sum, t) => sum.plus(t.amount), new (require('bignumber.js'))(0));
      currentSupply = totalBought.minus(totalSold).toFixed(0);
    }

    // Calculate pricing
    const pricing = calculateBuyPrice(amount, currentSupply, token.bonding_curve_params);

    // Record trade
    const tradeData: Omit<Trade, 'id' | 'created_at'> = {
      user_id,
      token_id,
      type: 'buy',
      amount,
      price: pricing.average_price,
      tx_hash
    };

    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .insert(tradeData)
      .select()
      .single();

    if (tradeError) {
      console.error('Database error:', tradeError);
      return res.status(500).json({
        success: false,
        error: "Failed to record trade"
      });
    }

    // Update user portfolio
    await updateUserPortfolio(user_id, token_id, amount, pricing.average_price, 'buy');

    res.json({
      success: true,
      trade,
      pricing
    });

  } catch (error) {
    console.error('Buy token error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Execute sell trade
export const sellTokenHandler: RequestHandler = async (req, res) => {
  try {
    const { token_id, amount, user_id, tx_hash }: SellTokenRequest & { tx_hash: string } = req.body;

    if (!token_id || !amount || !user_id || !tx_hash) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: token_id, amount, user_id, tx_hash"
      });
    }

    // Get token details
    const { data: token, error: tokenError } = await supabase
      .from('tokens')
      .select('*')
      .eq('id', token_id)
      .single();

    if (tokenError || !token) {
      return res.status(404).json({
        success: false,
        error: "Token not found"
      });
    }

    // Check user balance
    const { data: portfolio } = await supabase
      .from('portfolios')
      .select('balance')
      .eq('user_id', user_id)
      .eq('token_id', token_id)
      .single();

    if (!portfolio || new (require('bignumber.js'))(portfolio.balance).lt(amount)) {
      return res.status(400).json({
        success: false,
        error: "Insufficient token balance"
      });
    }

    // Get current supply
    const { data: trades } = await supabase
      .from('trades')
      .select('amount, type')
      .eq('token_id', token_id);

    let currentSupply = "0";
    if (trades) {
      const totalBought = trades
        .filter(t => t.type === 'buy')
        .reduce((sum, t) => sum.plus(t.amount), new (require('bignumber.js'))(0));
      const totalSold = trades
        .filter(t => t.type === 'sell')
        .reduce((sum, t) => sum.plus(t.amount), new (require('bignumber.js'))(0));
      currentSupply = totalBought.minus(totalSold).toFixed(0);
    }

    // Calculate pricing
    const pricing = calculateSellPrice(amount, currentSupply, token.bonding_curve_params);

    // Record trade
    const tradeData: Omit<Trade, 'id' | 'created_at'> = {
      user_id,
      token_id,
      type: 'sell',
      amount,
      price: pricing.average_price,
      tx_hash
    };

    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .insert(tradeData)
      .select()
      .single();

    if (tradeError) {
      console.error('Database error:', tradeError);
      return res.status(500).json({
        success: false,
        error: "Failed to record trade"
      });
    }

    // Update user portfolio
    await updateUserPortfolio(user_id, token_id, amount, pricing.average_price, 'sell');

    res.json({
      success: true,
      trade,
      pricing
    });

  } catch (error) {
    console.error('Sell token error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Generate transaction calldata for trading
function generateTradeCalldata(
  contractAddress: string,
  tradeType: 'buy' | 'sell',
  amount: string,
  bondingCurveParams: any
): { to: string; data: string; value: string } {
  // This is a simplified version - in production, you'd use ethers.js or similar
  // to encode the function call to your BondingCurve contract
  
  const functionSignature = tradeType === 'buy' ? "buy(uint256)" : "sell(uint256)";
  const functionSelector = require('crypto').createHash('sha256')
    .update(functionSignature)
    .digest('hex')
    .slice(0, 8);

  // For now, return a placeholder
  // In production, you'd properly encode the parameters
  return {
    to: contractAddress,
    data: `0x${functionSelector}${'0'.repeat(64)}`,
    value: tradeType === 'buy' ? "0" : "0" // Value would be calculated based on bonding curve
  };
}

// Update user portfolio after trade
async function updateUserPortfolio(
  userId: string,
  tokenId: string,
  amount: string,
  price: string,
  tradeType: 'buy' | 'sell'
): Promise<void> {
  try {
    const { data: existingPortfolio } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .eq('token_id', tokenId)
      .single();

    const amountBN = new (require('bignumber.js'))(amount);
    const priceBN = new (require('bignumber.js'))(price);

    if (existingPortfolio) {
      const currentBalance = new (require('bignumber.js'))(existingPortfolio.balance);
      const currentAvgPrice = new (require('bignumber.js'))(existingPortfolio.avg_buy_price);

      let newBalance: any;
      let newAvgPrice: any;

      if (tradeType === 'buy') {
        newBalance = currentBalance.plus(amountBN);
        // Calculate new average price
        const currentValue = currentBalance.multipliedBy(currentAvgPrice);
        const newValue = amountBN.multipliedBy(priceBN);
        newAvgPrice = currentValue.plus(newValue).dividedBy(newBalance);
      } else {
        newBalance = currentBalance.minus(amountBN);
        newAvgPrice = currentAvgPrice; // Average price doesn't change on sell
      }

      // Calculate PnL
      const currentPrice = priceBN;
      const pnl = newBalance.multipliedBy(currentPrice.minus(newAvgPrice));

      await supabase
        .from('portfolios')
        .update({
          balance: newBalance.toFixed(0),
          avg_buy_price: newAvgPrice.toFixed(0),
          pnl: pnl.toFixed(0)
        })
        .eq('user_id', userId)
        .eq('token_id', tokenId);

    } else if (tradeType === 'buy') {
      // Create new portfolio entry
      await supabase
        .from('portfolios')
        .insert({
          user_id: userId,
          token_id: tokenId,
          balance: amount,
          avg_buy_price: price,
          pnl: "0"
        });
    }
  } catch (error) {
    console.error('Portfolio update error:', error);
  }
}
