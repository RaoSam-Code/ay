// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IStrategyModule {
    // data is a flexible payload for parameters (amounts, thresholds, addresses)
    function runStrategy(address vault, bytes calldata data) external;
}