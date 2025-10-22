// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// A minimal native-ETH safe transfer helper for demonstration.
library SafeTransferLib {
    function safeTransferETH(address to, uint256 amount) internal {
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "SafeTransferLib: ETH transfer failed");
    }

    function balance(address account) internal view returns (uint256) {
        return account.balance;
    }
}