// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.30;

import {IMiniAMM, IMiniAMMEvents} from "./IMiniAMM.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Add as many variables or functions as you would like
// for the implementation. The goal is to pass `forge test`.
contract MiniAMM is IMiniAMM, IMiniAMMEvents {
    uint256 public k = 0;
    uint256 public xReserve = 0;
    uint256 public yReserve = 0;

    address public tokenX;
    address public tokenY;

    // implement constructor
    constructor(address _tokenX, address _tokenY) {
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

    // add parameters and implement function.
    // this function will determine the initial 'k'.
    function _addLiquidityFirstTime(uint256 _xAmountIn, uint256 _yAmountIn) internal {
        xReserve = _xAmountIn;
        yReserve = _yAmountIn;
        k = xReserve * yReserve;
    }

    // add parameters and implement function.
    // this function will increase the 'k'
    // because it is transferring liquidity from users to this contract.
    function _addLiquidityNotFirstTime(uint256 _xAmountIn, uint256 _yAmountIn) internal {
        require(_yAmountIn == _xAmountIn * yReserve / xReserve);
        xReserve += _xAmountIn;
        yReserve += _yAmountIn;
        k = xReserve * yReserve;
    }

    // complete the function
    function addLiquidity(uint256 _xAmountIn, uint256 _yAmountIn) external {
        require(_xAmountIn != 0, "Amounts must be greater than 0");
        require(_yAmountIn != 0, "Amounts must be greater than 0");
        // Transfer tokens from user to this contract
        IERC20(tokenX).transferFrom(msg.sender, address(this), _xAmountIn);
        IERC20(tokenY).transferFrom(msg.sender, address(this), _yAmountIn);
        
        if (k == 0) {
            // add params
            _addLiquidityFirstTime(_xAmountIn, _yAmountIn);
        } else {
            // add params
            _addLiquidityNotFirstTime(_xAmountIn, _yAmountIn);
        }
    }

    // complete the function
    function swap(uint256 xAmountIn, uint256 yAmountIn) external {}
}
