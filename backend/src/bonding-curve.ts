import { BigNumber } from 'bignumber.js';

// Bonding curve parameters interface
export interface BondingCurveParams {
  base_price: string;        // Starting price (in wei)
  slope: string;            // Price increase per token sold (in wei)
  protocol_fee_rate: string; // Protocol fee rate (e.g., "0.01" for 1%)
}

// Calculate current price based on tokens sold
export function calculateCurrentPrice(
  tokensSold: string,
  params: BondingCurveParams
): string {
  const sold = new BigNumber(tokensSold);
  const basePrice = new BigNumber(params.base_price);
  const slope = new BigNumber(params.slope);
  
  // Linear bonding curve: price = base_price + (tokens_sold * slope)
  const currentPrice = basePrice.plus(sold.multipliedBy(slope));
  
  return currentPrice.toFixed(0);
}

// Calculate price for buying a specific amount of tokens
export function calculateBuyPrice(
  amount: string,
  currentSupply: string,
  params: BondingCurveParams
): { totalCost: string; averagePrice: string; protocolFee: string } {
  const buyAmount = new BigNumber(amount);
  const currentPrice = new BigNumber(calculateCurrentPrice(currentSupply, params));
  const slope = new BigNumber(params.slope);
  const protocolFeeRate = new BigNumber(params.protocol_fee_rate);
  
  // For linear curve: cost = amount * (current_price + (amount * slope) / 2)
  // This is the integral of the price function
  const totalCost = buyAmount.multipliedBy(
    currentPrice.plus(buyAmount.multipliedBy(slope).dividedBy(2))
  );
  
  const protocolFee = totalCost.multipliedBy(protocolFeeRate);
  const netCost = totalCost.minus(protocolFee);
  const averagePrice = totalCost.dividedBy(buyAmount);
  
  return {
    totalCost: totalCost.toFixed(0),
    averagePrice: averagePrice.toFixed(0),
    protocolFee: protocolFee.toFixed(0)
  };
}

// Calculate price for selling a specific amount of tokens
export function calculateSellPrice(
  amount: string,
  currentSupply: string,
  params: BondingCurveParams
): { totalValue: string; averagePrice: string; protocolFee: string } {
  const sellAmount = new BigNumber(amount);
  const currentPrice = new BigNumber(calculateCurrentPrice(currentSupply, params));
  const slope = new BigNumber(params.slope);
  const protocolFeeRate = new BigNumber(params.protocol_fee_rate);
  
  // For selling, we need to calculate the price at the current supply
  // and subtract the slope effect
  const sellPrice = currentPrice.minus(sellAmount.multipliedBy(slope).dividedBy(2));
  const totalValue = sellAmount.multipliedBy(sellPrice);
  
  const protocolFee = totalValue.multipliedBy(protocolFeeRate);
  const netValue = totalValue.minus(protocolFee);
  const averagePrice = totalValue.dividedBy(sellAmount);
  
  return {
    totalValue: totalValue.toFixed(0),
    averagePrice: averagePrice.toFixed(0),
    protocolFee: protocolFee.toFixed(0)
  };
}

// Calculate slippage for a trade
export function calculateSlippage(
  amount: string,
  currentSupply: string,
  params: BondingCurveParams,
  tradeType: 'buy' | 'sell'
): { slippage: string; priceImpact: string } {
  const tradeAmount = new BigNumber(amount);
  const currentPrice = new BigNumber(calculateCurrentPrice(currentSupply, params));
  const slope = new BigNumber(params.slope);
  
  let executionPrice: BigNumber;
  
  if (tradeType === 'buy') {
    executionPrice = currentPrice.plus(tradeAmount.multipliedBy(slope).dividedBy(2));
  } else {
    executionPrice = currentPrice.minus(tradeAmount.multipliedBy(slope).dividedBy(2));
  }
  
  const priceImpact = executionPrice.minus(currentPrice).dividedBy(currentPrice).multipliedBy(100);
  const slippage = tradeAmount.multipliedBy(slope).dividedBy(currentPrice).multipliedBy(100);
  
  return {
    slippage: slippage.toFixed(2),
    priceImpact: priceImpact.toFixed(2)
  };
}

// Validate trade parameters
export function validateTrade(
  amount: string,
  currentSupply: string,
  maxSupply: string,
  tradeType: 'buy' | 'sell',
  userBalance?: string
): { valid: boolean; error?: string } {
  const tradeAmount = new BigNumber(amount);
  const supply = new BigNumber(currentSupply);
  const max = new BigNumber(maxSupply);
  
  if (tradeAmount.lte(0)) {
    return { valid: false, error: 'Trade amount must be greater than 0' };
  }
  
  if (tradeType === 'buy') {
    if (supply.plus(tradeAmount).gt(max)) {
      return { valid: false, error: 'Trade would exceed maximum supply' };
    }
  } else {
    if (tradeAmount.gt(supply)) {
      return { valid: false, error: 'Insufficient token supply to sell' };
    }
    
    if (userBalance && tradeAmount.gt(userBalance)) {
      return { valid: false, error: 'Insufficient user balance' };
    }
  }
  
  return { valid: true };
}

// Convert wei to human readable format
export function formatTokenAmount(amount: string, decimals: number = 18): string {
  const amountBN = new BigNumber(amount);
  const divisor = new BigNumber(10).pow(decimals);
  return amountBN.dividedBy(divisor).toFixed(6);
}

// Convert human readable format to wei
export function parseTokenAmount(amount: string, decimals: number = 18): string {
  const amountBN = new BigNumber(amount);
  const multiplier = new BigNumber(10).pow(decimals);
  return amountBN.multipliedBy(multiplier).toFixed(0);
}
