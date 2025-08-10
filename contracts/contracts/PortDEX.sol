// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PortDEX is Ownable {
    // Events
    event LiquidityAdded(address indexed provider, address indexed token, uint256 amount);
    event LiquidityRemoved(address indexed provider, address indexed token, uint256 amount);
    event TokensSwapped(address indexed trader, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);
    
    // Structure to hold liquidity pool info
    struct PoolInfo {
        uint256 tokenBalance;
        uint256 ethBalance;
        uint256 totalShares;
    }
    
    // Mapping of token addresses to their pool info
    mapping(address => PoolInfo) public pools;
    
    // Mapping of user addresses to their LP shares for each token
    mapping(address => mapping(address => uint256)) public liquidityShares;
    
    // Oracle contract address
    address public oracle;
    
    constructor(address _oracle) {
        oracle = _oracle;
    }
    
    // Add liquidity to a pool
    function addLiquidity(address _token, uint256 _tokenAmount) public payable {
        require(_tokenAmount > 0 && msg.value > 0, "Amounts must be greater than zero");
        
        // Transfer tokens from user to contract
        IERC20(_token).transferFrom(msg.sender, address(this), _tokenAmount);
        
        // Calculate liquidity shares
        uint256 shares;
        if (pools[_token].totalShares == 0) {
            // First liquidity provider
            shares = msg.value; // ETH amount as shares
        } else {
            // Calculate shares based on existing pool ratio
            shares = (msg.value * pools[_token].totalShares) / pools[_token].ethBalance;
        }
        
        // Update pool balances
        pools[_token].tokenBalance += _tokenAmount;
        pools[_token].ethBalance += msg.value;
        pools[_token].totalShares += shares;
        
        // Update user's liquidity shares
        liquidityShares[msg.sender][_token] += shares;
        
        emit LiquidityAdded(msg.sender, _token, _tokenAmount);
    }
    
    // Remove liquidity from a pool
    function removeLiquidity(address _token, uint256 _shares) public {
        require(_shares > 0, "Shares must be greater than zero");
        require(liquidityShares[msg.sender][_token] >= _shares, "Insufficient liquidity shares");
        
        // Calculate amounts to return
        uint256 tokenAmount = (_shares * pools[_token].tokenBalance) / pools[_token].totalShares;
        uint256 ethAmount = (_shares * pools[_token].ethBalance) / pools[_token].totalShares;
        
        // Update user's liquidity shares
        liquidityShares[msg.sender][_token] -= _shares;
        
        // Update pool balances
        pools[_token].tokenBalance -= tokenAmount;
        pools[_token].ethBalance -= ethAmount;
        pools[_token].totalShares -= _shares;
        
        // Transfer tokens and ETH back to user
        IERC20(_token).transfer(msg.sender, tokenAmount);
        payable(msg.sender).transfer(ethAmount);
        
        emit LiquidityRemoved(msg.sender, _token, _shares);
    }
    
    // Swap ETH for tokens
    function swapEthForTokens(address _token) public payable {
        require(msg.value > 0, "ETH amount must be greater than zero");
        require(pools[_token].tokenBalance > 0, "Insufficient token liquidity");
        
        // Calculate token amount using constant product formula (x*y=k)
        uint256 ethInWithFee = (msg.value * 997) / 1000; // 0.3% fee
        uint256 tokenOut = (ethInWithFee * pools[_token].tokenBalance) / (pools[_token].ethBalance + ethInWithFee);
        
        require(tokenOut > 0 && tokenOut <= pools[_token].tokenBalance, "Invalid token amount");
        
        // Update pool balances
        pools[_token].ethBalance += msg.value;
        pools[_token].tokenBalance -= tokenOut;
        
        // Transfer tokens to user
        IERC20(_token).transfer(msg.sender, tokenOut);
        
        emit TokensSwapped(msg.sender, address(0), _token, msg.value, tokenOut);
    }
    
    // Swap tokens for ETH
    function swapTokensForEth(address _token, uint256 _tokenAmount) public {
        require(_tokenAmount > 0, "Token amount must be greater than zero");
        require(pools[_token].ethBalance > 0, "Insufficient ETH liquidity");
        
        // Transfer tokens from user to contract
        IERC20(_token).transferFrom(msg.sender, address(this), _tokenAmount);
        
        // Calculate ETH amount using constant product formula (x*y=k)
        uint256 tokenInWithFee = (_tokenAmount * 997) / 1000; // 0.3% fee
        uint256 ethOut = (tokenInWithFee * pools[_token].ethBalance) / (pools[_token].tokenBalance + tokenInWithFee);
        
        require(ethOut > 0 && ethOut <= pools[_token].ethBalance, "Invalid ETH amount");
        
        // Update pool balances
        pools[_token].tokenBalance += _tokenAmount;
        pools[_token].ethBalance -= ethOut;
        
        // Transfer ETH to user
        payable(msg.sender).transfer(ethOut);
        
        emit TokensSwapped(msg.sender, _token, address(0), _tokenAmount, ethOut);
    }
    
    // Get pool info for a token
    function getPoolInfo(address _token) public view returns (uint256, uint256, uint256) {
        PoolInfo memory pool = pools[_token];
        return (pool.tokenBalance, pool.ethBalance, pool.totalShares);
    }
    
    // Get user's liquidity shares for a token
    function getUserShares(address _user, address _token) public view returns (uint256) {
        return liquidityShares[_user][_token];
    }
}
