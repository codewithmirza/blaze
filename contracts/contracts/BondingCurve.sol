// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BondingCurve is Ownable, ReentrancyGuard {
    IERC20 public immutable token;
    address public immutable treasury;
    
    uint256 public immutable basePrice;
    uint256 public immutable slope;
    uint256 public immutable protocolFeeRate;
    
    uint256 public totalSold;
    uint256 public totalRaised;
    
    bool public tradingPaused = false;
    
    event TokensBought(
        address indexed buyer,
        uint256 tokenAmount,
        uint256 ethAmount,
        uint256 price
    );
    
    event TokensSold(
        address indexed seller,
        uint256 tokenAmount,
        uint256 ethAmount,
        uint256 price
    );
    
    event TradingPaused();
    event TradingResumed();

    constructor(
        address _token,
        uint256 _basePrice,
        uint256 _slope,
        uint256 _protocolFeeRate,
        address _treasury
    ) {
        token = IERC20(_token);
        basePrice = _basePrice;
        slope = _slope;
        protocolFeeRate = _protocolFeeRate;
        treasury = _treasury;
        _transferOwnership(msg.sender);
    }

    function buyTokens() external payable {
        require(!tradingPaused, "Trading is paused");
        require(msg.value > 0, "Must send ETH to buy tokens");
        
        uint256 currentPrice = getCurrentPrice();
        uint256 tokenAmount = (msg.value * 1e18) / currentPrice;
        
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(tokenAmount <= token.balanceOf(address(this)), "Insufficient token supply");
        
        uint256 protocolFee = (msg.value * protocolFeeRate) / 10000;
        uint256 netAmount = msg.value - protocolFee;
        
        // Update state
        totalSold += tokenAmount;
        totalRaised += netAmount;
        
        // Transfer tokens to buyer
        token.transfer(msg.sender, tokenAmount);
        
        // Send protocol fee to treasury
        if (protocolFee > 0) {
            payable(treasury).transfer(protocolFee);
        }
        
        emit TokensBought(msg.sender, tokenAmount, msg.value, currentPrice);
    }

    function sellTokens(uint256 tokenAmount) external {
        require(!tradingPaused, "Trading is paused");
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(token.balanceOf(msg.sender) >= tokenAmount, "Insufficient token balance");
        
        uint256 currentPrice = getCurrentPrice();
        uint256 ethAmount = (tokenAmount * currentPrice) / 1e18;
        
        require(ethAmount > 0, "ETH amount must be greater than 0");
        require(address(this).balance >= ethAmount, "Insufficient ETH balance");
        
        uint256 protocolFee = (ethAmount * protocolFeeRate) / 10000;
        uint256 netAmount = ethAmount - protocolFee;
        
        // Update state
        totalSold -= tokenAmount;
        totalRaised -= netAmount;
        
        // Transfer tokens from seller to this contract
        token.transferFrom(msg.sender, address(this), tokenAmount);
        
        // Send ETH to seller
        payable(msg.sender).transfer(netAmount);
        
        // Send protocol fee to treasury
        if (protocolFee > 0) {
            payable(treasury).transfer(protocolFee);
        }
        
        emit TokensSold(msg.sender, tokenAmount, ethAmount, currentPrice);
    }

    function getCurrentPrice() public view returns (uint256) {
        return basePrice + (totalSold * slope) / 1e18;
    }

    function getBuyPrice(uint256 tokenAmount) external view returns (uint256) {
        uint256 currentPrice = getCurrentPrice();
        return (tokenAmount * currentPrice) / 1e18;
    }

    function getSellPrice(uint256 tokenAmount) external view returns (uint256) {
        uint256 currentPrice = getCurrentPrice();
        return (tokenAmount * currentPrice) / 1e18;
    }

    function getTokenAmountForETH(uint256 ethAmount) external view returns (uint256) {
        uint256 currentPrice = getCurrentPrice();
        return (ethAmount * 1e18) / currentPrice;
    }

    function getETHAmountForTokens(uint256 tokenAmount) external view returns (uint256) {
        uint256 currentPrice = getCurrentPrice();
        return (tokenAmount * currentPrice) / 1e18;
    }

    function pauseTrading() external onlyOwner {
        tradingPaused = true;
        emit TradingPaused();
    }

    function resumeTrading() external onlyOwner {
        tradingPaused = false;
        emit TradingResumed();
    }

    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        payable(owner()).transfer(balance);
    }

    function withdrawTokens() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        token.transfer(owner(), balance);
    }

    // Fallback function to receive ETH
    receive() external payable {}
}