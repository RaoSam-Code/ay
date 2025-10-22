// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./StrategyVault.sol";

contract StrategyVaultFactory {
    address public owner;
    address[] public allVaults;

    event VaultCreated(address indexed vault, address indexed manager, string name, string symbol, address strategyModule);

    modifier onlyOwner() {
        require(msg.sender == owner, "Factory: not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createVault(
        string memory _name,
        string memory _symbol,
        address _strategyModule
    ) external returns (address) {
        StrategyVault vault = new StrategyVault(_name, _symbol, msg.sender, _strategyModule);
        allVaults.push(address(vault));
        emit VaultCreated(address(vault), msg.sender, _name, _symbol, _strategyModule);
        return address(vault);
    }

    function getAllVaults() external view returns (address[] memory) {
        return allVaults;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }
}