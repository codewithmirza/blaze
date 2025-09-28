import { Request, Response } from "express";
import { supabase } from "./database";

// Token Management Handlers
export const createTokenHandler = async (req: Request, res: Response) => {
  try {
    const { name, symbol, total_supply, bonding_curve_params, creator_id } = req.body;

    if (!name || !symbol || !total_supply || !bonding_curve_params || !creator_id) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: name, symbol, total_supply, bonding_curve_params, creator_id"
      });
      return;
    }

    // Validate symbol format
    if (!/^[A-Z0-9]{3,10}$/.test(symbol)) {
      res.status(400).json({
        success: false,
        error: "Symbol must be 3-10 characters, uppercase alphanumeric only"
      });
      return;
    }

    // Check if symbol already exists
    const { data: existingToken } = await supabase
      .from('tokens')
      .select('symbol')
      .eq('symbol', symbol)
      .single();

    if (existingToken) {
      res.status(400).json({
        success: false,
        error: "Token symbol already exists"
      });
      return;
    }

    // Create token record
    const tokenData = {
      name,
      symbol,
      contract_address: `0x${Math.random().toString(16).substr(2, 40)}`,
      bonding_curve_address: `0x${Math.random().toString(16).substr(2, 40)}`,
      creator_id,
      total_supply,
      bonding_curve_params: {
        base_price: bonding_curve_params.base_price,
        slope: bonding_curve_params.slope,
        protocol_fee_rate: bonding_curve_params.protocol_fee_rate || "0.01"
      }
    };

    const { data: token, error: dbError } = await supabase
      .from('tokens')
      .insert(tokenData)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({ success: false, error: "Failed to create token" });
      return;
    }

    res.json({
      success: true,
      token,
      transaction_data: {
        to: process.env.TOKEN_FACTORY_ADDRESS || "0x0000000000000000000000000000000000000000",
        data: "0x",
        value: "0"
      }
    });
  } catch (error) {
    console.error('Create token error:', error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const listTokensHandler = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('tokens')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,symbol.ilike.%${search}%`);
    }

    const { data: tokens, error, count } = await query;

    if (error) {
      console.error('List tokens error:', error);
      res.status(500).json({ success: false, error: "Failed to fetch tokens" });
      return;
    }

    res.json({
      success: true,
      tokens: tokens || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error('List tokens error:', error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const getTokenHandler = async (req: Request, res: Response) => {
  try {
    const { tokenId } = req.params;

    const { data: token, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('id', tokenId)
      .single();

    if (error || !token) {
      res.status(404).json({
        success: false,
        error: "Token not found"
      });
      return;
    }

    res.json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Get token error:', error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Portfolio Handlers
export const getPortfolioHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      res.status(400).json({ success: false, error: "Missing user_id parameter" });
      return;
    }

    // Get user's portfolio
    const { data: portfolios, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        tokens (
          id,
          name,
          symbol,
          contract_address
        )
      `)
      .eq('user_id', userId)
      .gt('balance', 0);

    if (error) {
      console.error('Portfolio query error:', error);
      res.status(500).json({ success: false, error: "Failed to fetch portfolio" });
      return;
    }

    // Calculate totals
    const totalValue = portfolios?.reduce((sum, p) => sum + parseFloat(p.balance || '0'), 0) || 0;
    const totalPnl = portfolios?.reduce((sum, p) => sum + parseFloat(p.pnl || '0'), 0) || 0;

    res.json({
      success: true,
      portfolio: {
        user_id: userId,
        total_value: totalValue.toString(),
        total_pnl: totalPnl.toString(),
        total_pnl_percentage: totalValue > 0 ? ((totalPnl / totalValue) * 100).toFixed(2) : "0",
        tokens: portfolios || []
      }
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Quest Handlers
export const createQuestHandler = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      token_slate,
      start_date,
      end_date,
      prize_pool
    } = req.body;

    if (!title || !token_slate || !start_date || !end_date) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: title, token_slate, start_date, end_date"
      });
      return;
    }

    // Create quest
    const questData = {
      title,
      description,
      token_slate,
      start_date,
      end_date,
      prize_pool: prize_pool || "0",
      status: 'active'
    };

    const { data: quest, error: questError } = await supabase
      .from('quests')
      .insert(questData)
      .select()
      .single();

    if (questError) {
      console.error('Database error:', questError);
      res.status(500).json({ success: false, error: "Failed to create quest" });
      return;
    }

    res.json({
      success: true,
      quest
    });
  } catch (error) {
    console.error('Create quest error:', error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const getQuestsHandler = async (req: Request, res: Response) => {
  try {
    const { status = 'active', page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('quests')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: quests, error, count } = await query;

    if (error) {
      console.error('Quests query error:', error);
      res.status(500).json({ success: false, error: "Failed to fetch quests" });
      return;
    }

    res.json({
      success: true,
      quests: quests || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get quests error:', error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const getQuestHandler = async (req: Request, res: Response) => {
  try {
    const { questId } = req.params;

    const { data: quest, error } = await supabase
      .from('quests')
      .select('*')
      .eq('id', questId)
      .single();

    if (error || !quest) {
      res.status(404).json({
        success: false,
        error: "Quest not found"
      });
      return;
    }

    res.json({
      success: true,
      quest
    });
  } catch (error) {
    console.error('Get quest error:', error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Trading Handlers
export const getTradeQuoteHandler = async (req: Request, res: Response) => {
  try {
    const { token_id, trade_type, amount } = req.query;

    if (!token_id || !trade_type || !amount) {
      res.status(400).json({
        success: false,
        error: "Missing required parameters: token_id, trade_type, amount"
      });
      return;
    }

    // Get token details
    const { data: token, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('id', token_id)
      .single();

    if (error || !token) {
      res.status(404).json({
        success: false,
        error: "Token not found"
      });
      return;
    }

    // Mock pricing calculation
    const basePrice = parseFloat(token.bonding_curve_params.base_price);
    const slope = parseFloat(token.bonding_curve_params.slope);
    const tradeAmount = parseFloat(amount as string);
    
    const currentPrice = basePrice + (tradeAmount * slope);
    const totalCost = tradeAmount * currentPrice;
    const protocolFee = totalCost * parseFloat(token.bonding_curve_params.protocol_fee_rate);

    res.json({
      success: true,
      quote: {
        token_id: token_id as string,
        trade_type: trade_type as string,
        amount: amount as string,
        current_price: currentPrice.toString(),
        total_cost: totalCost.toString(),
        average_price: currentPrice.toString(),
        protocol_fee: protocolFee.toString(),
        slippage: "0.1",
        price_impact: "0.05",
        transaction_data: {
          to: token.contract_address,
          data: "0x",
          value: trade_type === 'buy' ? totalCost.toString() : "0"
        }
      }
    });
  } catch (error) {
    console.error('Get trade quote error:', error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const buyTokenHandler = async (req: Request, res: Response) => {
  try {
    const { token_id, amount, user_id, tx_hash } = req.body;

    if (!token_id || !amount || !user_id) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: token_id, amount, user_id"
      });
      return;
    }

    // Record trade
    const tradeData = {
      user_id,
      token_id,
      type: 'buy',
      amount,
      price: "0.001", // Mock price
      tx_hash: tx_hash || `0x${Math.random().toString(16).substr(2, 64)}`
    };

    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .insert(tradeData)
      .select()
      .single();

    if (tradeError) {
      console.error('Trade recording error:', tradeError);
      res.status(500).json({ success: false, error: "Failed to record trade" });
      return;
    }

    res.json({
      success: true,
      trade
    });
  } catch (error) {
    console.error('Buy token error:', error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const sellTokenHandler = async (req: Request, res: Response) => {
  try {
    const { token_id, amount, user_id, tx_hash } = req.body;

    if (!token_id || !amount || !user_id) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: token_id, amount, user_id"
      });
      return;
    }

    // Record trade
    const tradeData = {
      user_id,
      token_id,
      type: 'sell',
      amount,
      price: "0.001", // Mock price
      tx_hash: tx_hash || `0x${Math.random().toString(16).substr(2, 64)}`
    };

    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .insert(tradeData)
      .select()
      .single();

    if (tradeError) {
      console.error('Trade recording error:', tradeError);
      res.status(500).json({ success: false, error: "Failed to record trade" });
      return;
    }

    res.json({
      success: true,
      trade
    });
  } catch (error) {
    console.error('Sell token error:', error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
