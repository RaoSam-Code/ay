// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library MathUtils {
    function mulDiv(uint256 a, uint256 b, uint256 denominator) internal pure returns (uint256) {
        require(denominator != 0, "Math: div by zero");
        return (a * b) / denominator;
    }
}