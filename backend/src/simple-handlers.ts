import { Request, Response } from "express";
import { supabase } from "./database";

// Simple handlers without complex TypeScript issues
export const simpleGetPortfolioHandler = async (req: Request, res: Response) => {
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

    res.json({
      success: true,
      portfolio: {
        user_id: userId,
        total_value: "0",
        total_pnl: "0",
        total_pnl_percentage: "0",
        tokens: portfolios || []
      }
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const simpleListTokensHandler = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { data: tokens, error, count } = await supabase
      .from('tokens')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

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

export const simpleCreateTokenHandler = async (req: Request, res: Response) => {
  try {
    const { name, symbol, total_supply, bonding_curve_params, creator_id } = req.body;

    if (!name || !symbol || !total_supply || !bonding_curve_params || !creator_id) {
      res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
      return;
    }

    // Create token record
    const tokenData = {
      name,
      symbol,
      contract_address: `0x${Math.random().toString(16).substr(2, 40)}`,
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
      token
    });
  } catch (error) {
    console.error('Create token error:', error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const simpleGetQuestsHandler = async (req: Request, res: Response) => {
  try {
    const { data: quests, error } = await supabase
      .from('quests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Quests query error:', error);
      res.status(500).json({ success: false, error: "Failed to fetch quests" });
      return;
    }

    res.json({
      success: true,
      quests: quests || []
    });
  } catch (error) {
    console.error('Get quests error:', error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
