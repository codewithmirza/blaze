import { RequestHandler } from "express";
import { supabase, Quest, QuestSubmission } from "./database";
import { formatTokenAmount } from "./bonding-curve";

interface CreateQuestRequest {
  title: string;
  description?: string;
  token_slate: string[]; // Array of token IDs
  start_date: string;
  end_date: string;
  prize_pool: string;
  entry_fee?: string;
  max_participants?: number;
}

interface SubmitPortfolioRequest {
  quest_id: string;
  user_id: string;
  portfolio: {
    [tokenId: string]: {
      amount: string;
      allocation_percentage: number;
    };
  };
}

interface QuestLeaderboardEntry {
  rank: number;
  user_id: string;
  score: number;
  portfolio: {
    [tokenId: string]: {
      amount: string;
      allocation_percentage: number;
    };
  };
  submitted_at: string;
}

// Create a new quest
export const createQuestHandler: RequestHandler = async (req, res) => {
  try {
    const {
      title,
      description,
      token_slate,
      start_date,
      end_date,
      prize_pool,
      entry_fee = "0",
      max_participants
    }: CreateQuestRequest = req.body;

    // Validate input
    if (!title || !token_slate || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: title, token_slate, start_date, end_date"
      });
    }

    // Validate token slate exists
    const { data: tokens, error: tokensError } = await supabase
      .from('tokens')
      .select('id')
      .in('id', token_slate);

    if (tokensError || !tokens || tokens.length !== token_slate.length) {
      return res.status(400).json({
        success: false,
        error: "Invalid token_slate: some tokens do not exist"
      });
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const now = new Date();

    if (startDate <= now) {
      return res.status(400).json({
        success: false,
        error: "Start date must be in the future"
      });
    }

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        error: "End date must be after start date"
      });
    }

    // Create quest
    const questData: Omit<Quest, 'id'> = {
      title,
      description,
      token_slate,
      start_date,
      end_date,
      prize_pool,
      status: 'active'
    };

    const { data: quest, error: questError } = await supabase
      .from('quests')
      .insert(questData)
      .select()
      .single();

    if (questError) {
      console.error('Database error:', questError);
      return res.status(500).json({
        success: false,
        error: "Failed to create quest"
      });
    }

    res.json({
      success: true,
      quest
    });

  } catch (error) {
    console.error('Create quest error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get all active quests
export const getQuestsHandler: RequestHandler = async (req, res) => {
  try {
    const { status = 'active', page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('quests')
      .select(`
        *,
        tokens!inner (
          id,
          name,
          symbol,
          contract_address
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: quests, error, count } = await query;

    if (error) {
      console.error('Quests query error:', error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch quests"
      });
    }

    // Format quests with token details
    const formattedQuests = (quests || []).map((quest: any) => ({
      ...quest,
      token_slate: quest.tokens.map((token: any) => ({
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        contract_address: token.contract_address
      }))
    }));

    res.json({
      success: true,
      quests: formattedQuests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });

  } catch (error) {
    console.error('Get quests error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get quest details
export const getQuestHandler: RequestHandler = async (req, res) => {
  try {
    const { questId } = req.params;

    const { data: quest, error } = await supabase
      .from('quests')
      .select(`
        *,
        tokens!inner (
          id,
          name,
          symbol,
          contract_address
        )
      `)
      .eq('id', questId)
      .single();

    if (error || !quest) {
      return res.status(404).json({
        success: false,
        error: "Quest not found"
      });
    }

    // Format quest with token details
    const formattedQuest = {
      ...quest,
      token_slate: quest.tokens.map((token: any) => ({
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        contract_address: token.contract_address
      }))
    };

    res.json({
      success: true,
      quest: formattedQuest
    });

  } catch (error) {
    console.error('Get quest error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Submit portfolio for quest
export const submitPortfolioHandler: RequestHandler = async (req, res) => {
  try {
    const { quest_id, user_id, portfolio }: SubmitPortfolioRequest = req.body;

    if (!quest_id || !user_id || !portfolio) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: quest_id, user_id, portfolio"
      });
    }

    // Get quest details
    const { data: quest, error: questError } = await supabase
      .from('quests')
      .select('*')
      .eq('id', quest_id)
      .single();

    if (questError || !quest) {
      return res.status(404).json({
        success: false,
        error: "Quest not found"
      });
    }

    // Check if quest is active
    const now = new Date();
    const startDate = new Date(quest.start_date);
    const endDate = new Date(quest.end_date);

    if (now < startDate) {
      return res.status(400).json({
        success: false,
        error: "Quest has not started yet"
      });
    }

    if (now > endDate) {
      return res.status(400).json({
        success: false,
        error: "Quest has ended"
      });
    }

    // Validate portfolio tokens are in quest slate
    const portfolioTokenIds = Object.keys(portfolio);
    const invalidTokens = portfolioTokenIds.filter(tokenId => !quest.token_slate.includes(tokenId));
    
    if (invalidTokens.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid tokens in portfolio: ${invalidTokens.join(', ')}`
      });
    }

    // Check if user already submitted
    const { data: existingSubmission } = await supabase
      .from('quest_submissions')
      .select('id')
      .eq('quest_id', quest_id)
      .eq('user_id', user_id)
      .single();

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        error: "Portfolio already submitted for this quest"
      });
    }

    // Calculate score based on portfolio performance
    const score = await calculatePortfolioScore(quest_id, portfolio);

    // Create submission
    const submissionData: Omit<QuestSubmission, 'id' | 'submitted_at'> = {
      quest_id,
      user_id,
      portfolio,
      score
    };

    const { data: submission, error: submissionError } = await supabase
      .from('quest_submissions')
      .insert(submissionData)
      .select()
      .single();

    if (submissionError) {
      console.error('Database error:', submissionError);
      return res.status(500).json({
        success: false,
        error: "Failed to submit portfolio"
      });
    }

    res.json({
      success: true,
      submission
    });

  } catch (error) {
    console.error('Submit portfolio error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get quest leaderboard
export const getQuestLeaderboardHandler: RequestHandler = async (req, res) => {
  try {
    const { questId } = req.params;
    const { limit = 10 } = req.query;

    const { data: submissions, error } = await supabase
      .from('quest_submissions')
      .select('*')
      .eq('quest_id', questId)
      .order('score', { ascending: false })
      .limit(Number(limit));

    if (error) {
      console.error('Leaderboard query error:', error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch leaderboard"
      });
    }

    const leaderboard: QuestLeaderboardEntry[] = (submissions || []).map((submission: any, index: number) => ({
      rank: index + 1,
      user_id: submission.user_id,
      score: submission.score,
      portfolio: submission.portfolio,
      submitted_at: submission.submitted_at
    }));

    res.json({
      success: true,
      leaderboard
    });

  } catch (error) {
    console.error('Get quest leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Get user's quest submissions
export const getUserSubmissionsHandler: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "Missing user_id parameter"
      });
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { data: submissions, error, count } = await supabase
      .from('quest_submissions')
      .select(`
        *,
        quests (
          id,
          title,
          description,
          prize_pool,
          status
        )
      `)
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      console.error('User submissions query error:', error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch submissions"
      });
    }

    res.json({
      success: true,
      submissions: submissions || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });

  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Calculate portfolio score based on token performance
async function calculatePortfolioScore(questId: string, portfolio: any): Promise<number> {
  try {
    // Get quest details
    const { data: quest } = await supabase
      .from('quests')
      .select('token_slate')
      .eq('id', questId)
      .single();

    if (!quest) return 0;

    let totalScore = 0;
    let totalWeight = 0;

    // Calculate score for each token in portfolio
    for (const [tokenId, allocation] of Object.entries(portfolio)) {
      const { allocation_percentage } = allocation as any;
      
      // Get token performance (simplified - in production, you'd calculate based on price changes)
      const { data: trades } = await supabase
        .from('trades')
        .select('price, created_at')
        .eq('token_id', tokenId)
        .order('created_at', { ascending: false })
        .limit(2);

      if (trades && trades.length >= 2) {
        const currentPrice = new (require('bignumber.js'))(trades[0].price);
        const previousPrice = new (require('bignumber.js'))(trades[1].price);
        const priceChange = currentPrice.minus(previousPrice).dividedBy(previousPrice).multipliedBy(100);
        
        // Score is weighted by allocation percentage
        const tokenScore = priceChange.toNumber() * (allocation_percentage / 100);
        totalScore += tokenScore;
        totalWeight += allocation_percentage;
      }
    }

    // Normalize score
    return totalWeight > 0 ? totalScore / (totalWeight / 100) : 0;

  } catch (error) {
    console.error('Calculate portfolio score error:', error);
    return 0;
  }
}

// Update quest status (admin function)
export const updateQuestStatusHandler: RequestHandler = async (req, res) => {
  try {
    const { questId } = req.params;
    const { status } = req.body;

    if (!['active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be 'active', 'completed', or 'cancelled'"
      });
    }

    const { data: quest, error } = await supabase
      .from('quests')
      .update({ status })
      .eq('id', questId)
      .select()
      .single();

    if (error || !quest) {
      return res.status(404).json({
        success: false,
        error: "Quest not found or update failed"
      });
    }

    res.json({
      success: true,
      quest
    });

  } catch (error) {
    console.error('Update quest status error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};
