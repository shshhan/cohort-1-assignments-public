// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.30;

import {IMiniAMM, IMiniAMMEvents} from "./IMiniAMM.sol";
import {MiniAMMLP} from "./MiniAMMLP.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Add as many variables or functions as you would like
// for the implementation. The goal is to pass `forge test`.
contract MiniAMM is IMiniAMM, IMiniAMMEvents, MiniAMMLP {
    uint256 public k = 0;
    uint256 public xReserve = 0;
    uint256 public yReserve = 0;

    address public tokenX;
    address public tokenY;

    uint256 private totalLpMinted;

    // implement constructor
    constructor(address _tokenX, address _tokenY) MiniAMMLP(_tokenX, _tokenY) {
        require(_tokenX != address(0), "tokenX cannot be zero address");
        require(_tokenY != address(0), "tokenY cannot be zero address");
        require(_tokenY != _tokenX, "Tokens must be different");

        if (_tokenX < _tokenY) {
            tokenX = _tokenX;
            tokenY = _tokenY;
        } else {
            tokenX = _tokenY;
            tokenY = _tokenX;
        }
    }

    // Helper function to calculate square root
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }

    // add parameters and implement function.
    // this function will determine the 'k'.
    function _addLiquidityFirstTime(uint256 xAmountIn, uint256 yAmountIn) internal returns (uint256 lpMinted) {
        return sqrt(xAmountIn * yAmountIn);
    }

    // add parameters and implement function.
    // this function will increase the 'k'
    // because it is transferring liquidity from users to this contract.
    function _addLiquidityNotFirstTime(uint256 xAmountIn, uint256 yAmountIn) internal returns (uint256 lpMinted) {
        require(yAmountIn == xAmountIn * yReserve / xReserve);
        return (totalLpMinted * xAmountIn) / xReserve;
    }

    // complete the function. Should transfer LP token to the user.
    function addLiquidity(uint256 xAmountIn, uint256 yAmountIn) external returns (uint256 lpMinted) {
        require(xAmountIn != 0, "Amounts must be greater than 0");
        require(yAmountIn != 0, "Amounts must be greater than 0");

        uint256 lpMinted;

        if(xReserve == 0 && yReserve == 0) {
            lpMinted = _addLiquidityFirstTime(xAmountIn, yAmountIn);
        } else {
            lpMinted = _addLiquidityNotFirstTime(xAmountIn, yAmountIn);
        }
        _mintLP(msg.sender, lpMinted);

        totalLpMinted += lpMinted;
        // Transfer tokens from user to this contract
        IERC20(tokenX).transferFrom(msg.sender, address(this), xAmountIn);
        IERC20(tokenY).transferFrom(msg.sender, address(this), yAmountIn);
        xReserve += xAmountIn;
        yReserve += yAmountIn;
        k = xReserve * yReserve;

        emit AddLiquidity(xAmountIn, yAmountIn);

    return lpMinted;
    }

    // Remove liquidity by burning LP tokens
    function removeLiquidity(uint256 lpAmount) external returns (uint256 xAmount, uint256 yAmount) {
        require(lpAmount > 0, "LP amount must be greater than 0");
        require(balanceOf(msg.sender) >= lpAmount, "Insufficient LP tokens");
        
        uint256 xWithdraw = (xReserve * lpAmount) / totalLpMinted;
        uint256 yWithdraw = (yReserve * lpAmount) / totalLpMinted;
        
        // Burn LP tokens first
        _burnLP(msg.sender, lpAmount);
        totalLpMinted -= lpAmount;
        
        // Update reserves
        xReserve -= xWithdraw;
        yReserve -= yWithdraw;
        k = xReserve * yReserve;
        
        // Transfer tokens back to user
        IERC20(tokenX).transfer(msg.sender, xWithdraw);
        IERC20(tokenY).transfer(msg.sender, yWithdraw);
        
        return (xWithdraw, yWithdraw);
    }

    // complete the function
    function swap(uint256 xAmountIn, uint256 yAmountIn) external {
        require(k > 0, "No liquidity in pool");
        require(xAmountIn == 0 || yAmountIn == 0, "Can only swap one direction at a time");
        require(xAmountIn + yAmountIn != 0, "Must swap at least one token");
        require(xAmountIn < xReserve, "Insufficient liquidity");
        require(yAmountIn < yReserve, "Insufficient liquidity");

        uint256 xAmountOut = 0;
        uint256 yAmountOut = 0;

        if (xAmountIn > 0) {
            // Apply 0.3% fee: amountInWithFee = xAmountIn * 997 / 1000
            uint256 xAmountInWithFee = xAmountIn * 997;
            uint256 numerator = xAmountInWithFee * yReserve;
            uint256 denominator = (xReserve * 1000) + xAmountInWithFee;
            yAmountOut = numerator / denominator;
            
            require(yAmountOut > 0, "Insufficient output amount");
            require(yAmountOut < yReserve, "Insufficient liquidity");
            
            IERC20(tokenX).transferFrom(msg.sender, address(this), xAmountIn);
            IERC20(tokenY).transfer(msg.sender, yAmountOut);
            xReserve += xAmountIn;
            yReserve -= yAmountOut;

        } else {
            // Apply 0.3% fee: amountInWithFee = yAmountIn * 997 / 1000
            uint256 yAmountInWithFee = yAmountIn * 997;
            uint256 numerator = yAmountInWithFee * xReserve;
            uint256 denominator = (yReserve * 1000) + yAmountInWithFee;
            xAmountOut = numerator / denominator;
            
            require(xAmountOut > 0, "Insufficient output amount");
            require(xAmountOut < xReserve, "Insufficient liquidity");

            IERC20(tokenY).transferFrom(msg.sender, address(this), yAmountIn);
            IERC20(tokenX).transfer(msg.sender, xAmountOut);
            xReserve -= xAmountOut;
            yReserve += yAmountIn;
        }
        
        // Update k after swap
        k = xReserve * yReserve;

        emit Swap(xAmountIn, yAmountIn, xAmountOut, yAmountOut);
    }
}
