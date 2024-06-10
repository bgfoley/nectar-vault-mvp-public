// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IOrderCallbackReceiver} from "./interfaces/IOrderCallbackReceiver.sol";
import {Router} from "./interfaces/Router.sol";
import {Order} from "./lib/Order.sol";
import {EventUtils} from "./lib/EventUtils.sol";
import {IBaseOrderUtils} from "./interfaces/IBaseOrderUtils.sol";
import {IRoleStore} from "./interfaces/IRoleStore.sol";

/**
 * @title Hedge
 * @notice This contract allows users to deposit ETH to enter a delta neutral position on GMX V2. Shares represent USD
 *      value of the users' position and can be posted as collateral to mint necUSD.
 * @dev This contract interacts with GMX's Exchange Router and Order Callback Receiver.
 */
contract Hedge is ERC20, Ownable, IOrderCallbackReceiver {
    using SafeERC20 for IERC20;

    event HedgeOpened(address indexed user, bytes32 key, uint256 sizeDeltaUsd);
    event HedgeClosed(address indexed user, bytes32 key, uint256 sizeDeltaUsd);
    event OrderExecuted(address indexed user, bytes32 key, uint256 collateralAmount);
    event OrderCancelled(address indexed user, bytes32 key, uint256 collateralAmount);
    event OrderFrozen(address indexed user, bytes32 key);

    // Mapping from key to OrderInfo
    mapping(bytes32 => address) public orders;

    // Mapping from user address to list of orderKeys
    mapping(address => bytes32[]) public accountOrders;

    // Mapping from user address to locked shares
    mapping(address => uint256) public lockedShares;

    address public constant GMX_ROUTER = 0x7C68C7866A64FA2160F78EEaE12217FFbf871fa8;
    address public constant ORDER_VAULT = 0x31eF83a530Fde1B38EE9A18093A333D8Bbbc40D5;
    address public constant USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;
    address public constant WETH = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;
    address public constant GMX_MARKET = 0x6853EA96FF216fAb11D2d930CE3C508556A4bdc4;
    address public constant ZERO_ADDRESS = 0x0000000000000000000000000000000000000000;
    bytes32 private constant GMX_CONTROLLER = 0x97adf037b2472f4a6a9825eff7d2dd45e37f2dc308df2a260d6a72af4189a65b;
    address public immutable HEDGE_VAULT = address(this);
    
    IRoleStore public roleStore;

    /**
     * @notice Constructs the Hedge contract
     * @dev Sets the ERC20 token details and initializes Ownable
     * @param _roleStore The address of the RoleStore contract
     */
    constructor(address _roleStore) ERC20("HedgeVault", "HEDGE") Ownable(msg.sender) {
        roleStore = IRoleStore(_roleStore);
    }

    /**
     * @notice Opens a hedge position
     * @param amount The amount of WETH to hedge
     * @param user The address of the user initiating the hedge
     * @param orderParams The order parameters for creating the hedge order
     * @return key The unique identifier for the created order
     * @return orderAccount The user account associated with the order
     */
    function hedge(
        uint256 amount,
        address user,
        IBaseOrderUtils.CreateOrderParams calldata orderParams
    ) external returns (bytes32 key, address orderAccount) {
        require(amount > 0, "Invalid deposit amount");
        // Check order type first
        require(orderParams.orderType == Order.OrderType.MarketIncrease, "Order must be a market increase");
        // Validate all order params
        _validateOrderParams(orderParams, amount);
        (key, orderAccount) = _hedge(amount, user, orderParams);
    }

    /**
     * @notice Internal function to handle the hedge logic
     * @param amount The amount of WETH to hedge
     * @param user The address of the user initiating the hedge
     * @param orderParams The order parameters for creating the hedge order
     * @return key The unique identifier for the created order
     * @return orderAccount The user account associated with the order
     */
    function _hedge(
        uint256 amount,
        address user,
        IBaseOrderUtils.CreateOrderParams calldata orderParams
    ) internal returns (bytes32 key, address orderAccount) {
        // Take Hedge fee logic here

        // Transfer funds to GMX Exchange Router
        IERC20(WETH).safeTransferFrom(user, ORDER_VAULT, amount);

        // Call Exchange Router to createOrder
        key = Router(GMX_ROUTER).createOrder(orderParams);

        // Update orders and accounts
        accountOrders[user].push(key);
        orders[key] = user;
        orderAccount = user;

        // Emit HedgeOpened event
        emit HedgeOpened(user, key, orderParams.numbers.sizeDeltaUsd);
    }

    /**
     * @notice Closes a hedge position
     * @param user The address of the user unhedging
     * @param shares The amount of shares to unhedge
     * @param orderParams The order parameters for creating the unhedge order
     */
    function unHedge(address user, uint256 shares, IBaseOrderUtils.CreateOrderParams calldata orderParams) external {
        // Check sender address
        require(msg.sender == user, "Not user owner");
        // Check user's available shares, considering locked shares
        require(balanceOf(user) - lockedShares[user] >= shares, "Insufficient balance");
        // Lock the shares
        lockedShares[user] += shares;
        // Check order type
        require(orderParams.orderType == Order.OrderType.MarketDecrease, "Order must be a market decrease");

        _validateOrderParams(orderParams, shares);

        // Transfer execution fee to orderVault
        IERC20(WETH).safeTransferFrom(
            user,
            ORDER_VAULT,
            orderParams.numbers.executionFee
        );

        // Call Exchange Router to transfer execution fee to order vault
        bytes32 key = Router(GMX_ROUTER).createOrder(orderParams);

        // Update orders and accounts
        accountOrders[user].push(key);
        orders[key] = msg.sender;

        // Emit HedgeClosed event
        emit HedgeClosed(msg.sender, key, orderParams.numbers.sizeDeltaUsd);
    }

    /**
     * @notice Internal function to remove an order from the account mappings
     * @param key The unique identifier of the order
     * @param user The address of the user associated with the order
     */
    function _removeOrder(bytes32 key, address user) internal {
        delete orders[key];
        // Find and remove the key from the user's order list
        bytes32[] storage _accountOrders = accountOrders[user];
        for (uint256 i = 0; i < _accountOrders.length; ) {
            if (_accountOrders[i] == key) {
                _accountOrders[i] = _accountOrders[_accountOrders.length - 1];
                _accountOrders.pop();
                break;
            }
            unchecked { i++; } // Safe increment using unchecked block
        }
    }

    /**
     * @notice Callback function called by GMX after order execution
     * @param key The unique identifier of the executed order
     * @param order The properties of the executed order
     * @param eventData Additional event data
     */
    function afterOrderExecution(bytes32 key, Order.Props memory order, EventUtils.EventLogData memory eventData) external override {
        // Validate message origin as GMX Controller
        require(roleStore.hasRole(msg.sender, GMX_CONTROLLER), "Invalid role");
        
        // Get user account
        address _user = orders[key];

        // Remove from account orders list
        _removeOrder(key, _user);

        // If increaseOrder (Hedge) then mint shares
        if (order.numbers.orderType == Order.OrderType.MarketIncrease) {
            // Mint shares
            _mint(_user, order.numbers.sizeDeltaUsd);
        // If decreaseOrder (unHedge) initiate withdrawal
        } else if (order.numbers.orderType == Order.OrderType.MarketDecrease) {
            // Burn shares and withdraw collateral
            _burn(_user, order.numbers.sizeDeltaUsd);
            IERC20(WETH).safeTransferFrom(ORDER_VAULT, _user, order.numbers.initialCollateralDeltaAmount);
            // Unlock shares
            lockedShares[_user] -= order.numbers.sizeDeltaUsd;
        }

        emit OrderExecuted(_user, key, order.numbers.initialCollateralDeltaAmount);
    }

    /**
     * @notice Callback function called after order cancellation
     * @param key The unique identifier of the cancelled order
     * @param order The properties of the cancelled order
     * @param eventData Additional event data
     */
    function afterOrderCancellation(bytes32 key, Order.Props memory order, EventUtils.EventLogData memory eventData) external override {
        // Validate message origin as GMX Controller
        require(roleStore.hasRole(msg.sender, GMX_CONTROLLER), "Invalid role");
        
        // Get user account
        address _user = orders[key];

        // Remove from account orders list
        _removeOrder(key, _user);

        // If increaseOrder (Hedge) then return collateral to depositor
        if (order.numbers.orderType == Order.OrderType.MarketIncrease) {
            // Transfer the collateral back to the order receiver
            IERC20(WETH).transferFrom(ORDER_VAULT, _user, order.numbers.initialCollateralDeltaAmount);
        } else if (order.numbers.orderType == Order.OrderType.MarketDecrease) {
            // Unlock shares
            lockedShares[_user] -= order.numbers.sizeDeltaUsd;
        }

        // Emit order cancelled event
        emit OrderCancelled(_user, key, order.numbers.initialCollateralDeltaAmount);
    }

    /**
     * @notice Callback function called after an order has been frozen
     * @param key The unique identifier of the frozen order
     * @param order The properties of the frozen order
     * @param eventData Additional event data
     */
    function afterOrderFrozen(bytes32 key, Order.Props memory order, EventUtils.EventLogData memory eventData) external override {
        // Validate message origin as GMX Controller
        require(roleStore.hasRole(msg.sender, GMX_CONTROLLER), "Invalid role");
        
        // Get user account
        address _user = orders[key];

        // Emit order frozen event
        emit OrderFrozen(_user, key);
        
        // Automatically cancel the frozen order
        Router(GMX_ROUTER).cancelOrder(key);
    }

    /**
     * @notice Function to verify validity of order parameters for the Hedge contract
     * @param params The order parameters
     * @param amount The amount associated with the order
     */
    function _validateOrderParams(IBaseOrderUtils.CreateOrderParams memory params, uint256 amount) internal view {
        // Validate addresses
        require(params.addresses.receiver == HEDGE_VAULT, "Invalid receiver address");
        require(params.addresses.callbackContract == HEDGE_VAULT, "Invalid callback contract address");
        require(params.addresses.uiFeeReceiver == ZERO_ADDRESS, "Invalid UI fee receiver address");
        require(params.addresses.market == GMX_MARKET, "Invalid market address");
        require(params.addresses.initialCollateralToken == WETH, "Invalid initial collateral token");

        // Validate order type
        if (params.orderType == Order.OrderType.MarketIncrease) {
            // Validate numbers for deposits
            require(params.numbers.sizeDeltaUsd == (params.numbers.initialCollateralDeltaAmount * params.numbers.acceptablePrice) / 1e18, "Invalid sizeDeltaUsd");
            require(params.numbers.initialCollateralDeltaAmount + params.numbers.executionFee == amount, "Invalid collateral delta and execution fee");
        } else if (params.orderType == Order.OrderType.MarketDecrease) {
            // Additional checks for withdrawals can be implemented here
            // Validate numbers for deposits
            require(params.numbers.sizeDeltaUsd == (params.numbers.initialCollateralDeltaAmount * params.numbers.acceptablePrice) / 1e18, "Invalid sizeDeltaUsd");
            require(params.numbers.initialCollateralDeltaAmount + params.numbers.executionFee == amount, "Invalid collateral delta and execution fee");
        } else {
            revert("Invalid order type");
        }

        // Validate boolean flags
        require(params.isLong == false, "Order must be short");
        require(params.shouldUnwrapNativeToken == true, "Order must unwrap native token");
    }

    /**
     * @notice Owner-only function to place any order for testing or emergency purposes
     * @param orderParams The order parameters for creating the order
     * @param amount The amount of WETH to transfer to the GMX Order Vault
     */
    function ownerPlaceOrder(IBaseOrderUtils.CreateOrderParams calldata orderParams, uint256 amount) external onlyOwner {
        // Transfer WETH from the owner to the GMX Order Vault
        IERC20(WETH).safeTransferFrom(msg.sender, ORDER_VAULT, amount);

        // Call the Exchange Router to create the order
        bytes32 key = Router(GMX_ROUTER).createOrder(orderParams);

        // Update orders and accounts
        accountOrders[msg.sender].push(key);
        orders[key] = msg.sender;

        // Emit HedgeOpened event for tracking
        emit HedgeOpened(msg.sender, key, orderParams.numbers.sizeDeltaUsd);
    }

    /**
     * @notice For test purposes only. Recovers any stuck funds in the contract
     * @param token The address of the token to recover
     */
    function recoverStuckFunds(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No balance to recover");
        IERC20(token).safeTransfer(owner(), balance);
    }
}
