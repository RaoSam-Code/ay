// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVault {
    function totalAssets() external view returns (uint256);
    function manager() external view returns (address);
}