// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BlazeToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens max
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million initial supply
    
    bool public tradingEnabled = false;
    address public bondingCurve;
    
    event TradingEnabled();
    event BondingCurveSet(address indexed bondingCurve);

    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address initialOwner
    ) ERC20(name, symbol) {
        require(totalSupply <= MAX_SUPPLY, "Total supply exceeds maximum");
        require(totalSupply >= INITIAL_SUPPLY, "Total supply below minimum");
        
        _mint(initialOwner, totalSupply);
        _transferOwnership(initialOwner);
    }

    function setBondingCurve(address _bondingCurve) external onlyOwner {
        require(_bondingCurve != address(0), "Bonding curve cannot be zero address");
        bondingCurve = _bondingCurve;
        emit BondingCurveSet(_bondingCurve);
    }

    function enableTrading() external onlyOwner {
        require(bondingCurve != address(0), "Bonding curve not set");
        tradingEnabled = true;
        emit TradingEnabled();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._beforeTokenTransfer(from, to, amount);
        
        // Allow minting and initial distribution
        if (from == address(0) || to == address(0)) {
            return;
        }
        
        // Only allow transfers if trading is enabled or if it's the bonding curve
        require(
            tradingEnabled || from == bondingCurve || to == bondingCurve,
            "Trading not enabled"
        );
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Mint would exceed max supply");
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}