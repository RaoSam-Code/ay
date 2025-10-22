// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IStrategyModule.sol";

// MVP lending placeholder module.
contract LendingModule is IStrategyModule {
    event Lent(address indexed vault, address indexed protocol, uint256 amount);
    event Unlent(address indexed vault, address indexed protocol, uint256 amount);

    // data encoding:
    // mode == 0 => lend; abi.encode(uint8 mode, address protocol, uint256 amount)
    // mode == 1 => unlend; abi.encode(uint8 mode, address protocol, uint256 amount)
    function runStrategy(address vault, bytes calldata data) external override {
        (uint8 mode, address protocol, uint256 amount) = abi.decode(data, (uint8, address, uint256));

        if (mode == 0) {
            // call protocol deposit (omitted)
            emit Lent(vault, protocol, amount);
        } else {
            // call protocol withdraw (omitted)
            emit Unlent(vault, protocol, amount);
        }
    }
}