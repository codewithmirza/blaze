import { RequestHandler } from "express";
import { supabase, Token } from "./database";
import { BondingCurveParams } from "./bonding-curve";
import crypto from "crypto";

interface CreateTokenRequest {
  name: string;
  symbol: string;
  total_supply: string;
  bonding_curve_params: {
    base_price: string;
    slope: string;
    protocol_fee_rate?: string;
  };
  creator_id: string;
}

interface CreateTokenResponse {
  success: boolean;
  token?: Token;
  transaction_data?: {
    to: string;
    data: string;
    value: string;
  };
  error?: string;
}

export const createTokenHandler: RequestHandler = async (req, res) => {
  try {
    const { name, symbol, total_supply, bonding_curve_params, creator_id }: CreateTokenRequest = req.body;

    // Validate input
    if (!name || !symbol || !total_supply || !bonding_curve_params || !creator_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, symbol, total_supply, bonding_curve_params, creator_id"
      });
    }

    // Validate symbol format (3-10 characters, alphanumeric)
    if (!/^[A-Z0-9]{3,10}$/.test(symbol)) {
      return res.status(400).json({
        success: false,
        error: "Symbol must be 3-10 characters, uppercase alphanumeric only"
      });
    }

    // Check if symbol already exists
    const { data: existingToken } = await supabase
      .from('tokens')
      .select('symbol')
      .eq('symbol', symbol)
      .single();

    if (existingToken) {
      return res.status(400).json({
        success: false,
        error: "Token symbol already exists"
      });
    }

    // Set default protocol fee rate if not provided
    const protocol_fee_rate = bonding_curve_params.protocol_fee_rate || "0.01"; // 1%

    // Generate a placeholder contract address (will be updated after deployment)
    const contract_address = `0x${crypto.randomBytes(20).toString('hex')}`;

    // Create token record in database
    const tokenData: Omit<Token, 'id' | 'created_at'> = {
      name,
      symbol,
      contract_address,
      creator_id,
      total_supply,
      bonding_curve_params: {
        base_price: bonding_curve_params.base_price,
        slope: bonding_curve_params.slope,
        protocol_fee_rate
      }
    };

    const { data: token, error: dbError } = await supabase
      .from('tokens')
      .insert(tokenData)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        success: false,
        error: "Failed to create token record"
      });
    }

    // Prepare transaction data for MiniKit
    // This would typically call a TokenFactory contract
    const transactionData = {
      to: process.env.TOKEN_FACTORY_ADDRESS || "0x0000000000000000000000000000000000000000",
      data: generateCreateTokenCalldata(name, symbol, total_supply, bonding_curve_params),
      value: "0"
    };

    const response: CreateTokenResponse = {
      success: true,
      token,
      transaction_data: transactionData
    };

    res.json(response);

  } catch (error) {
    console.error('Create token error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Generate calldata for token creation (simplified)
function generateCreateTokenCalldata(
  name: string,
  symbol: string,
  totalSupply: string,
  bondingCurveParams: BondingCurveParams
): string {
  // This is a simplified version - in reality, you'd use ethers.js or similar
  // to encode the function call to your TokenFactory contract
  
  // Function signature: createToken(string name, string symbol, uint256 totalSupply, uint256 basePrice, uint256 slope)
  const functionSignature = "createToken(string,string,uint256,uint256,uint256)";
  const functionSelector = crypto.createHash('sha256')
    .update(functionSignature)
    .digest('hex')
    .slice(0, 8);

  // For now, return a placeholder
  // In production, you'd properly encode the parameters
  return `0x${functionSelector}${'0'.repeat(512)}`;
}

// Get token details
export const getTokenHandler: RequestHandler = async (req, res) => {
  try {
    const { tokenId } = req.params;

    const { data: token, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('id', tokenId)
      .single();

    if (error || !token) {
      return res.status(404).json({
        success: false,
        error: "Token not found"
      });
    }

    res.json({
      success: true,
      token
    });

  } catch (error) {
    console.error('Get token error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// List all tokens
export const listTokensHandler: RequestHandler = async (req, res) => {
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
      return res.status(500).json({
        success: false,
        error: "Failed to fetch tokens"
      });
    }

    res.json({
      success: true,
      tokens,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });

  } catch (error) {
    console.error('List tokens error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Update token contract address after deployment
export const updateTokenContractHandler: RequestHandler = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { contract_address, tx_hash } = req.body;

    if (!contract_address || !tx_hash) {
      return res.status(400).json({
        success: false,
        error: "Missing contract_address or tx_hash"
      });
    }

    const { data: token, error } = await supabase
      .from('tokens')
      .update({ contract_address })
      .eq('id', tokenId)
      .select()
      .single();

    if (error || !token) {
      return res.status(404).json({
        success: false,
        error: "Token not found or update failed"
      });
    }

    res.json({
      success: true,
      token
    });

  } catch (error) {
    console.error('Update token contract error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};
