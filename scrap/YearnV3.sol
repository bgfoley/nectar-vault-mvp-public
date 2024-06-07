// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";

interface IStrategy {
    function asset() external view returns (address);
    function balanceOf(address owner) external view returns (uint256);
    function convertToAssets(uint256 shares) external view returns (uint256);
    function convertToShares(uint256 assets) external view returns (uint256);
    function previewWithdraw(uint256 assets) external view returns (uint256);
    function maxDeposit(address receiver) external view returns (uint256);
    function deposit(uint256 assets, address receiver) external returns (uint256);
    function maxRedeem(address owner) external view returns (uint256);
    function redeem(uint256 shares, address receiver, address owner) external returns (uint256);
}

interface IAccountant {
    function report(address strategy, uint256 gain, uint256 loss) external returns (uint256, uint256);
}

interface IDepositLimitModule {
    function available_deposit_limit(address receiver) external view returns (uint256);
}

interface IWithdrawLimitModule {
    function available_withdraw_limit(address owner, uint256 max_loss, address[] calldata strategies) external view returns (uint256);
}

interface IFactory {
    function protocol_fee_config() external view returns (uint16, address);
}

// Enums
enum Roles {
    ADD_STRATEGY_MANAGER,
    REVOKE_STRATEGY_MANAGER,
    FORCE_REVOKE_MANAGER,
    ACCOUNTANT_MANAGER,
    QUEUE_MANAGER,
    REPORTING_MANAGER,
    DEBT_MANAGER,
    MAX_DEBT_MANAGER,
    DEPOSIT_LIMIT_MANAGER,
    WITHDRAW_LIMIT_MANAGER,
    MINIMUM_IDLE_MANAGER,
    PROFIT_UNLOCK_MANAGER,
    DEBT_PURCHASER,
    EMERGENCY_MANAGER
}

enum StrategyChangeType {
    ADDED,
    REVOKED
}

enum Rounding {
    ROUND_DOWN,
    ROUND_UP
}

// Structs
struct StrategyParams {
    uint256 activation;
    uint256 last_report;
    uint256 current_debt;
    uint256 max_debt;
}

contract YearnVaultV3 is IERC20, IERC20Metadata, IERC20Permit {

    // Constants
    uint256 public constant MAX_QUEUE = 10;
    uint256 public constant MAX_BPS = 10000;
    uint256 public constant MAX_BPS_EXTENDED = 1000000000000;
    string public constant API_VERSION = "3.0.2";

    // Storage variables
    address public asset;
    uint8 public decimals;
    address public factory;
    mapping(address => StrategyParams) public strategies;
    address[] public default_queue;
    bool public use_default_queue;

    // Accounting variables
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;
    uint256 public total_debt;
    uint256 public total_idle;
    uint256 public minimum_total_idle;
    uint256 public deposit_limit;

    // Periphery contracts
    address public accountant;
    address public deposit_limit_module;
    address public withdraw_limit_module;

    // Role management
    mapping(address => Roles) public roles;
    address public role_manager;
    address public future_role_manager;

    // ERC20 metadata
    string public name;
    string public symbol;

    // State variables
    bool public shutdown;
    uint256 public profit_max_unlock_time;
    uint256 public full_profit_unlock_date;
    uint256 public profit_unlocking_rate;
    uint256 public last_profit_update;
    mapping(address => uint256) public nonces;

    bytes32 public constant DOMAIN_TYPE_HASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 public constant PERMIT_TYPE_HASH = keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

    // Events
    event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    event Transfer(address indexed sender, address indexed receiver, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event StrategyChanged(address indexed strategy, StrategyChangeType indexed change_type);
    event StrategyReported(address indexed strategy, uint256 gain, uint256 loss, uint256 current_debt, uint256 protocol_fees, uint256 total_fees, uint256 total_refunds);
    event DebtUpdated(address indexed strategy, uint256 current_debt, uint256 new_debt);
    event RoleSet(address indexed account, Roles indexed role);
    event UpdateRoleManager(address indexed role_manager);
    event UpdateAccountant(address indexed accountant);
    event UpdateDepositLimitModule(address indexed deposit_limit_module);
    event UpdateWithdrawLimitModule(address indexed withdraw_limit_module);
    event UpdateDefaultQueue(address[] new_default_queue);
    event UpdateUseDefaultQueue(bool use_default_queue);
    event UpdatedMaxDebtForStrategy(address indexed sender, address indexed strategy, uint256 new_debt);
    event UpdateDepositLimit(uint256 deposit_limit);
    event UpdateMinimumTotalIdle(uint256 minimum_total_idle);
    event UpdateProfitMaxUnlockTime(uint256 profit_max_unlock_time);
    event DebtPurchased(address indexed strategy, uint256 amount);
    event Shutdown();

    constructor() {
        asset = address(this);
    }

    function initialize(
        address _asset,
        string calldata _name,
        string calldata _symbol,
        address _role_manager,
        uint256 _profit_max_unlock_time
    ) external {
        require(asset == address(0), "initialized");
        require(_asset != address(0), "ZERO ADDRESS");
        require(_role_manager != address(0), "ZERO ADDRESS");

        asset = _asset;
        decimals = IERC20Metadata(_asset).decimals();

        factory = msg.sender;

        require(_profit_max_unlock_time <= 31_556_952, "profit unlock time too long");
        profit_max_unlock_time = _profit_max_unlock_time;

        name = _name;
        symbol = _symbol;
        role_manager = _role_manager;
    }

    // Share management and ERC20 functions (e.g. balanceOf, totalSupply, transfer, etc.)
    // Internal helper functions for accounting, reporting, and more...

    // Other functions (deposit, withdraw, setAccountant, addRole, etc.)

    // Placeholder for all functions to ensure Solidity compiles. Implement all necessary logic from Vyper code.
    // Note: Additional adjustments might be needed to fully translate all Vyper functionalities to Solidity.
}
