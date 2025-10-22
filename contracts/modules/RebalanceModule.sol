// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IStrategyModule.sol";

// MVP rebalance placeholder: emits event and assumes off-chain automation determines when to trigger.
contract RebalanceModule is IStrategyModule {
    event Rebalanced(address indexed vault, uint256 thresholdBps, address from, address to);

    // data encoding: abi.encode(uint256 thresholdBps, address fromAssetAdapter, address toAssetAdapter, uint256 amount)
    function runStrategy(address vault, bytes calldata data) external override {
        (uint256 thresholdBps, address fromAdapter, address toAdapter, uint256 amount) =
            abi.decode(data, (uint256, address, address, uint256));

        // In a real module, check APY sources via oracles/adapters and move funds accordingly.
        // Here, we just emit an event to prove execution.
        emit Rebalanced(vault, thresholdBps, fromAdapter, toAdapter);

        // For MVP: pretend moving funds by calling adapters (omitted to keep safe/simplified).
        // e.g., IAdapter(fromAdapter).withdraw(amount); IAdapter(toAdapter).deposit(amount);
    }
}