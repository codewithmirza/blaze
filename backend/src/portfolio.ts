import { RequestHandler } from "express";
import { supabase, Portfolio } from "./database";
import { formatTokenAmount } from "./bonding-curve";

interface PortfolioSummary {
  user_id: string;
  total_value: string;
  total_pnl: string;
  total_pnl_percentage: string;
  tokens: Array<{
    token_id: string;
    token_name: string;
    token_symbol: string;
    balance: string;
    avg_buy_price: string;
    current_price: string;
    value: string;
    pnl: string;
    pnl_percentage: string;
  }>;
}

interface TradeHistory {
  id: string;
  token_id: string;
  token_name: string;
  token_symbol: string;
  type: 'buy' | 'sell';
  amount: string;
  price: string;
  value: string;
  tx_hash?: string;
  created_at: string;
}

// Get user portfolio summary
export const getPortfolioHandler: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "Missing user_id parameter"
      });
    }

    // Get user's portfolio with token details
    const { data: portfolios, error: portfolioError } = await supabase
      .from('portfolios')
      .select(`
        *,
        tokens (
          id,
          name,
          symbol,
          contract_address,
          bonding_curve_params
        )
      `)
      .eq('user_id', userId)
      .gt('balance', 0); // Only include tokens with balance > 0

    if (portfolioError) {
      console.error('Portfolio query error:', portfolioError);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch portfolio"
      });
    }

    if (!portfolios || portfolios.length === 0) {
      return res.json({
        success: true,
        portfolio: {
          user_id: userId,
          total_value: "0",
          total_pnl: "0",
          total_pnl_percentage: "0",
          tokens: []
        }
      });
    }

    // Calculate current prices and values for each token
    const tokensWithValues = await Promise.all(
      portfolios.map(async (portfolio: any) => {
        const token = portfolio.tokens;
        
        // Get current supply to calculate current price
        const { data: trades } = await supabase
          .from('trades')
          .select('amount, type')
          .eq('token_id', token.id);

        let currentSupply = "0";
        if (trades) {
          const totalBought = trades
            .filter((t: any) => t.type === 'buy')
            .reduce((sum: any, t: any) => sum.plus(t.amount), new (require('bignumber.js'))(0));
          const totalSold = trades
            .filter((t: any) => t.type === 'sell')
            .reduce((sum: any, t: any) => sum.plus(t.amount), new (require('bignumber.js'))(0));
          currentSupply = totalBought.minus(totalSold).toFixed(0);
        }

        // Calculate current price using bonding curve
        const { calculateCurrentPrice } = require('./bonding-curve');
        const currentPrice = calculateCurrentPrice(currentSupply, token.bonding_curve_params);

        const balance = new (require('bignumber.js'))(portfolio.balance);
        const avgBuyPrice = new (require('bignumber.js'))(portfolio.avg_buy_price);
        const currentPriceBN = new (require('bignumber.js'))(currentPrice);

        const value = balance.multipliedBy(currentPriceBN);
        const cost = balance.multipliedBy(avgBuyPrice);
        const pnl = value.minus(cost);
        const pnlPercentage = cost.gt(0) ? pnl.dividedBy(cost).multipliedBy(100) : new (require('bignumber.js'))(0);

        return {
          token_id: token.id,
          token_name: token.name,
          token_symbol: token.symbol,
          balance: formatTokenAmount(portfolio.balance),
          avg_buy_price: formatTokenAmount(portfolio.avg_buy_price),
          current_price: formatTokenAmount(currentPrice),
          value: formatTokenAmount(value.toFixed(0)),
          pnl: formatTokenAmount(pnl.toFixed(0)),
          pnl_percentage: pnlPercentage.toFixed(2)
        };
      })
    );

    // Calculate totals
    const totalValue = tokensWithValues.reduce(
      (sum, token) => sum.plus(token.value),
      new (require('bignumber.js'))(0)
    );
    const totalPnl = tokensWithValues.reduce(
      (sum, token) => sum.plus(token.pnl),
      new (require('bignumber.js'))(0)
    );
    const totalCost = totalValue.minus(totalPnl);
    const totalPnlPercentage = totalCost.gt(0) ? totalPnl.dividedBy(totalCost).multipliedBy(100) : new (require('bignumber.js'))(0);

    const portfolioSummary: PortfolioSummary = {
      user_id: userId,
      total_value: formatTokenAmount(totalValue.toFixed(0)),
      total_pnl: formatTokenAmount(totalPnl.toFixed(0)),
      total_pnl_percentage: totalPnlPercentage.toFixed(2),
      tokens: tokensWithValues
    };

    res.json({
      success: true,
      portfolio: portfolioSummary
    });

  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get user trade history
export const getTradeHistoryHandler: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.query;
    const { page = 1, limit = 20, token_id } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "Missing user_id parameter"
      });
    }

    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('trades')
      .select(`
        *,
        tokens (
          id,
          name,
          symbol
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (token_id) {
      query = query.eq('token_id', token_id);
    }

    const { data: trades, error, count } = await query;

    if (error) {
      console.error('Trade history query error:', error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch trade history"
      });
    }

    const tradeHistory: TradeHistory[] = (trades || []).map((trade: any) => {
      const amount = new (require('bignumber.js'))(trade.amount);
      const price = new (require('bignumber.js'))(trade.price);
      const value = amount.multipliedBy(price);

      return {
        id: trade.id,
        token_id: trade.token_id,
        token_name: trade.tokens?.name || 'Unknown',
        token_symbol: trade.tokens?.symbol || 'UNK',
        type: trade.type,
        amount: formatTokenAmount(trade.amount),
        price: formatTokenAmount(trade.price),
        value: formatTokenAmount(value.toFixed(0)),
        tx_hash: trade.tx_hash,
        created_at: trade.created_at
      };
    });

    res.json({
      success: true,
      trades: tradeHistory,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });

  } catch (error) {
    console.error('Get trade history error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get token performance analytics
export const getTokenAnalyticsHandler: RequestHandler = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { period = '24h' } = req.query;

    if (!tokenId) {
      return res.status(400).json({
        success: false,
        error: "Missing token_id parameter"
      });
    }

    // Get token details
    const { data: token, error: tokenError } = await supabase
      .from('tokens')
      .select('*')
      .eq('id', tokenId)
      .single();

    if (tokenError || !token) {
      return res.status(404).json({
        success: false,
        error: "Token not found"
      });
    }

    // Calculate time range based on period
    const now = new Date();
    let startTime: Date;
    
    switch (period) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get trades in the specified period
    const { data: trades, error: tradesError } = await supabase
      .from('trades')
      .select('*')
      .eq('token_id', tokenId)
      .gte('created_at', startTime.toISOString())
      .order('created_at', { ascending: true });

    if (tradesError) {
      console.error('Trades query error:', tradesError);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch trades"
      });
    }

    // Calculate analytics
    const totalVolume = trades?.reduce((sum, trade) => {
      const amount = new (require('bignumber.js'))(trade.amount);
      const price = new (require('bignumber.js'))(trade.price);
      return sum.plus(amount.multipliedBy(price));
    }, new (require('bignumber.js'))(0)) || new (require('bignumber.js'))(0);

    const totalTrades = trades?.length || 0;
    const buyTrades = trades?.filter(t => t.type === 'buy').length || 0;
    const sellTrades = trades?.filter(t => t.type === 'sell').length || 0;

    // Calculate price change
    let priceChange = "0";
    let priceChangePercentage = "0";
    
    if (trades && trades.length > 0) {
      const firstPrice = new (require('bignumber.js'))(trades[0].price);
      const lastPrice = new (require('bignumber.js'))(trades[trades.length - 1].price);
      const change = lastPrice.minus(firstPrice);
      priceChange = change.toFixed(0);
      priceChangePercentage = firstPrice.gt(0) ? change.dividedBy(firstPrice).multipliedBy(100).toFixed(2) : "0";
    }

    const analytics = {
      token_id: tokenId,
      period,
      total_volume: formatTokenAmount(totalVolume.toFixed(0)),
      total_trades: totalTrades,
      buy_trades: buyTrades,
      sell_trades: sellTrades,
      price_change: formatTokenAmount(priceChange),
      price_change_percentage: priceChangePercentage,
      trades: trades?.map(trade => ({
        id: trade.id,
        type: trade.type,
        amount: formatTokenAmount(trade.amount),
        price: formatTokenAmount(trade.price),
        created_at: trade.created_at
      })) || []
    };

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Get token analytics error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get leaderboard for a specific token
export const getTokenLeaderboardHandler: RequestHandler = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { limit = 10 } = req.query;

    // Get top holders for this token
    const { data: portfolios, error } = await supabase
      .from('portfolios')
      .select(`
        user_id,
        balance,
        pnl,
        tokens (
          name,
          symbol
        )
      `)
      .eq('token_id', tokenId)
      .gt('balance', 0)
      .order('balance', { ascending: false })
      .limit(Number(limit));

    if (error) {
      console.error('Leaderboard query error:', error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch leaderboard"
      });
    }

    const leaderboard = (portfolios || []).map((portfolio: any, index: number) => ({
      rank: index + 1,
      user_id: portfolio.user_id,
      balance: formatTokenAmount(portfolio.balance),
      pnl: formatTokenAmount(portfolio.pnl),
      token_name: portfolio.tokens?.name || 'Unknown',
      token_symbol: portfolio.tokens?.symbol || 'UNK'
    }));

    res.json({
      success: true,
      leaderboard
    });

  } catch (error) {
    console.error('Get token leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};
