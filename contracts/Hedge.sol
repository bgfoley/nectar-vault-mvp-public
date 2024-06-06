// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IOrderCallbackReceiver } from "./interfaces/IOrderCallbackReceiver.sol";

/// @dev Interface for GMX's Exchange Router 
/// @notice Switch this out for an import
interface Router {
    function sendWnt(uint256 sendWnt, address receiver, uint256 amount) external payable;
    function sendTokens(address token, address receiver, uint256 amount) external payable;
    function createOrder(CreateOrderParams calldata params) external returns (bytes32);
}

/// @dev ERC20 Standard interface
interface ERC20 {
    function balanceOf(address owner) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

/*
/// @dev Nectar's Deposit Vault interface
interface DepositVault {
    function deposited_event(uint256 amount0, address sender) external;
    function withdrawn_event(uint256 amount0, address sender) external;
    function canceled_event() external;
}
*/
contract Hedge is NectarVault, IOrderCallbackReceiver {

    using SafeERC20 for IERC20;

    /// @notice createOrderParamsAddresses for GMX orders
    /// @param receiver is Hedge Vault
    /// @param callbackContract is Hedge Vault
    /// @param uiFeeReceiver 0x0
    /// @param market is GMX market_key address 
    struct CreateOrderParamsAddresses {
        address receiver;
        address callbackContract;  
        address uiFeeReceiver; // 0x0000000000000000000000000000000000000000
        address market; // 0x70d95587d40A2caf56bd97485aB3Eec10Bee6336
        address initialCollateralToken;  //  WETH 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1
        address[] swapPath;
    }

    /// @notice createOrderParamsNumbers for GMX orders
    /// @param sizeDeltaUsd is order size, calculated by UI
    /// @param initialCollateralDeltaAmount 
    /// @param uiFeeReceiver 0x0
    /// @param market is GMX market_key address 
    struct CreateOrderParamsNumbers {
        uint256 sizeDeltaUsd;
        uint256 initialCollateralDeltaAmount;
        uint256 triggerPrice;
        uint256 acceptablePrice;
        uint256 executionFee;
        uint256 callbackGasLimit;
        uint256 minOutputAmount;
    }

    enum OrderType {
        MarketSwap,
        LimitSwap,
        MarketIncrease,
        LimitIncrease,
        MarketDecrease,
        LimitDecrease,
        StopLossDecrease,
        Liquidation
    }

    enum DecreasePositionSwapType {
        NoSwap,
        SwapPnlTokenToCollateralToken,
        SwapCollateralTokenToPnlToken
    }

    struct CreateOrderParams {
        CreateOrderParamsAddresses addresses;
        CreateOrderParamsNumbers numbers;
        OrderType orderType;
        DecreasePositionSwapType decreasePositionSwapType;
        bool isLong;
        bool shouldUnwrapNativeToken;
        bytes32 referralCode;
    }

    event HedgeOpened(address indexed account, bytes32 orderKey, uint256 sizeDeltaUsd);
    event HedgeClosed(address indexed account, bytes32 orderKey, uint256 sizeDeltaUsd);
    event OrderCancelled(address indexed account, bytes32 orderKey, uint256 sizeDeltaUsd);

    struct OrderInfo {
        uint256 orderSizeUsd;
        address account;
    }

    // Mapping from orderKey to OrderInfo
    mapping(bytes32 => address) public orders;

    // Mapping from user address to list of orderKeys
    mapping(address => bytes32[]) public accountOrders;

    // Available shares to mint
    mapping(address => uint256) public sharesToMint;

    address public constant GMX_ROUTER = 0x7C68C7866A64FA2160F78EEaE12217FFbf871fa8;
    address public constant ORDER_VAULT = 0x31eF83a530Fde1B38EE9A18093A333D8Bbbc40D5;
    address public constant USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;
    address public constant WETH = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;
    address public constant GMX_MARKET = 0x6853EA96FF216fAb11D2d930CE3C508556A4bdc4;
    address public immutable hedgeVault;

    constructor(address _hedgeVault) {
        hedgeVault = _hedgeVault;
    }

    function hedge(uint256 amount, address account, CreateOrderParams orderParams) external {
        require(amount > 0, "Invalid deposit amount");
        _hedge(amount, account, orderParams);
    }

    function _hedge(uint256 amount, address account, CreateOrderParams orderParams) internal returns (uint256, address) {
        
        // Take Hedge fee logic here

        // Transfer funds to GMX Exchange Router
        IERC20(WETH).safeTransferFrom(account, ORDER_VAULT, amount);

        // Call Exchange Router to createOrder
        bytes32 key = Router(GMX_ROUTER).createOrder(orderParams);
        
        // Update orders and accounts
        accountOrders[account].push(key);
        orders[key] = account;

        // Emit HedgeOpened event
        emit HedgeOpened(account, key, orderParams.numbers.sizeDeltaUsd);
    
    }

    function unHedge(uint256 shares, CreateOrderParams orderParams) external {

        // Check account's available shares
        require(sharesOfAccount(msg.sender) >= shares, "Insufficient balance");

        // Transfer execution fee to orderVault
        IERC20(WETH).safeTransferFrom(account, ORDER_VAULT, orderParams.numbers.executionFee);

        // Call Exchange Router to transfer execution fee to order vault
        bytes32 key = Router(GMX_ROUTER).createOrder(orderParams);

        // Update orders and accounts
        accountOrders[account].push(key);
        orders[key] = msg.sender;

        // Emit HedgeClosed event
        emit HedgeClosed(msg.sender, key, orderParams.numbers.sizeDeltaUsd);

    }

     // Internal function to remove an order
    function removeOrder(bytes32 key, address account) internal {
        delete orders[key];
        // Find and remove the key from the user's order list
        bytes32[] storage _accountOrders = accountOrders[account];
        for (uint256 i = 0; i < _accountOrders.length; i++) {
            if (_accountOrders[i] == key) {
                _accountOrders[i] = _accountOrders[_accountOrders.length - 1];
                _accountOrders.pop();
                break;
            }
        }
    }

    function afterOrderExecution(bytes32 key, Order.props memory order, EventUtils.EventLogData memory eventData) external override {

        // Get account
        address _account = orders[key];

        // Remove from account orders list
        removeOrder(key, _account);

        // Update state of account shares
        sharesToMint[_account] += order.numbers.sizeDeltaUsd;
    }

    function mint(uint256 shares, address receiver) public override returns (uint256) {
        require (sharesToMint[receiver] >= shares, "Insufficient available shares");

        // Update account's available shares
        sharesToMint[receiver] -= shares;

        // Mint shares
        _mint(receiver, shares);
    }

    

    /*
    function _deposit(uint256 amount, address account, CreateOrderParams orderParams) internal returns (uint256, address) {
        
        // Take Hedge fee logic here

        // Approve exchange router for WETH transfer
        IERC20(WETH).approve(GMX_ROUTER, amount);

        // Transfer funds to GMX Exchange Router
        Router(GMX_ROUTER).sendWnt(DEPOSIT_VAULT, amount);

        // Call Exchange Router to transfer execution fee to order vault
        bytes32 key = Router(GMX_ROUTER).createOrder(orderParams);
        
        // Update orders and accounts
        accountOrders[account].push(key);
        orders[key] = account;

        // Emit HedgeOpened event
        emit HedgeOpened(account, key, orderParams.numbers.sizeDeltaUsd);
*/    

/*
    /// 
    /// @param amount0
    /// @param orderParams 
    /// @param sender 
    /// @return 
    /// @return 

    function hedge(uint256 amount, CreateOrderParams calldata orderParams, address account) external returns (uint256, bytes32) {
        
        // Transfer tokens to GMX_ROUTER
        _safeTransferFrom(WETH, account, GMX_ROUTER, amount);

        // Call createOrder on the GMX_ROUTER and store the returned orderKey
        bytes32 orderKey = Router(GMX_ROUTER).createOrder(orderParams);

        // Store the order info
        orderKeys[sender] = orderKey;

        uint256 hedgeSize = orderParams.sizeDeltaUsd;

        unclaimedShares[sender] += hedgeSize;

        // Emit HedgeOpened event
        emit HedgeOpened(sender, orderKey, hedgeSize);

        // Return the orderKey and sizeDeltaUsd
        return (orderParams.sizeDeltaUsd, orderKey);
    }

*/    



}

