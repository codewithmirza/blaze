// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Treasury is Ownable {
    event ETHReceived(address indexed from, uint256 amount);
    event ETHWithdrawn(address indexed to, uint256 amount);
    event TokenWithdrawn(address indexed token, address indexed to, uint256 amount);

    constructor() Ownable(msg.sender) {
        // msg.sender is passed as initialOwner to Ownable
    }

    // Function to receive ETH
    receive() external payable {
        emit ETHReceived(msg.sender, msg.value);
    }

    function withdrawETH(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Insufficient ETH balance");

        payable(to).transfer(amount);
        emit ETHWithdrawn(to, amount);
    }

    function withdrawToken(address tokenAddress, address to, uint256 amount) external onlyOwner {
        require(tokenAddress != address(0), "Invalid token address");
        require(to != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than 0");

        IERC20 token = IERC20(tokenAddress);
        require(token.balanceOf(address(this)) >= amount, "Insufficient token balance");

        token.transfer(to, amount);
        emit TokenWithdrawn(tokenAddress, to, amount);
    }

    function getETHBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getTokenBalance(address tokenAddress) external view returns (uint256) {
        IERC20 token = IERC20(tokenAddress);
        return token.balanceOf(address(this));
    }
}