// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IStrategyModule.sol";
import "../utils/SafeTransferLib.sol";

contract StrategyVault is ERC20, ReentrancyGuard, Ownable {
    using SafeTransferLib for address;

    address public manager;
    IStrategyModule public strategy;
    address public baseAsset; // e.g., native ETH placeholder or ERC20; for MVP we'll treat native deposits

    uint256 public managementFeeBps; // e.g., 100 = 1%
    address public feeRecipient;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event StrategyExecuted(address indexed strategy, uint256 timestamp);
    event StrategyUpdated(address indexed oldStrategy, address indexed newStrategy);
    event FeeParamsUpdated(uint256 managementFeeBps, address feeRecipient);

    modifier onlyManager() {
        require(msg.sender == manager, "Vault: not manager");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _manager,
        address _strategyModule
    ) ERC20(_name, _symbol) {
        manager = _manager;
        strategy = IStrategyModule(_strategyModule);
        feeRecipient = _manager;
        managementFeeBps = 0;
        _transferOwnership(_manager);
    }

    // MVP: Native token deposits for simplicity
    receive() external payable {
        deposit();
    }

    function deposit() public payable nonReentrant {
        require(msg.value > 0, "Vault: zero deposit");
        _mint(msg.sender, msg.value);
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 shares) external nonReentrant {
        require(balanceOf(msg.sender) >= shares, "Vault: insufficient shares");
        _burn(msg.sender, shares);
        (bool ok, ) = msg.sender.call{value: shares}("");
        require(ok, "Vault: transfer failed");
        emit Withdrawn(msg.sender, shares);
    }

    // Executes module strategy (rebalance, stake, etc.)
    function executeStrategy(bytes calldata data) external onlyManager nonReentrant {
        strategy.runStrategy(address(this), data);
        emit StrategyExecuted(address(strategy), block.timestamp);
    }

    // Allow manager to update strategy module (could be gated by governance later)
    function updateStrategy(address newStrategy) external onlyManager {
        address old = address(strategy);
        strategy = IStrategyModule(newStrategy);
        emit StrategyUpdated(old, newStrategy);
    }

    function setFeeParams(uint256 _managementFeeBps, address _feeRecipient) external onlyManager {
        require(_managementFeeBps <= 500, "Vault: fee too high"); // cap at 5% for safety
        managementFeeBps = _managementFeeBps;
        feeRecipient = _feeRecipient;
        emit FeeParamsUpdated(_managementFeeBps, _feeRecipient);
    }

    // Accrue simple management fee from vault total supply (MVP: linear mint)
    function accrueManagementFee(uint256 amount) external onlyManager {
        require(feeRecipient != address(0), "Vault: no fee recipient");
        _mint(feeRecipient, amount);
    }

    // View helpers
    function totalAssets() public view returns (uint256) {
        return address(this).balance;
    }
}