// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

// Minimal placeholder for vault-level governance.
// For MVP: store proposed strategy address and allow manager (or governance token holders later) to accept it.
contract VaultGovernor is Ownable {
    address public proposedStrategy;
    event StrategyProposed(address indexed proposer, address strategy);
    event StrategyAccepted(address indexed accepter, address strategy);

    function proposeStrategy(address strategy) external {
        proposedStrategy = strategy;
        emit StrategyProposed(msg.sender, strategy);
    }

    function acceptStrategy(address vault) external onlyOwner {
        // In a real implementation, we would call vault.updateStrategy(proposedStrategy)
        // using interface. Kept generic here to avoid circular imports.
        emit StrategyAccepted(msg.sender, proposedStrategy);
    }
}