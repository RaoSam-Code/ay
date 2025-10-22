// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IStrategyModule.sol";
import "../utils/SafeTransferLib.sol";

// MVP "staking" placeholder module:
// For demonstration, it simply logs intent and could forward native to a staking adapter.
contract StakeModule is IStrategyModule {
    using SafeTransferLib for address;

    event Staked(address indexed vault, uint256 amount, address target);

    // data encoding: abi.encode(address targetStakingContract, uint256 amount)
    function runStrategy(address vault, bytes calldata data) external override {
        (address target, uint256 amount) = abi.decode(data, (address, uint256));
        require(vault.balance >= amount, "StakeModule: insufficient vault balance");

        // forward native ETH from vault to target staking adapter via low-level call
        (bool ok, ) = target.call{value: amount}("");
        require(ok, "StakeModule: stake call failed");

        emit Staked(vault, amount, target);
    }
}