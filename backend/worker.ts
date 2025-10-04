import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Env = {
  DB: D1Database;
  ASSETS: Fetcher;
  APP_ID: string;
  DEV_PORTAL_API_KEY: string;
  TOKEN_FACTORY_ADDRESS: string;
  TREASURY_ADDRESS: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors());

// Utility functions
const generateId = () => crypto.randomUUID();
const formatTokenAmount = (amount: string, decimals: number = 18): string => {
  const amountBN = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  return (Number(amountBN) / Number(divisor)).toFixed(6);
};

const parseTokenAmount = (amount: string, decimals: number = 18): string => {
  const amountBN = BigInt(Math.floor(parseFloat(amount) * (10 ** decimals)));
  return amountBN.toString();
};

// Bonding curve calculations
const calculateCurrentPrice = (tokensSold: string, basePrice: string, slope: string): string => {
  const sold = BigInt(tokensSold);
  const base = BigInt(basePrice);
  const slopeBN = BigInt(slope);
  const currentPrice = base + (sold * slopeBN);
  return currentPrice.toString();
};

const calculateBuyPrice = (amount: string, currentSupply: string, basePrice: string, slope: string): { totalCost: string; averagePrice: string; protocolFee: string } => {
  const buyAmount = BigInt(amount);
  const currentPrice = BigInt(calculateCurrentPrice(currentSupply, basePrice, slope));
  const slopeBN = BigInt(slope);
  
  // For linear curve: cost = amount * (current_price + (amount * slope) / 2)
  const totalCost = buyAmount * (currentPrice + (buyAmount * slopeBN) / BigInt(2));
  const protocolFee = totalCost / BigInt(100); // 1% fee
  const averagePrice = totalCost / buyAmount;
  
  return {
    totalCost: totalCost.toString(),
    averagePrice: averagePrice.toString(),
    protocolFee: protocolFee.toString()
  };
};

const calculateSellPrice = (amount: string, currentSupply: string, basePrice: string, slope: string): { totalValue: string; averagePrice: string; protocolFee: string } => {
  const sellAmount = BigInt(amount);
  const currentPrice = BigInt(calculateCurrentPrice(currentSupply, basePrice, slope));
  const slopeBN = BigInt(slope);
  
  const sellPrice = currentPrice - (sellAmount * slopeBN) / BigInt(2);
  const totalValue = sellAmount * sellPrice;
  const protocolFee = totalValue / BigInt(100); // 1% fee
  const averagePrice = totalValue / sellAmount;
  
  return {
    totalValue: totalValue.toString(),
    averagePrice: averagePrice.toString(),
    protocolFee: protocolFee.toString()
  };
};

app.get('/ping', c => c.text('blaze-it-worker v1'));

// World ID verification
app.post('/verify', async c => {
  try {
    const { proof, merkle_root, nullifier_hash, verification_level } = await c.req.json();
    
    // In production, verify with World ID service
    // For now, simulate verification
    const userId = generateId();
    const worldId = generateId();
    const address = '0x' + Math.random().toString(16).substr(2, 40);
    
    return c.json({
      success: true,
      userId,
      worldId,
      address,
      verification_level: verification_level || 'orb'
    });
  } catch (error) {
    console.error('Verification error:', error);
    return c.json({ success: false, error: 'Verification failed' }, 500);
  }
});

// Token management
app.get('/api/tokens', async c => {
  try {
    const { page = 1, limit = 20, search } = c.req.query();
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = `
      SELECT * FROM tokens 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    const { results } = await c.env.DB.prepare(query).bind(Number(limit), offset).all();
    
    return c.json({
      success: true,
      tokens: results || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: results?.length || 0
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ success: false, error: 'Failed to fetch tokens' }, 500);
  }
});

app.post('/api/tokens', async c => {
  try {
    const { name, symbol, total_supply, bonding_curve_params, creator_id } = await c.req.json();
    
    if (!name || !symbol || !total_supply || !bonding_curve_params || !creator_id) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }
    
    // Validate symbol format
    if (!/^[A-Z0-9]{3,10}$/.test(symbol)) {
      return c.json({ success: false, error: 'Symbol must be 3-10 characters, uppercase alphanumeric only' }, 400);
    }
    
    // Check if symbol already exists
    const { results: existingToken } = await c.env.DB.prepare(`
      SELECT symbol FROM tokens WHERE symbol = ?
    `).bind(symbol).all();
    
    if (existingToken && existingToken.length > 0) {
      return c.json({ success: false, error: 'Token symbol already exists' }, 400);
    }
    
    const tokenId = generateId();
    const contractAddress = '0x' + Math.random().toString(16).substr(2, 40);
    const bondingCurveAddress = '0x' + Math.random().toString(16).substr(2, 40);
    
    // Create token record
    await c.env.DB.prepare(`
      INSERT INTO tokens (id, name, symbol, contract_address, bonding_curve_address, creator_id, total_supply, bonding_curve_params)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      tokenId,
      name,
      symbol,
      contractAddress,
      bondingCurveAddress,
      creator_id,
      total_supply,
      JSON.stringify(bonding_curve_params)
    ).run();
    
    return c.json({
      success: true,
      token: {
        id: tokenId,
        name,
        symbol,
        contract_address: contractAddress,
        bonding_curve_address: bondingCurveAddress,
        creator_id,
        total_supply,
        bonding_curve_params
      },
      transaction_data: {
        to: c.env.TOKEN_FACTORY_ADDRESS,
        data: '0x', // In production, this would be the actual deployment calldata
        value: '0'
      }
    });
  } catch (error) {
    console.error('Create token error:', error);
    return c.json({ success: false, error: 'Failed to create token' }, 500);
  }
});

app.get('/api/tokens/:tokenId', async c => {
  try {
    const tokenId = c.req.param('tokenId');
    
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM tokens WHERE id = ?
    `).bind(tokenId).first();
    
    if (!results) {
      return c.json({ success: false, error: 'Token not found' }, 404);
    }
    
    return c.json({ success: true, token: results });
  } catch (error) {
    console.error('Get token error:', error);
    return c.json({ success: false, error: 'Failed to fetch token' }, 500);
  }
});

// Trading endpoints
app.get('/api/trading/quote', async c => {
  try {
    const { token_id, trade_type, amount } = c.req.query();
    
    if (!token_id || !trade_type || !amount) {
      return c.json({ success: false, error: 'Missing required parameters' }, 400);
    }
    
    // Get token details
    const { results: token } = await c.env.DB.prepare(`
      SELECT * FROM tokens WHERE id = ?
    `).bind(token_id).first();
    
    if (!token) {
      return c.json({ success: false, error: 'Token not found' }, 404);
    }
    
    const bondingCurveParams = JSON.parse(token.bonding_curve_params);
    const currentSupply = '0'; // In production, get from contract
    
    let priceData;
    if (trade_type === 'buy') {
      priceData = calculateBuyPrice(amount, currentSupply, bondingCurveParams.base_price, bondingCurveParams.slope);
    } else {
      priceData = calculateSellPrice(amount, currentSupply, bondingCurveParams.base_price, bondingCurveParams.slope);
    }
    
    return c.json({
      success: true,
      quote: {
        token_id,
        trade_type,
        amount,
        current_price: priceData.averagePrice,
        total_cost: trade_type === 'buy' ? priceData.totalCost : priceData.totalValue,
        average_price: priceData.averagePrice,
        protocol_fee: priceData.protocolFee,
        slippage: '0.1',
        price_impact: '0.05',
        transaction_data: {
          to: token.contract_address,
          data: '0x', // In production, this would be the actual trade calldata
          value: trade_type === 'buy' ? priceData.totalCost : '0'
        }
      }
    });
  } catch (error) {
    console.error('Get quote error:', error);
    return c.json({ success: false, error: 'Failed to get quote' }, 500);
  }
});

app.post('/api/trading/buy', async c => {
  try {
    const { token_id, amount, user_id, tx_hash } = await c.req.json();
    
    if (!token_id || !amount || !user_id) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }
    
    // Get token details for price calculation
    const { results: token } = await c.env.DB.prepare(`
      SELECT * FROM tokens WHERE id = ?
    `).bind(token_id).first();
    
    if (!token) {
      return c.json({ success: false, error: 'Token not found' }, 404);
    }
    
    const bondingCurveParams = JSON.parse(token.bonding_curve_params);
    const currentSupply = '0'; // In production, get from contract
    const priceData = calculateBuyPrice(amount, currentSupply, bondingCurveParams.base_price, bondingCurveParams.slope);
    
    // Record trade
    const tradeId = generateId();
    await c.env.DB.prepare(`
      INSERT INTO trades (id, user_id, token_id, type, amount, price, tx_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(tradeId, user_id, token_id, 'buy', amount, priceData.averagePrice, tx_hash || '').run();
    
    // Update portfolio
    const { results: existingPortfolio } = await c.env.DB.prepare(`
      SELECT * FROM portfolios WHERE user_id = ? AND token_id = ?
    `).bind(user_id, token_id).first();
    
    if (existingPortfolio) {
      // Update existing holding
      const newBalance = BigInt(existingPortfolio.balance) + BigInt(amount);
      const newTotalCost = BigInt(existingPortfolio.avg_buy_price) * BigInt(existingPortfolio.balance) + BigInt(priceData.totalCost);
      const newAvgPrice = newTotalCost / newBalance;
      
      await c.env.DB.prepare(`
        UPDATE portfolios 
        SET balance = ?, avg_buy_price = ?
        WHERE user_id = ? AND token_id = ?
      `).bind(newBalance.toString(), newAvgPrice.toString(), user_id, token_id).run();
    } else {
      // Create new holding
      await c.env.DB.prepare(`
        INSERT INTO portfolios (user_id, token_id, balance, avg_buy_price, pnl)
        VALUES (?, ?, ?, ?, ?)
      `).bind(user_id, token_id, amount, priceData.averagePrice, '0').run();
    }
    
    return c.json({ success: true, trade: { id: tradeId, user_id, token_id, type: 'buy', amount, price: priceData.averagePrice, tx_hash } });
  } catch (error) {
    console.error('Buy token error:', error);
    return c.json({ success: false, error: 'Failed to record buy trade' }, 500);
  }
});

app.post('/api/trading/sell', async c => {
  try {
    const { token_id, amount, user_id, tx_hash } = await c.req.json();
    
    if (!token_id || !amount || !user_id) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }
    
    // Check if user has enough balance
    const { results: portfolio } = await c.env.DB.prepare(`
      SELECT * FROM portfolios WHERE user_id = ? AND token_id = ? AND balance >= ?
    `).bind(user_id, token_id, amount).first();
    
    if (!portfolio) {
      return c.json({ success: false, error: 'Insufficient balance' }, 400);
    }
    
    // Get token details for price calculation
    const { results: token } = await c.env.DB.prepare(`
      SELECT * FROM tokens WHERE id = ?
    `).bind(token_id).first();
    
    if (!token) {
      return c.json({ success: false, error: 'Token not found' }, 404);
    }
    
    const bondingCurveParams = JSON.parse(token.bonding_curve_params);
    const currentSupply = '0'; // In production, get from contract
    const priceData = calculateSellPrice(amount, currentSupply, bondingCurveParams.base_price, bondingCurveParams.slope);
    
    // Record trade
    const tradeId = generateId();
    await c.env.DB.prepare(`
      INSERT INTO trades (id, user_id, token_id, type, amount, price, tx_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(tradeId, user_id, token_id, 'sell', amount, priceData.averagePrice, tx_hash || '').run();
    
    // Update portfolio
    const newBalance = BigInt(portfolio.balance) - BigInt(amount);
    const sellValue = BigInt(priceData.totalValue);
    const costBasis = BigInt(portfolio.avg_buy_price) * BigInt(amount);
    const pnl = sellValue - costBasis;
    const newPnl = BigInt(portfolio.pnl) + pnl;
    
    if (newBalance === BigInt(0)) {
      // Remove holding if balance is zero
      await c.env.DB.prepare(`
        DELETE FROM portfolios WHERE user_id = ? AND token_id = ?
      `).bind(user_id, token_id).run();
    } else {
      // Update holding
      await c.env.DB.prepare(`
        UPDATE portfolios 
        SET balance = ?, pnl = ?
        WHERE user_id = ? AND token_id = ?
      `).bind(newBalance.toString(), newPnl.toString(), user_id, token_id).run();
    }
    
    return c.json({ success: true, trade: { id: tradeId, user_id, token_id, type: 'sell', amount, price: priceData.averagePrice, tx_hash } });
  } catch (error) {
    console.error('Sell token error:', error);
    return c.json({ success: false, error: 'Failed to record sell trade' }, 500);
  }
});

// Portfolio endpoints
app.get('/api/portfolio/:userId', async c => {
  try {
    const userId = c.req.param('userId');
    
    const { results: portfolios } = await c.env.DB.prepare(`
      SELECT p.*, t.name as token_name, t.symbol as token_symbol, t.contract_address
      FROM portfolios p
      JOIN tokens t ON p.token_id = t.id
      WHERE p.user_id = ? AND p.balance > 0
    `).bind(userId).all();
    
    // Calculate totals
    const totalValue = portfolios?.reduce((sum, p) => sum + parseFloat(p.balance || '0') * parseFloat(p.avg_buy_price || '0'), 0) || 0;
    const totalPnl = portfolios?.reduce((sum, p) => sum + parseFloat(p.pnl || '0'), 0) || 0;
    const totalPnlPercentage = totalValue > 0 ? (totalPnl / totalValue) * 100 : 0;
    
    return c.json({
      success: true,
      portfolio: {
        user_id: userId,
        total_value: totalValue.toString(),
        total_pnl: totalPnl.toString(),
        total_pnl_percentage: totalPnlPercentage.toFixed(2),
        holdings: portfolios || []
      }
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    return c.json({ success: false, error: 'Failed to fetch portfolio' }, 500);
  }
});

app.get('/api/portfolio/:userId/trades', async c => {
  try {
    const userId = c.req.param('userId');
    const { page = 1, limit = 20 } = c.req.query();
    const offset = (Number(page) - 1) * Number(limit);
    
    const { results: trades } = await c.env.DB.prepare(`
      SELECT t.*, tok.name as token_name, tok.symbol as token_symbol
      FROM trades t
      JOIN tokens tok ON t.token_id = tok.id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(userId, Number(limit), offset).all();
    
    return c.json({
      success: true,
      trades: trades || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: trades?.length || 0
      }
    });
  } catch (error) {
    console.error('Get trades error:', error);
    return c.json({ success: false, error: 'Failed to fetch trades' }, 500);
  }
});

// Quest endpoints
app.get('/api/quests', async c => {
  try {
    const { status = 'active', page = 1, limit = 20 } = c.req.query();
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = `
      SELECT * FROM quests 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    if (status) {
      query = `
        SELECT * FROM quests 
        WHERE status = ?
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;
    }
    
    const { results: quests } = await c.env.DB.prepare(query).bind(
      status ? [status, Number(limit), offset] : [Number(limit), offset]
    ).all();
    
    return c.json({
      success: true,
      quests: quests || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: quests?.length || 0
      }
    });
  } catch (error) {
    console.error('Get quests error:', error);
    return c.json({ success: false, error: 'Failed to fetch quests' }, 500);
  }
});

app.post('/api/quests', async c => {
  try {
    const { title, description, token_slate, start_date, end_date, prize_pool } = await c.req.json();
    
    if (!title || !token_slate || !start_date || !end_date) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }
    
    const questId = generateId();
    
    await c.env.DB.prepare(`
      INSERT INTO quests (id, title, description, token_slate, start_date, end_date, prize_pool, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      questId,
      title,
      description || '',
      JSON.stringify(token_slate),
      start_date,
      end_date,
      prize_pool || '0',
      'active'
    ).run();
    
    return c.json({
      success: true,
      quest: {
        id: questId,
        title,
        description,
        token_slate,
        start_date,
        end_date,
        prize_pool: prize_pool || '0',
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Create quest error:', error);
    return c.json({ success: false, error: 'Failed to create quest' }, 500);
  }
});

app.get('/api/quests/:questId', async c => {
  try {
    const questId = c.req.param('questId');
    
    const { results: quest } = await c.env.DB.prepare(`
      SELECT * FROM quests WHERE id = ?
    `).bind(questId).first();
    
    if (!quest) {
      return c.json({ success: false, error: 'Quest not found' }, 404);
    }
    
    return c.json({ success: true, quest });
  } catch (error) {
    console.error('Get quest error:', error);
    return c.json({ success: false, error: 'Failed to fetch quest' }, 500);
  }
});

app.post('/api/quests/:questId/submit', async c => {
  try {
    const questId = c.req.param('questId');
    const { user_id, portfolio } = await c.req.json();
    
    if (!user_id || !portfolio) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }
    
    // Check if quest exists and is active
    const { results: quest } = await c.env.DB.prepare(`
      SELECT * FROM quests WHERE id = ? AND status = 'active'
    `).bind(questId).first();
    
    if (!quest) {
      return c.json({ success: false, error: 'Quest not found or not active' }, 404);
    }
    
    // Calculate score based on portfolio allocation
    const tokenSlate = JSON.parse(quest.token_slate);
    let score = 0;
    
    for (const tokenId of tokenSlate) {
      if (portfolio[tokenId]) {
        score += portfolio[tokenId].allocation_percentage || 0;
      }
    }
    
    const submissionId = generateId();
    
    await c.env.DB.prepare(`
      INSERT INTO quest_submissions (id, quest_id, user_id, portfolio, score)
      VALUES (?, ?, ?, ?, ?)
    `).bind(submissionId, questId, user_id, JSON.stringify(portfolio), score).run();
    
    return c.json({
      success: true,
      submission: {
        id: submissionId,
        quest_id: questId,
        user_id,
        portfolio,
        score
      }
    });
  } catch (error) {
    console.error('Submit portfolio error:', error);
    return c.json({ success: false, error: 'Failed to submit portfolio' }, 500);
  }
});

app.get('/api/quests/:questId/leaderboard', async c => {
  try {
    const questId = c.req.param('questId');
    
    const { results: leaderboard } = await c.env.DB.prepare(`
      SELECT user_id, score, submitted_at
      FROM quest_submissions
      WHERE quest_id = ?
      ORDER BY score DESC
      LIMIT 50
    `).bind(questId).all();
    
    return c.json({
      success: true,
      leaderboard: leaderboard || []
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return c.json({ success: false, error: 'Failed to fetch leaderboard' }, 500);
  }
});

// Serve static assets with SPA fallback
app.all('*', async c => {
  const res = await c.env.ASSETS.fetch(c.req.raw);
  if (res.status === 404 && c.req.method === 'GET') {
    const accept = c.req.header('accept') || '';
    if (accept.includes('text/html')) {
      const url = new URL(c.req.url);
      return await c.env.ASSETS.fetch(new Request(new URL('/index.html', url.origin)));
    }
  }
  return res;
});

export default app;
