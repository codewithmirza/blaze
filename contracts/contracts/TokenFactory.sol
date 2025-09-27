// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BlazeToken.sol";
import "./BondingCurve.sol";

contract TokenFactory is Ownable {
    struct TokenInfo {
        address tokenAddress;
        address bondingCurveAddress;
        address creator;
        uint256 createdAt;
    }

    mapping(address => TokenInfo) public tokens;
    mapping(string => bool) public usedSymbols;
    
    uint256 public protocolFeeRate = 100; // 1% (100 basis points)
    address public treasury;
    
    event TokenCreated(
        address indexed tokenAddress,
        address indexed bondingCurveAddress,
        address indexed creator,
        string name,
        string symbol,
        uint256 totalSupply
    );

    constructor(address _treasury) {
        treasury = _treasury;
        _transferOwnership(msg.sender);
    }

    function createToken(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint256 basePrice,
        uint256 slope
    ) external returns (address tokenAddress, address bondingCurveAddress) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(!usedSymbols[symbol], "Symbol already exists");
        require(totalSupply > 0, "Total supply must be greater than 0");
        require(basePrice > 0, "Base price must be greater than 0");
        require(slope > 0, "Slope must be greater than 0");

        usedSymbols[symbol] = true;

        // Deploy the token with TokenFactory as owner initially
        BlazeToken token = new BlazeToken(name, symbol, totalSupply, address(this));
        tokenAddress = address(token);

        // Deploy the bonding curve
        BondingCurve bondingCurve = new BondingCurve(
            tokenAddress,
            basePrice,
            slope,
            protocolFeeRate,
            treasury
        );
        bondingCurveAddress = address(bondingCurve);

        // Transfer ownership of token to bonding curve
        token.transferOwnership(bondingCurveAddress);

        // Store token info
        tokens[tokenAddress] = TokenInfo({
            tokenAddress: tokenAddress,
            bondingCurveAddress: bondingCurveAddress,
            creator: msg.sender,
            createdAt: block.timestamp
        });

        emit TokenCreated(
            tokenAddress,
            bondingCurveAddress,
            msg.sender,
            name,
            symbol,
            totalSupply
        );

        return (tokenAddress, bondingCurveAddress);
    }

    function getTokenInfo(address tokenAddress) external view returns (TokenInfo memory) {
        return tokens[tokenAddress];
    }

    function setProtocolFeeRate(uint256 _protocolFeeRate) external onlyOwner {
        require(_protocolFeeRate <= 1000, "Protocol fee rate cannot exceed 10%");
        protocolFeeRate = _protocolFeeRate;
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Treasury cannot be zero address");
        treasury = _treasury;
    }
}